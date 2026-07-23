// IdeaVault Chrome Extension Background Service Worker (Manifest V3)

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    if (chrome.contextMenus && typeof chrome.contextMenus.create === 'function') {
      try {
        chrome.contextMenus.create({
          id: "ideavault-save-page",
          title: "Save to IdeaVault",
          contexts: ["page"]
        });

        chrome.contextMenus.create({
          id: "ideavault-save-image",
          title: "Save Image to IdeaVault",
          contexts: ["image"]
        });

        chrome.contextMenus.create({
          id: "ideavault-save-selection",
          title: "Save Text to IdeaVault",
          contexts: ["selection"]
        });

        chrome.contextMenus.create({
          id: "ideavault-save-link",
          title: "Save Link to IdeaVault",
          contexts: ["link"]
        });
      } catch (e) {
        console.warn("Context menu creation warning:", e);
      }
    }

    console.log("IdeaVault Extension installed successfully.");
  });
}

// Context Menu Click Listener
if (typeof chrome !== 'undefined' && chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab) return;

    const pendingItem = {
      url: info.linkUrl || info.pageUrl || tab.url || "",
      title: tab.title || "",
      imageUrl: info.srcUrl || "",
      selectionText: info.selectionText || "",
      timestamp: Date.now()
    };

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ pendingContextSave: pendingItem }, () => {
        if (chrome.action && typeof chrome.action.openPopup === 'function') {
          chrome.action.openPopup().catch(() => {
            if (chrome.action && typeof chrome.action.setBadgeText === 'function') {
              chrome.action.setBadgeText({ text: "1", tabId: tab.id });
              chrome.action.setBadgeBackgroundColor({ color: "#4F8CFF" });
            }
          });
        }
      });
    }
  });
}

// Listener for runtime messages
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message) return false;

    if (message.type === "GET_ACTIVE_TAB") {
      if (chrome.tabs && typeof chrome.tabs.query === 'function') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn("GET_ACTIVE_TAB query error:", chrome.runtime.lastError.message);
          }
          if (tabs && tabs[0]) {
            sendResponse({ tab: tabs[0] });
          } else {
            sendResponse({ tab: null });
          }
        });
      } else {
        sendResponse({ tab: null });
      }
      return true; // Keep message channel open for async response
    }

    if (message.type === "CLEAR_BADGE") {
      if (sender?.tab?.id && chrome.action && typeof chrome.action.setBadgeText === 'function') {
        chrome.action.setBadgeText({ text: "", tabId: sender.tab.id });
      }
      sendResponse({ success: true });
      return false;
    }
  });
}

