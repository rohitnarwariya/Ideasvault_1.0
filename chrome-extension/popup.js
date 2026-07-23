// IdeaVault Chrome Extension Popup Application Script

const API_BASE_URL = 'https://ideasvault-1-0.vercel.app';

// Enhanced Network Request Logging & Helper
async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  
  console.log(`[IdeaVault Request] ${method} ${url}`, options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : '');

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });
  } catch (err) {
    const errorMsg = `Unable to connect to ${url}. ${err?.message || 'Network error / Failed to fetch'}`;
    console.error(`[IdeaVault Network Error] ${method} ${url}:`, err, errorMsg);
    throw new Error(errorMsg);
  }

  let data = {};
  try {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { rawText: text };
    }
  } catch (readErr) {
    console.warn(`[IdeaVault Read Error] ${method} ${url}:`, readErr);
  }

  console.log(`[IdeaVault Response] ${method} ${url} Status: ${res.status}`, data);

  if (!res.ok || (data && data.success === false)) {
    const serverErr = data?.error || data?.message || (typeof data?.rawText === 'string' ? data.rawText.slice(0, 100) : `HTTP ${res.status} ${res.statusText}`);
    const finalErr = `Server returned status ${res.status}: ${serverErr}`;
    console.error(`[IdeaVault API Error] ${method} ${url} (${res.status}):`, serverErr);
    throw new Error(serverErr || finalErr);
  }

  return data;
}

// State Management
let state = {
  view: 'loading', // 'login' | 'save' | 'success'
  user: null,
  session: null,
  collections: [],
  selectedCollection: '💡 Random Ideas',
  platform: 'OTHER',
  url: '',
  title: '',
  description: '',
  voiceTranscript: '',
  imageUrl: '',
  favicon: '',
  isRecording: false,
  recordSeconds: 0,
  recordTimer: null,
  mediaRecorder: null,
  audioChunks: [],
  isTranscribing: false,
  isSaving: false,
  errorMessage: ''
};

// Platform Icons Map
const PLATFORM_ICONS = {
  YOUTUBE: '📹',
  INSTAGRAM: '📸',
  PINTEREST: '📌',
  X: '🐦',
  REDDIT: '🤖',
  LINKEDIN: '💼',
  GITHUB: '🐙',
  MEDIUM: '✍️',
  BEHANCE: '🎨',
  DRIBBBLE: '🏀',
  WEBSITE: '🌐',
  OTHER: '💡'
};

// Collection Suggestions according to URL
function suggestCollection(urlStr) {
  const lower = (urlStr || '').toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return '📹 YouTube';
  if (lower.includes('instagram.com')) return '📸 Instagram';
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) return '📌 Pinterest';
  if (lower.includes('x.com') || lower.includes('twitter.com')) return '🐦 X (Twitter)';
  if (lower.includes('reddit.com')) return '🤖 Reddit';
  if (lower.includes('linkedin.com')) return '💼 LinkedIn';
  if (lower.includes('github.com')) return '🐙 GitHub';
  return '💡 Random Ideas';
}

// Initialize Popup
document.addEventListener('DOMContentLoaded', async () => {
  render();
  await checkAuthAndLoadData();
});

// Check Session in chrome.storage
async function checkAuthAndLoadData() {
  chrome.storage.local.get(['user', 'session', 'pendingContextSave'], async (res) => {
    if (res.user && res.session) {
      state.user = res.user;
      state.session = res.session;
      state.view = 'save';
      await loadCollections();
      await extractActiveTabMetadata(res.pendingContextSave);
    } else {
      state.view = 'login';
    }
    render();
  });
}

// Load Collections for user
async function loadCollections() {
  try {
    const userId = state.user?.id || 'demo-user';
    const data = await apiFetch(`/api/extension/collections?userId=${encodeURIComponent(userId)}`);
    if (data.success && Array.isArray(data.collections)) {
      state.collections = data.collections;
    }
  } catch (err) {
    console.warn('[IdeaVault] Failed to load collections from server, using default list:', err);
    state.collections = [
      { id: '1', name: '📹 YouTube' },
      { id: '2', name: '📸 Instagram' },
      { id: '3', name: '📌 Pinterest' },
      { id: '4', name: '🐦 X (Twitter)' },
      { id: '5', name: '🤖 Reddit' },
      { id: '6', name: '💼 LinkedIn' },
      { id: '7', name: '🎨 UI Inspiration' },
      { id: '8', name: '💡 Random Ideas' }
    ];
  }
}

// Extract Metadata from Active Tab
async function extractActiveTabMetadata(pendingSave) {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs || !tabs[0]) return;
    const tab = tabs[0];
    state.url = tab.url || '';
    state.selectedCollection = suggestCollection(state.url);

    // If context menu triggered save
    if (pendingSave && pendingSave.url) {
      state.url = pendingSave.url || state.url;
      state.title = pendingSave.title || '';
      state.imageUrl = pendingSave.imageUrl || '';
      if (pendingSave.selectionText) {
        state.description = `"${pendingSave.selectionText}"`;
      }
      chrome.storage.local.remove('pendingContextSave');
    }

    // Request full metadata from content script
    try {
      chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_METADATA' }, (response) => {
        if (response && response.success && response.metadata) {
          const m = response.metadata;
          state.platform = m.platform || 'OTHER';
          state.url = m.url || state.url;
          state.favicon = m.favicon || '';
          
          // Rule: Only auto-fill title if empty. Pinterest title should stay empty for user entry.
          if (!state.title) {
            state.title = m.title || '';
          }
          if (!state.imageUrl) {
            state.imageUrl = m.imageUrl || '';
          }
          render();
        }
      });
    } catch (e) {
      console.warn('Content script communication error:', e);
    }

    render();
  });
}

// Handle Login
async function handleLogin(email, password) {
  state.errorMessage = '';
  state.isSaving = true;
  render();

  try {
    const data = await apiFetch('/api/extension/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!data.success || !data.user) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }

    state.user = data.user;
    state.session = data.session;
    state.view = 'save';
    state.isSaving = false;

    chrome.storage.local.set({ user: data.user, session: data.session });
    await loadCollections();
    await extractActiveTabMetadata();
  } catch (err) {
    console.error('[IdeaVault Login Error]:', err);
    state.errorMessage = err.message || 'Login failed';
    state.isSaving = false;
  }
  render();
}

// Handle Auto-Sync with web app
async function handleAutoSync() {
  state.errorMessage = '';
  state.isSaving = true;
  render();

  // Create demo/synced session
  const syncedUser = {
    id: 'demo-user',
    name: 'IdeaVault Creator',
    email: 'creator@ideavault.app',
    avatar: ''
  };
  const syncedSession = { access_token: 'synced-token-123' };

  state.user = syncedUser;
  state.session = syncedSession;
  state.view = 'save';
  state.isSaving = false;

  chrome.storage.local.set({ user: syncedUser, session: syncedSession });
  await loadCollections();
  await extractActiveTabMetadata();
  render();
}

// Handle Log Out
function handleLogout() {
  chrome.storage.local.remove(['user', 'session']);
  state.user = null;
  state.session = null;
  state.view = 'login';
  render();
}

// Voice Recording Handlers
async function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioChunks = [];
    state.mediaRecorder = new MediaRecorder(stream);

    state.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        state.audioChunks.push(event.data);
      }
    };

    state.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
      stream.getTracks().forEach(track => track.stop());
      await transcribeAudio(audioBlob);
    };

    state.mediaRecorder.start(100);
    state.isRecording = true;
    state.recordSeconds = 0;

    state.recordTimer = setInterval(() => {
      state.recordSeconds += 1;
      render();
    }, 1000);

    render();
  } catch (err) {
    console.error('Microphone access error:', err);
    alert('Microphone access is required to record voice notes.');
  }
}

function stopRecording() {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    state.isRecording = false;
    if (state.recordTimer) {
      clearInterval(state.recordTimer);
      state.recordTimer = null;
    }
    render();
  }
}

// Transcribe Audio using /api/transcribe
async function transcribeAudio(audioBlob) {
  state.isTranscribing = true;
  render();

  try {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result.split(',')[1];
        const data = await apiFetch('/api/transcribe', {
          method: 'POST',
          body: JSON.stringify({ audioData: base64Audio, mimeType: 'audio/webm' })
        });

        state.isTranscribing = false;

        if (data.transcript) {
          const cleanTranscript = data.transcript.trim();
          state.voiceTranscript = cleanTranscript;
          state.description = state.description 
            ? `${state.description}\n\n[Voice Memo]: "${cleanTranscript}"`
            : cleanTranscript;

          if (!state.title.trim() && data.title) {
            state.title = data.title;
          }
        }
      } catch (err) {
        console.error('[IdeaVault Transcription Error]:', err);
        state.isTranscribing = false;
        state.errorMessage = err.message || 'Voice transcription failed';
      }
      render();
    };
  } catch (err) {
    console.error('Transcription reader error:', err);
    state.isTranscribing = false;
    render();
  }
}

// Save Inspiration
async function handleSaveInspiration() {
  state.isSaving = true;
  state.errorMessage = '';
  render();

  try {
    const payload = {
      url: state.url,
      title: state.title,
      description: state.description,
      voiceTranscript: state.voiceTranscript,
      platform: state.platform,
      board: state.selectedCollection,
      imageUrl: state.imageUrl,
      userId: state.user?.id || 'demo-user'
    };

    const data = await apiFetch('/api/extension/save', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!data.success) {
      throw new Error(data.error || 'Failed to save inspiration.');
    }

    // Success State
    state.isSaving = false;
    state.view = 'success';
    render();

    // Auto-close popup after 1.2 seconds
    setTimeout(() => {
      window.close();
    }, 1200);

  } catch (err) {
    console.error('[IdeaVault Save Error]:', err);
    state.errorMessage = err.message || 'Failed to save.';
    state.isSaving = false;
    render();
  }
}

// Render Main App
function render() {
  const container = document.getElementById('app');
  if (!container) return;

  if (state.view === 'loading') {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 500px; gap: 12px; color: #A1A1AA;">
        <div style="width: 28px; height: 28px; border: 3px solid #23242B; border-top-color: #4F8CFF; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span style="font-size: 13px; font-weight: 500;">Connecting to IdeaVault...</span>
      </div>
      <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    `;
    return;
  }

  if (state.view === 'login') {
    container.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #4F8CFF, #8B5CF6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">💡</div>
          <div>
            <h1 style="font-size: 16px; font-weight: 700; color: #FFFFFF;">IdeaVault</h1>
            <p style="font-size: 11px; color: #A1A1AA;">Save web inspiration before you forget why</p>
          </div>
        </div>

        ${state.errorMessage ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #FCA5A5; padding: 10px; border-radius: 8px; font-size: 12px;">
            ${state.errorMessage}
          </div>
        ` : ''}

        <form id="login-form" style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: 11px; font-weight: 600; color: #A1A1AA; display: block; margin-bottom: 4px;">EMAIL</label>
            <input type="email" id="email" placeholder="creator@example.com" required value="creator@ideavault.app">
          </div>

          <div>
            <label style="font-size: 11px; font-weight: 600; color: #A1A1AA; display: block; margin-bottom: 4px;">PASSWORD</label>
            <input type="password" id="password" placeholder="••••••••" required value="password123">
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 4px; height: 40px;" ${state.isSaving ? 'disabled' : ''}>
            ${state.isSaving ? 'Logging in...' : 'Sign In to Account'}
          </button>
        </form>

        <div style="display: flex; align-items: center; gap: 10px; margin: 4px 0;">
          <div style="flex: 1; height: 1px; background: #23242B;"></div>
          <span style="font-size: 10px; color: #71717A; text-transform: uppercase;">OR</span>
          <div style="flex: 1; height: 1px; background: #23242B;"></div>
        </div>

        <button id="sync-btn" class="btn-secondary" style="height: 38px;">
          ⚡ Auto-Sync Web App Session
        </button>
      </div>
    `;

    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      handleLogin(email, password);
    });

    document.getElementById('sync-btn')?.addEventListener('click', () => {
      handleAutoSync();
    });

    return;
  }

  if (state.view === 'success') {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 500px; padding: 24px; text-align: center; gap: 16px;">
        <div class="animate-bounce-in" style="width: 64px; height: 64px; background: rgba(34, 197, 94, 0.15); border: 2px solid #22C55E; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #22C55E; font-size: 32px;">
          ✓
        </div>
        <div>
          <h2 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 6px;">Saved to IdeaVault</h2>
          <p style="font-size: 12px; color: #A1A1AA;">Your idea is secured in your library.</p>
        </div>
      </div>
    `;
    return;
  }

  // Save View
  const platformIcon = PLATFORM_ICONS[state.platform] || '🌐';

  container.innerHTML = `
    <div style="padding: 16px; display: flex; flex-direction: column; gap: 14px; min-height: 520px; justify-content: space-between;">
      
      <!-- Top Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #23242B; padding-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #4F8CFF, #8B5CF6); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px;">💡</div>
          <span style="font-weight: 700; font-size: 14px; letter-spacing: -0.2px;">Save Inspiration</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 10px; background: #181920; border: 1px solid #23242B; padding: 3px 8px; border-radius: 12px; color: #A1A1AA; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${state.user?.email || 'Logged In'}
          </span>
          <button id="logout-btn" title="Log Out" style="background: none; border: none; color: #71717A; cursor: pointer; font-size: 13px; padding: 2px;">✕</button>
        </div>
      </div>

      ${state.errorMessage ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #FCA5A5; padding: 8px 12px; border-radius: 8px; font-size: 11px;">
          ${state.errorMessage}
        </div>
      ` : ''}

      <!-- Page Thumbnail & Platform Badge -->
      <div style="display: flex; gap: 12px; background: #111217; border: 1px solid #23242B; padding: 10px; border-radius: 12px; align-items: center;">
        ${state.imageUrl ? `
          <img src="${state.imageUrl}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid #23242B; background: #000;" onError="this.style.display='none'">
        ` : `
          <div style="width: 56px; height: 56px; background: #181920; border-radius: 8px; border: 1px solid #23242B; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            ${platformIcon}
          </div>
        `}
        <div style="flex: 1; overflow: hidden;">
          <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(79, 140, 255, 0.1); border: 1px solid rgba(79, 140, 255, 0.2); color: #4F8CFF; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-bottom: 4px;">
            ${platformIcon} ${state.platform}
          </div>
          <p style="font-size: 11px; color: #A1A1AA; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${state.url}
          </p>
        </div>
      </div>

      <!-- Title Input -->
      <div>
        <label style="font-size: 10px; font-weight: 700; color: #A1A1AA; display: block; margin-bottom: 4px; letter-spacing: 0.5px;">TITLE</label>
        <input type="text" id="inp-title" value="${escapeHtml(state.title)}" placeholder="Enter a descriptive title..." style="font-weight: 600;">
      </div>

      <!-- Description Input & Voice Note -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <label style="font-size: 10px; font-weight: 700; color: #A1A1AA; letter-spacing: 0.5px;">DESCRIPTION</label>
          <button id="voice-btn" class="${state.isRecording ? 'recording-pulse' : ''}" style="background: ${state.isRecording ? '#EF4444' : '#181920'}; color: ${state.isRecording ? '#FFFFFF' : '#A1A1AA'}; border: 1px solid ${state.isRecording ? '#EF4444' : '#23242B'}; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
            <span>🎙️</span>
            <span>${state.isRecording ? `Recording (${formatTime(state.recordSeconds)})` : state.isTranscribing ? 'Transcribing...' : 'Voice Note'}</span>
          </button>
        </div>
        <textarea id="inp-desc" placeholder="Write why you saved this inspiration..." style="min-height: 64px;">${escapeHtml(state.description)}</textarea>
      </div>

      <!-- Collection Selector -->
      <div>
        <label style="font-size: 10px; font-weight: 700; color: #A1A1AA; display: block; margin-bottom: 4px; letter-spacing: 0.5px;">COLLECTION</label>
        <select id="inp-collection">
          ${(state.collections.length > 0 ? state.collections : [
            { name: '📹 YouTube' },
            { name: '📸 Instagram' },
            { name: '📌 Pinterest' },
            { name: '🐦 X (Twitter)' },
            { name: '🤖 Reddit' },
            { name: '💼 LinkedIn' },
            { name: '💡 Random Ideas' }
          ]).map(c => `
            <option value="${c.name}" ${c.name === state.selectedCollection ? 'selected' : ''}>${c.name}</option>
          `).join('')}
        </select>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px; margin-top: 6px;">
        <button id="cancel-btn" class="btn-secondary" style="flex: 1; height: 38px;">
          Cancel
        </button>
        <button id="save-btn" class="btn-primary" style="flex: 2; height: 38px;" ${state.isSaving ? 'disabled' : ''}>
          ${state.isSaving ? 'Saving...' : '✨ Save Inspiration'}
        </button>
      </div>

    </div>
  `;

  // Attach Event Listeners
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('voice-btn')?.addEventListener('click', toggleRecording);
  
  document.getElementById('inp-title')?.addEventListener('input', (e) => {
    state.title = e.target.value;
  });

  document.getElementById('inp-desc')?.addEventListener('input', (e) => {
    state.description = e.target.value;
  });

  document.getElementById('inp-collection')?.addEventListener('change', (e) => {
    state.selectedCollection = e.target.value;
  });

  document.getElementById('cancel-btn')?.addEventListener('click', () => {
    window.close();
  });

  document.getElementById('save-btn')?.addEventListener('click', handleSaveInspiration);
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
