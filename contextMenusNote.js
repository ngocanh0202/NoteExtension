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
}

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        title: "Add to Note",
        contexts: ["selection"],
        id: "selection",
    });
});