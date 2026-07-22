// IdeaVault Chrome Extension Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  // Create Context Menu items
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

  console.log("IdeaVault Extension installed successfully.");
});

// Context Menu Click Listener
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab) return;

  const pendingItem = {
    url: info.linkUrl || info.pageUrl || tab.url || "",
    title: tab.title || "",
    imageUrl: info.srcUrl || "",
    selectionText: info.selectionText || "",
    timestamp: Date.now()
  };

  chrome.storage.local.set({ pendingContextSave: pendingItem }, () => {
    // Open Extension Popup or highlight action
    chrome.action.openPopup?.().catch(() => {
      // If openPopup fails (e.g. requires user click context), set badge
      chrome.action.setBadgeText({ text: "1", tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: "#4F8CFF" });
    });
  });
});

// Listener for runtime messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_ACTIVE_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        sendResponse({ tab: tabs[0] });
      } else {
        sendResponse({ tab: null });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === "CLEAR_BADGE") {
    if (sender.tab?.id) {
      chrome.action.setBadgeText({ text: "", tabId: sender.tab.id });
    }
    sendResponse({ success: true });
  }
});
