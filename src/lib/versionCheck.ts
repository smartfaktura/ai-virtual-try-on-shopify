export async function checkAppVersion() {
  try {
    if (import.meta.env.DEV) return;

    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;

    const { v } = await res.json();
    if (v && v !== __BUILD_VERSION__) {
      if (sessionStorage.getItem('v_reloaded')) return;
      sessionStorage.setItem('v_reloaded', '1');
      window.location.reload();
    } else {
      sessionStorage.removeItem('v_reloaded');
    }
  } catch {
    // silent — never block the app
  }
}
