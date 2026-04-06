chrome.contextMenus.onClicked.addListener(genericOnClick);

function genericOnClick(info) {
    switch (info.menuItemId) {
        case 'selection':
            handleAddToNoteSelection(info.selectionText);
            break;
        default:
            break;
    }
}

function handleAddToNoteSelection(text){
    chrome.storage.local.set({
        'title': 'unknown',
        'category': 'unknown',
        'selectedText': text,
        'addToNote': true
    }, function() {
        chrome.runtime.sendMessage({
            action: 'autoUpdateEditor'
        }, function(response) {
            if (chrome.runtime.lastError) {
                chrome.action.openPopup();
            }
        });
    });
    chrome.runtime.sendMessage({
        action: 'checkAuthStatus'
    }, function(response) {
        if (chrome.runtime.lastError) return;
        if (response && !response.authenticated) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: './images/default.png',
                title: 'Note Extension',
                message: 'Please sign in to save notes. Open the extension to sign in.'
            });
        }
    });
}

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        title: "Add to Note",
        contexts: ["selection"],
        id: "selection",
    });
});