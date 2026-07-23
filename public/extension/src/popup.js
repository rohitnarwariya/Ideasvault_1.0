// IdeaVault Chrome Extension Popup Application Script (Supabase Direct Integration)

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from build environment or runtime fallbacks
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const WEB_APP_URL = 'https://ideasvault-1-0.vercel.app';

// Safe Extension Environment Check
function isExtensionEnvironment() {
  return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
}

// Safe Chrome/Browser Storage Wrapper
const extensionStorage = {
  get: async (keys) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.get(keys, (res) => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
              console.warn('[IdeaVault] storage.get warning:', chrome.runtime.lastError.message);
            }
            resolve(res || {});
          });
        } catch (e) {
          console.warn('[IdeaVault] storage.get exception:', e);
          resolve({});
        }
      });
    } else {
      const res = {};
      const keyArray = Array.isArray(keys) ? keys : [keys];
      keyArray.forEach(k => {
        try {
          const val = localStorage.getItem(`ideavault_${k}`);
          if (val) res[k] = JSON.parse(val);
        } catch (e) {
          console.warn('[IdeaVault] localStorage parse error:', e);
        }
      });
      return res;
    }
  },
  set: async (obj) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.set(obj, () => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
              console.warn('[IdeaVault] storage.set warning:', chrome.runtime.lastError.message);
            }
            resolve();
          });
        } catch (e) {
          console.warn('[IdeaVault] storage.set exception:', e);
          resolve();
        }
      });
    } else {
      Object.keys(obj).forEach(k => {
        try {
          localStorage.setItem(`ideavault_${k}`, JSON.stringify(obj[k]));
        } catch (e) {
          console.warn('[IdeaVault] localStorage set error:', e);
        }
      });
    }
  },
  remove: async (keys) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.remove(keys, () => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
              console.warn('[IdeaVault] storage.remove warning:', chrome.runtime.lastError.message);
            }
            resolve();
          });
        } catch (e) {
          console.warn('[IdeaVault] storage.remove exception:', e);
          resolve();
        }
      });
    } else {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      keyArray.forEach(k => {
        try {
          localStorage.removeItem(`ideavault_${k}`);
        } catch (e) {}
      });
    }
  }
};

// Safe External Link Opener
function openExternalTab(url) {
  if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.create === 'function') {
    try {
      chrome.tabs.create({ url });
    } catch (e) {
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank');
  }
}

// Default Collections Fallback
const DEFAULT_COLLECTIONS = [
  { id: '1', name: '📹 YouTube' },
  { id: '2', name: '📸 Instagram' },
  { id: '3', name: '📌 Pinterest' },
  { id: '4', name: '🐦 X (Twitter)' },
  { id: '5', name: '🤖 Reddit' },
  { id: '6', name: '💼 LinkedIn' },
  { id: '7', name: '🎨 UI Inspiration' },
  { id: '8', name: '💡 Random Ideas' }
];

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
  isUploading: false,
  isTranscribing: false,
  recordSeconds: 0,
  recordTimer: null,
  mediaRecorder: null,
  audioChunks: [],
  micPermissionDenied: false,
  isSaving: false,
  errorMessage: '',
  loginEmail: '',
  loginPassword: ''
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

// Preserve field inputs in state prior to re-renders
function syncInputsToState() {
  const titleEl = document.getElementById('inp-title');
  const descEl = document.getElementById('inp-desc');
  const colEl = document.getElementById('inp-collection');

  if (titleEl) state.title = titleEl.value;
  if (descEl) state.description = descEl.value;
  if (colEl) state.selectedCollection = colEl.value;
}

// Initialize Popup safely
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    render();
    await checkAuthAndLoadData();
  });
}

// Check Session safely from chrome.storage.local
async function checkAuthAndLoadData() {
  const stored = await extensionStorage.get(['session', 'user', 'pendingContextSave']);
  if (stored.session && stored.user) {
    state.session = stored.session;
    state.user = stored.user;

    if (stored.session.access_token && stored.session.refresh_token) {
      try {
        await supabase.auth.setSession({
          access_token: stored.session.access_token,
          refresh_token: stored.session.refresh_token
        });
      } catch (e) {
        console.warn('[IdeaVault] setSession error:', e);
      }
    }

    state.view = 'save';
    await loadCollections();
    await extractActiveTabMetadata(stored.pendingContextSave);
  } else {
    state.view = 'login';
  }
  render();
}

// Load Collections directly from Supabase database
async function loadCollections() {
  try {
    const userId = state.user?.id;
    if (!userId) return;

    const { data: cols, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('[IdeaVault] Supabase collections select warning:', error.message);
      state.collections = DEFAULT_COLLECTIONS;
      return;
    }

    if (Array.isArray(cols) && cols.length > 0) {
      state.collections = cols;
    } else {
      state.collections = DEFAULT_COLLECTIONS;
    }
  } catch (err) {
    console.warn('[IdeaVault] Failed to load collections from Supabase:', err);
    state.collections = DEFAULT_COLLECTIONS;
  }
}

// Extract Metadata safely from Active Tab
async function extractActiveTabMetadata(pendingSave) {
  if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.query === 'function') {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
          console.warn('[IdeaVault] tabs.query warning:', chrome.runtime.lastError.message);
        }
        if (!tabs || !tabs[0]) {
          fallbackActiveTab(pendingSave);
          return;
        }
        const tab = tabs[0];
        state.url = tab.url || '';
        state.selectedCollection = suggestCollection(state.url);

        if (pendingSave && pendingSave.url) {
          state.url = pendingSave.url || state.url;
          state.title = pendingSave.title || '';
          state.imageUrl = pendingSave.imageUrl || '';
          if (pendingSave.selectionText) {
            state.description = `"${pendingSave.selectionText}"`;
          }
          await extensionStorage.remove('pendingContextSave');
        }

        if (tab.id && typeof chrome.tabs.sendMessage === 'function') {
          try {
            chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_METADATA' }, (response) => {
              if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
                console.log('[IdeaVault] Content script message error/absent:', chrome.runtime.lastError.message);
                if (!state.title) state.title = tab.title || '';
                render();
                return;
              }
              if (response && response.success && response.metadata) {
                const m = response.metadata;
                state.platform = m.platform || 'OTHER';
                state.url = m.url || state.url;
                state.favicon = m.favicon || '';

                if (!state.title) {
                  state.title = m.title || '';
                }
                if (!state.imageUrl) {
                  state.imageUrl = m.imageUrl || '';
                }
              } else if (!state.title) {
                state.title = tab.title || '';
              }
              render();
            });
          } catch (sendErr) {
            console.warn('[IdeaVault] Failed to send message to tab:', sendErr);
            if (!state.title) state.title = tab.title || '';
            render();
          }
        } else {
          if (!state.title) state.title = tab.title || '';
          render();
        }
      });
    } catch (e) {
      console.warn('[IdeaVault] tabs.query exception:', e);
      fallbackActiveTab(pendingSave);
    }
  } else {
    fallbackActiveTab(pendingSave);
  }
}

function fallbackActiveTab(pendingSave) {
  if (pendingSave && pendingSave.url) {
    state.url = pendingSave.url;
    state.title = pendingSave.title || '';
    state.imageUrl = pendingSave.imageUrl || '';
    if (pendingSave.selectionText) {
      state.description = `"${pendingSave.selectionText}"`;
    }
  } else {
    state.url = (typeof window !== 'undefined' && window.location && window.location.href) ? window.location.href : WEB_APP_URL;
    state.title = (typeof document !== 'undefined' && document.title) ? document.title : 'IdeaVault';
  }
  state.selectedCollection = suggestCollection(state.url);
  render();
}

// Handle Login via Supabase Auth directly
async function handleLogin(email, password) {
  state.errorMessage = '';
  state.isSaving = true;
  render();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error || !data || !data.session || !data.user) {
      throw new Error(error?.message || 'Login failed. Please check your credentials.');
    }

    state.user = data.user;
    state.session = data.session;
    state.view = 'save';
    state.isSaving = false;

    // Store session and user in chrome.storage.local
    await extensionStorage.set({
      session: data.session,
      user: data.user
    });

    await loadCollections();
    await extractActiveTabMetadata();
  } catch (err) {
    console.error('[IdeaVault Supabase Auth Error]:', err);
    state.errorMessage = err.message || 'Login failed';
    state.isSaving = false;
  }
  render();
}

// Handle Logout - clears chrome.storage.local and returns to login
async function handleLogout() {
  try {
    await supabase.auth.signOut();
  } catch (e) {}

  await extensionStorage.remove(['session', 'user']);
  state.user = null;
  state.session = null;
  state.loginEmail = '';
  state.loginPassword = '';
  state.errorMessage = '';
  state.view = 'login';
  render();
}

// Microphone Permission & Recording Logic
async function requestMicPermission() {
  syncInputsToState();
  state.errorMessage = '';
  state.micPermissionDenied = false;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    state.micPermissionDenied = false;
    await startRecording();
  } catch (err) {
    console.warn('[IdeaVault Mic Permission Error, opening permission page]:', err);
    state.micPermissionDenied = true;
    state.errorMessage = 'Please allow microphone access in the browser permission tab.';
    render();

    if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.create === 'function') {
      try {
        chrome.tabs.create({ url: chrome.runtime.getURL('permission.html') });
      } catch (e) {
        window.open('permission.html', '_blank');
      }
    }
  }
}

async function toggleRecording() {
  syncInputsToState();
  if (state.micPermissionDenied) {
    await requestMicPermission();
    return;
  }

  if (state.isRecording) {
    stopRecording();
  } else if (!state.isUploading && !state.isTranscribing) {
    await startRecording();
  }
}

async function startRecording() {
  state.errorMessage = '';
  state.micPermissionDenied = false;
  
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    state.errorMessage = 'Microphone access is not supported in this environment.';
    render();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioChunks = [];

    let options = {};
    if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
    }

    state.mediaRecorder = new MediaRecorder(stream, options);

    state.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        state.audioChunks.push(event.data);
      }
    };

    state.mediaRecorder.onstop = async () => {
      try {
        stream.getTracks().forEach(track => track.stop());
      } catch (e) {}

      if (!state.audioChunks || state.audioChunks.length === 0) {
        state.isUploading = false;
        state.isTranscribing = false;
        state.errorMessage = 'No audio recorded. Please speak into the microphone.';
        render();
        return;
      }

      const mimeType = state.mediaRecorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(state.audioChunks, { type: mimeType });

      await uploadAndTranscribe(audioBlob, mimeType);
    };

    state.mediaRecorder.start(100);
    state.isRecording = true;
    state.recordSeconds = 0;

    if (state.recordTimer) clearInterval(state.recordTimer);
    state.recordTimer = setInterval(() => {
      state.recordSeconds += 1;
      syncInputsToState();
      render();
    }, 1000);

    render();
  } catch (err) {
    console.error('[IdeaVault Mic Error]:', err);
    state.isRecording = false;
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
      state.micPermissionDenied = true;
      state.errorMessage = 'Microphone access denied. Click "Grant Microphone Access" to allow recording.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      state.errorMessage = 'No microphone found on your device.';
    } else {
      state.errorMessage = err.message || 'Failed to start recording.';
    }
    render();
  }
}

function stopRecording() {
  syncInputsToState();
  if (state.mediaRecorder && state.isRecording) {
    if (state.recordTimer) {
      clearInterval(state.recordTimer);
      state.recordTimer = null;
    }
    state.isRecording = false;
    state.isUploading = true;
    render();

    try {
      state.mediaRecorder.stop();
    } catch (err) {
      console.error('[IdeaVault stopRecorder Error]:', err);
      state.isUploading = false;
      state.errorMessage = 'Error stopping audio recorder: ' + (err.message || err);
      render();
    }
  }
}

// Transcribe Audio using website backend /api/transcribe
async function uploadAndTranscribe(audioBlob, mimeType) {
  state.isUploading = true;
  state.isTranscribing = false;
  state.errorMessage = '';
  render();

  try {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    await new Promise((resolve, reject) => {
      reader.onloadend = resolve;
      reader.onerror = () => reject(new Error('Failed to process recorded audio.'));
    });

    const base64Audio = reader.result ? reader.result.split(',')[1] : null;
    if (!base64Audio) {
      throw new Error('Audio conversion failed.');
    }

    state.isUploading = false;
    state.isTranscribing = true;
    render();

    const targetApiUrl = (typeof window !== 'undefined' && window.location.origin.startsWith('http') && !window.location.origin.includes('chrome-extension'))
      ? '/api/transcribe'
      : `${WEB_APP_URL}/api/transcribe`;

    const res = await fetch(targetApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioData: base64Audio,
        mimeType: mimeType || 'audio/webm'
      })
    });

    if (!res.ok) {
      let errText = 'Transcription service error.';
      try {
        const errJson = await res.json();
        if (errJson.error) errText = errJson.error;
      } catch (e) {}
      throw new Error(errText);
    }

    const data = await res.json();
    state.isTranscribing = false;

    if (data && data.transcript) {
      const cleanTranscript = data.transcript.trim();
      
      // Separate Voice Transcript field (DO NOT overwrite or append to Description)
      state.voiceTranscript = cleanTranscript;

      // Auto fill Title if currently empty
      if (!state.title || !state.title.trim()) {
        if (data.title && data.title.trim()) {
          state.title = data.title.trim();
        }
      }
    } else {
      state.errorMessage = 'No spoken text was detected in the audio.';
    }

  } catch (err) {
    console.error('[IdeaVault Transcription Error]:', err);
    state.isUploading = false;
    state.isTranscribing = false;
    state.errorMessage = err.message || 'Transcription failed due to a network or server error.';
  }

  render();
}

// Save Inspiration directly to Supabase 'ideas' table
async function handleSaveInspiration() {
  syncInputsToState();
  state.isSaving = true;
  state.errorMessage = '';
  render();

  try {
    const userId = state.user?.id;
    if (!userId) {
      throw new Error('Please sign in to save inspirations.');
    }

    const boardName = state.selectedCollection || '💡 Random Ideas';

    // 1. Find or create collection ID in Supabase
    let collectionId = null;

    if (Array.isArray(state.collections)) {
      const found = state.collections.find(c => 
        c.name === boardName || 
        c.name.replace(/[^\w\s]/g, '').trim().toLowerCase() === boardName.replace(/[^\w\s]/g, '').trim().toLowerCase()
      );
      if (found && found.id && !found.id.match(/^\d+$/)) {
        collectionId = found.id;
      }
    }

    if (!collectionId) {
      const { data: existingColls } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId);

      const matchingColl = (existingColls || []).find((c) => 
        c.name === boardName || 
        c.name.replace(/[^\w\s]/g, '').trim().toLowerCase() === boardName.replace(/[^\w\s]/g, '').trim().toLowerCase()
      );

      if (matchingColl) {
        collectionId = matchingColl.id;
      } else {
        const newCollId = crypto.randomUUID();
        const icon = boardName.split(' ')[0] || '💡';
        const { data: newCol, error: newColErr } = await supabase
          .from('collections')
          .insert({
            id: newCollId,
            name: boardName,
            user_id: userId,
            icon: icon
          })
          .select('*')
          .single();

        if (!newColErr && newCol) {
          collectionId = newCol.id;
        } else {
          collectionId = newCollId;
        }
      }
    }

    // 2. Insert into 'ideas' table matching website database schema
    const ideaId = crypto.randomUUID();
    const initialAiSummary = {
      notes: state.description || '',
      isFavorite: false,
      imageUrl: state.imageUrl || null,
      tags: ['Aesthetics', 'SaaS Layout']
    };

    const dbPayload = {
      id: ideaId,
      title: state.title.trim() || 'Untitled Inspiration',
      url: state.url.trim() || '',
      platform: state.platform || 'OTHER',
      voice_url: null,
      voice_transcript: state.voiceTranscript || null,
      ai_status: 'ready',
      ai_summary: JSON.stringify(initialAiSummary),
      ai_tags: ['Aesthetics', 'SaaS Layout'],
      user_id: userId,
      collection_id: collectionId,
      created_at: new Date().toISOString()
    };

    const { error: saveErr } = await supabase
      .from('ideas')
      .insert(dbPayload);

    if (saveErr) {
      console.error('[IdeaVault] Supabase insert idea error:', saveErr);
      throw new Error(saveErr.message || 'Failed to save inspiration.');
    }

    // Success View
    state.isSaving = false;
    state.view = 'success';
    render();

    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.close === 'function') {
        window.close();
      }
    }, 1200);

  } catch (err) {
    console.error('[IdeaVault Save Error]:', err);
    state.errorMessage = err.message || 'Failed to save.';
    state.isSaving = false;
    render();
  }
}

// Render Main UI
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
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #FCA5A5; padding: 10px; border-radius: 8px; font-size: 12px; line-height: 1.4;">
            ${escapeHtml(state.errorMessage)}
          </div>
        ` : ''}

        <form id="login-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="font-size: 11px; font-weight: 600; color: #A1A1AA; display: block; margin-bottom: 4px;">EMAIL</label>
            <input type="email" id="email" placeholder="you@example.com" required value="${escapeHtml(state.loginEmail || '')}">
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label style="font-size: 11px; font-weight: 600; color: #A1A1AA;">PASSWORD</label>
              <a id="forgot-password-link" href="#" style="font-size: 11px; color: #4F8CFF; text-decoration: none; font-weight: 500;">Forgot Password?</a>
            </div>
            <input type="password" id="password" placeholder="••••••••" required value="${escapeHtml(state.loginPassword || '')}">
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 4px; height: 40px;" ${state.isSaving ? 'disabled' : ''}>
            ${state.isSaving ? 'Signing In...' : 'Sign In to Account'}
          </button>

          <button type="button" id="create-account-btn" class="btn-secondary" style="height: 38px;">
            Create Account
          </button>
        </form>
      </div>
    `;

    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');

    emailEl?.addEventListener('input', (e) => {
      state.loginEmail = e.target.value;
    });

    passwordEl?.addEventListener('input', (e) => {
      state.loginPassword = e.target.value;
    });

    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email')?.value?.trim() || '';
      const password = document.getElementById('password')?.value || '';
      if (!email || !password) {
        state.errorMessage = 'Please enter both email and password';
        render();
        return;
      }
      handleLogin(email, password);
    });

    document.getElementById('create-account-btn')?.addEventListener('click', () => {
      openExternalTab(`${WEB_APP_URL}/signup`);
    });

    document.getElementById('forgot-password-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      openExternalTab(`${WEB_APP_URL}`);
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

  // Determine Voice Button Label and Style
  let voiceBtnLabel = '🎙️ Start Recording';
  let voiceBtnBg = '#181920';
  let voiceBtnColor = '#A1A1AA';
  let voiceBtnBorder = '#23242B';
  let voiceBtnClass = '';
  let voiceBtnDisabled = false;

  if (state.micPermissionDenied) {
    voiceBtnLabel = '🎙️ Grant Microphone Access';
    voiceBtnBg = 'rgba(239, 68, 68, 0.15)';
    voiceBtnColor = '#FCA5A5';
    voiceBtnBorder = 'rgba(239, 68, 68, 0.4)';
  } else if (state.isRecording) {
    voiceBtnLabel = `⏹️ Stop Recording (${formatTime(state.recordSeconds)})`;
    voiceBtnBg = '#EF4444';
    voiceBtnColor = '#FFFFFF';
    voiceBtnBorder = '#EF4444';
    voiceBtnClass = 'recording-pulse';
  } else if (state.isUploading) {
    voiceBtnLabel = '⏳ Uploading...';
    voiceBtnBg = '#181920';
    voiceBtnColor = '#4F8CFF';
    voiceBtnBorder = '#4F8CFF';
    voiceBtnDisabled = true;
  } else if (state.isTranscribing) {
    voiceBtnLabel = '✨ Transcribing...';
    voiceBtnBg = '#181920';
    voiceBtnColor = '#8B5CF6';
    voiceBtnBorder = '#8B5CF6';
    voiceBtnDisabled = true;
  }

  container.innerHTML = `
    <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px; min-height: 520px; justify-content: space-between;">
      
      <!-- Top Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #23242B; padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #4F8CFF, #8B5CF6); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px;">💡</div>
          <span style="font-weight: 700; font-size: 14px; letter-spacing: -0.2px;">Save Inspiration</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 10px; background: #181920; border: 1px solid #23242B; padding: 3px 8px; border-radius: 12px; color: #A1A1AA; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(state.user?.email || 'Logged In')}
          </span>
          <button id="logout-btn" title="Log Out" style="background: none; border: none; color: #71717A; cursor: pointer; font-size: 13px; padding: 2px;">✕</button>
        </div>
      </div>

      ${state.errorMessage ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #FCA5A5; padding: 8px 12px; border-radius: 8px; font-size: 11px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span>${escapeHtml(state.errorMessage)}</span>
          ${state.micPermissionDenied ? `
            <button id="grant-mic-btn" style="background: #EF4444; color: white; border: none; font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 4px; cursor: pointer; white-space: nowrap;">Grant Mic</button>
          ` : ''}
        </div>
      ` : ''}

      <!-- Page Thumbnail & Platform Badge -->
      <div style="display: flex; gap: 10px; background: #111217; border: 1px solid #23242B; padding: 8px 10px; border-radius: 10px; align-items: center;">
        ${state.imageUrl ? `
          <img src="${escapeHtml(state.imageUrl)}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #23242B; background: #000;" onError="this.style.display='none'">
        ` : `
          <div style="width: 48px; height: 48px; background: #181920; border-radius: 6px; border: 1px solid #23242B; display: flex; align-items: center; justify-content: center; font-size: 18px;">
            ${platformIcon}
          </div>
        `}
        <div style="flex: 1; overflow: hidden;">
          <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(79, 140, 255, 0.1); border: 1px solid rgba(79, 140, 255, 0.2); color: #4F8CFF; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-bottom: 2px;">
            ${platformIcon} ${escapeHtml(state.platform)}
          </div>
          <p style="font-size: 10px; color: #A1A1AA; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(state.url)}
          </p>
        </div>
      </div>

      <!-- Title Input -->
      <div>
        <label style="font-size: 10px; font-weight: 700; color: #A1A1AA; display: block; margin-bottom: 3px; letter-spacing: 0.5px;">TITLE</label>
        <input type="text" id="inp-title" value="${escapeHtml(state.title)}" placeholder="Enter a descriptive title..." style="font-weight: 600;">
      </div>

      <!-- Description Input -->
      <div>
        <label style="font-size: 10px; font-weight: 700; color: #A1A1AA; display: block; margin-bottom: 3px; letter-spacing: 0.5px;">DESCRIPTION</label>
        <textarea id="inp-desc" placeholder="Write your notes here..." style="min-height: 52px;">${escapeHtml(state.description)}</textarea>
      </div>

      <!-- Voice Transcript Section (Placed directly BELOW Description) -->
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <label style="font-size: 10px; font-weight: 700; color: #A1A1AA; letter-spacing: 0.5px;">VOICE TRANSCRIPT</label>
          ${state.voiceTranscript ? `
            <button id="clear-voice-btn" style="background: none; border: none; color: #71717A; font-size: 10px; cursor: pointer; text-decoration: underline;">Clear</button>
          ` : ''}
        </div>

        <!-- Read-only transcript box -->
        <div style="background-color: #09090B; border: 1px solid #23242B; border-radius: 8px; padding: 8px 10px; min-height: 48px; max-height: 72px; overflow-y: auto; font-size: 12px; color: ${state.voiceTranscript ? '#E4E4E7' : '#52525B'}; line-height: 1.4;">
          ${state.voiceTranscript ? escapeHtml(state.voiceTranscript) : (
            state.isRecording ? '🎙️ Listening to your voice...' :
            state.isUploading ? '⏳ Processing audio file...' :
            state.isTranscribing ? '✨ Converting speech to text...' :
            'Recorded voice transcript will appear here...'
          )}
        </div>

        <!-- Record / Grant Mic Action Button -->
        <button id="voice-btn" class="${voiceBtnClass}" ${voiceBtnDisabled ? 'disabled' : ''} style="margin-top: 2px; width: 100%; height: 34px; background: ${voiceBtnBg}; color: ${voiceBtnColor}; border: 1px solid ${voiceBtnBorder}; font-size: 11px; font-weight: 600; border-radius: 8px; cursor: ${voiceBtnDisabled ? 'not-allowed' : 'pointer'}; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
          <span>${escapeHtml(voiceBtnLabel)}</span>
        </button>
      </div>

      <!-- Collection Selector -->
      <div>
        <label style="font-size: 10px; font-weight: 700; color: #A1A1AA; display: block; margin-bottom: 3px; letter-spacing: 0.5px;">COLLECTION</label>
        <select id="inp-collection">
          ${(state.collections.length > 0 ? state.collections : DEFAULT_COLLECTIONS).map(c => `
            <option value="${escapeHtml(c.name)}" ${c.name === state.selectedCollection ? 'selected' : ''}>${escapeHtml(c.name)}</option>
          `).join('')}
        </select>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px; margin-top: 4px;">
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
  document.getElementById('grant-mic-btn')?.addEventListener('click', requestMicPermission);
  
  document.getElementById('clear-voice-btn')?.addEventListener('click', () => {
    state.voiceTranscript = '';
    render();
  });

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
    if (typeof window !== 'undefined' && typeof window.close === 'function') {
      window.close();
    }
  });

  document.getElementById('save-btn')?.addEventListener('click', handleSaveInspiration);
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
