document.addEventListener('DOMContentLoaded', () => {
  const grantBtn = document.getElementById('grant-btn');
  const statusEl = document.getElementById('status');

  // Try auto-requesting if opened directly
  requestMicPermission();

  grantBtn?.addEventListener('click', () => {
    requestMicPermission();
  });

  async function requestMicPermission() {
    if (!statusEl) return;
    statusEl.style.color = '#A1A1AA';
    statusEl.textContent = 'Requesting microphone permission...';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      statusEl.style.color = '#22C55E';
      statusEl.textContent = '✓ Microphone permission granted! You can now close this tab and return to the extension popup.';
      
      if (grantBtn) {
        grantBtn.style.display = 'none';
      }

      setTimeout(() => {
        try {
          window.close();
        } catch (e) {}
      }, 2500);

    } catch (err) {
      console.warn('[IdeaVault Mic Permission Error]:', err);
      statusEl.style.color = '#FCA5A5';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        statusEl.textContent = 'Permission prompt was blocked or denied. Please click "Allow" when your browser prompts for microphone access.';
      } else {
        statusEl.textContent = 'Failed to access microphone: ' + (err.message || err);
      }
    }
  }
});
