chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// The site's connect page hands over the login. Only pages listed under
// externally_connectable in the manifest can reach this listener.
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message?.type !== "SH_MCQ_CONNECT" || !message.accessToken) {
    sendResponse({ ok: false });
    return;
  }
  chrome.storage.session
    .set({
      session: {
        accessToken: message.accessToken,
      },
    })
    .then(() => {
      sendResponse({ ok: true });
      if (sender.tab?.id) chrome.tabs.remove(sender.tab.id);
    });
  return true;
});
