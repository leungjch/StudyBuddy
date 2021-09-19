// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


chrome.runtime.onMessage.addListener(function(message, sender) {
  if(!message.myPopupIsOpen) return;
  chrome.extension.getBackgroundPage().console.log('Running inject');

  chrome.tabs.executeScript(null, {
    file: "./inject.js",
  });
  // Do your stuff
});


chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.extension.getBackgroundPage().console.log('Running background js');
  // for the current tab, inject the "inject.js" file & execute it
  chrome.tabs.executeScript(tab.ib, {
    file: "inject.js",
  });
});


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });

