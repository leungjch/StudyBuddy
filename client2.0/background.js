
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.extension.getBackgroundPage().console.log('Running background js');

  // for the current tab, inject the "inject.js" file & execute it
  chrome.tabs.executeScript(tab.ib, {
    file: "inject.js",
  });
});
