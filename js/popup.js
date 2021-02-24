$(document).ready(function() {
    $('#youtube').on('click', function() {
        chrome.tabs.create({url: 'https://www.youtube.com/c/jackli_gg'});
    });
    $('#website').on('click', function() {
        chrome.tabs.create({url: 'http://www.jackli.gg'});
    });
});

function updateElement(elementId, value) {
    let element = document.getElementById(elementId);
    element.value = value;
}

function update() {
    chrome.storage.sync.get({
        'who': 'Hikaru',
        'number': 60,
        'type': 'seconds'
    }, function(data) {
        updateElement('who', data.who);
        updateElement('number', data.number);
        updateElement('type', data.type);
    });
}

let alertTimer;

function showAlert(id) {
    clearTimeout(alertTimer);
    $('#' + id).animate({ opacity: 100 }, 0).show();
    alertTimer = setTimeout(function() {
        $('#' + id).animate({ opacity: 0 }, 500).hide('slow');
    }, 3000);
}

const availableSoundPack = ['Hikaru', 'Gotham', 'SoundEffect']

document.addEventListener('DOMContentLoaded', function() {

    update();

    let saveButton = document.getElementById('save');
    saveButton.addEventListener('click', function() {
        let who = document.getElementById('who').value;
        let number = parseFloat(document.getElementById('number').value);
        let type = document.getElementById('type').value;

        if (!availableSoundPack.includes(who)) {
            showAlert('invalidError');
        } else if (type !== 'seconds' && type !== 'percentage') {
            showAlert('invalidError');
        } else if (number < 0) {
            showAlert('negativeError');
        } else if (type === 'percentage' && number > 100) {
            showAlert('percentageError');
        } else {
            chrome.storage.sync.set({
                who: who,
                number: number,
                type: type
            });
            showAlert('savedSuccessfully');
        }
    }, false);
}, false);
