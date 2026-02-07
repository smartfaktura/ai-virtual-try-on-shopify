import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MobileUpload() {
  const { sessionToken } = useParams<{ sessionToken: string }>();
  const [status, setStatus] = useState<'validating' | 'ready' | 'uploading' | 'done' | 'error' | 'expired'>('validating');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  useEffect(() => {
    if (!sessionToken) {
      setStatus('error');
      setErrorMsg('Invalid link');
      return;
    }

    // Validate session
    fetch(
      `${supabaseUrl}/functions/v1/mobile-upload?action=validate&token=${sessionToken}`,
      { headers: { apikey: supabaseKey } }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.expired) {
          setStatus('expired');
        } else if (data.valid) {
          setStatus('ready');
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Invalid or expired link');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Could not validate session');
      });
  }, [sessionToken, supabaseUrl, supabaseKey]);

  const handleUpload = async (file: File) => {
    if (!sessionToken || !file) return;

    setStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('session_token', sessionToken);
      formData.append('file', file);

      const res = await fetch(
        `${supabaseUrl}/functions/v1/mobile-upload?action=upload`,
        {
          method: 'POST',
          headers: { apikey: supabaseKey },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Upload failed');
      }

      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / brand */}
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">Product Upload</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Take a photo or choose from your gallery
          </p>
        </div>

        {/* States */}
        {status === 'validating' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Validating…</p>
          </div>
        )}

        {status === 'ready' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              size="lg"
              className="w-full h-20 text-base gap-3"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
            >
              <Camera className="w-6 h-6" />
              Take Photo
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-16 text-base gap-3"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
            >
              <Upload className="w-5 h-5" />
              Choose from Gallery
            </Button>
          </div>
        )}

        {status === 'uploading' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading your photo…</p>
          </div>
        )}

        {status === 'done' && (
          <div className="flex flex-col items-center gap-4 py-10 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium">Photo sent!</p>
              <p className="text-sm text-muted-foreground">
                It will appear on your desktop shortly. You can close this tab.
              </p>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 py-10">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
            <div className="text-center space-y-1">
              <p className="font-medium">Session expired</p>
              <p className="text-sm text-muted-foreground">
                Please scan a new QR code from your desktop.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-10">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <div className="text-center space-y-1">
              <p className="font-medium text-destructive">Something went wrong</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
