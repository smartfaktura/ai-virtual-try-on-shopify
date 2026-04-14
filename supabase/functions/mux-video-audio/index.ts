import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { video_url, audio_url } = await req.json()
    if (!video_url || !audio_url) {
      return new Response(JSON.stringify({ error: 'video_url and audio_url required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Download both files
    const [videoResp, audioResp] = await Promise.all([
      fetch(video_url),
      fetch(audio_url),
    ])

    if (!videoResp.ok || !audioResp.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch source files' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const videoBytes = new Uint8Array(await videoResp.arrayBuffer())
    const audioBytes = new Uint8Array(await audioResp.arrayBuffer())

    // Write temp files
    const tmpDir = await Deno.makeTempDir()
    const videoPath = `${tmpDir}/input.mp4`
    const audioPath = `${tmpDir}/audio.mp3`
    const outputPath = `${tmpDir}/output.mp4`

    await Deno.writeFile(videoPath, videoBytes)
    await Deno.writeFile(audioPath, audioBytes)

    // Mux with ffmpeg
    const ffmpeg = new Deno.Command('ffmpeg', {
      args: [
        '-i', videoPath,
        '-i', audioPath,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-shortest',
        '-movflags', '+faststart',
        '-y',
        outputPath,
      ],
      stdout: 'piped',
      stderr: 'piped',
    })

    const { code, stderr } = await ffmpeg.output()
    if (code !== 0) {
      const errMsg = new TextDecoder().decode(stderr)
      console.error('ffmpeg error:', errMsg)
      return new Response(JSON.stringify({ error: 'Muxing failed', details: errMsg.slice(-500) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Upload to storage
    const outputBytes = await Deno.readFile(outputPath)
    const fileName = `muxed/${user.id}/${crypto.randomUUID()}.mp4`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('generated-videos')
      .upload(fileName, outputBytes, {
        contentType: 'video/mp4',
        upsert: false,
      })

    // Cleanup
    try { await Deno.remove(tmpDir, { recursive: true }) } catch { /* ignore */ }

    if (uploadError) {
      return new Response(JSON.stringify({ error: 'Upload failed', details: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create signed URL
    const { data: signedData } = await supabaseAdmin.storage
      .from('generated-videos')
      .createSignedUrl(fileName, 3600)

    return new Response(JSON.stringify({ url: signedData?.signedUrl, storage_path: fileName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('mux-video-audio error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
