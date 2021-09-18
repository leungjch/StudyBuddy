// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//https://youtube.com pre much
var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?youtube\.com/;

// A function to use as callback
function doStuffWithDom(domContent) {
    console.log('I received the following DOM content:\n' + domContent);
}

// When the browser-action button is clicked...
chrome.browserAction.onClicked.addListener(function (tab) {
    // ...check the URL of the active tab against our pattern and...
    if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, doStuffWithDom);
    }
});

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

