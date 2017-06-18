var isTop = true;
chrome.runtime.onMessage.addListener(function(details) {
    alert('Message from frame: ' + details.data);
});