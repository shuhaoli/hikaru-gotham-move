$(document).ready(function() {
    $('#youtube').on('click', function() {
        chrome.tabs.create({url: 'https://www.youtube.com/c/jackli_gg'});
    });
    $('#website').on('click', function() {
        chrome.tabs.create({url: 'http://www.jackli.gg'});
    });
});

const { OLD_PACK_LOOKUP, SOUND_PACK_DATA, AVAILABLE_SOUND_PACK, DEFAULT_SOUND_PACK } = HIKARU_GOTHAM_CONFIG();
let selectedSoundPack = [];

function initCheckboxes(initialValues = DEFAULT_SOUND_PACK) {
    if (!initialValues) {
        selectedSoundPack = [...document.querySelectorAll('#who input[type=checkbox]:checked')];
    } else {
        initialValues.forEach(id => document.getElementById(id).checked = true);
        selectedSoundPack = initialValues;
    }
}

function updateElement(elementId, value) {
    let element = document.getElementById(elementId);
    element.value = value;
}

function updateCheckboxes({ value, checked }) {
    selectedSoundPack = checked ? selectedSoundPack.concat(value) : selectedSoundPack.filter(who => who !== value);
}

function onPackContainerClick(event) {
    if (event.target.tagName !== 'INPUT') return;
    updateCheckboxes(event.target);
}

function update() {
    chrome.storage.sync.get({
        'who': DEFAULT_SOUND_PACK,
        'number': 60,
        'type': 'seconds'
    }, function(data) {
        // Fallback for version upgrade
        initCheckboxes(typeof data.who === 'object' ? data.who : OLD_PACK_LOOKUP[data.who]);
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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('who').addEventListener('click', onPackContainerClick);

    update();

    let saveButton = document.getElementById('save');
    saveButton.addEventListener('click', function() {
        let number = parseFloat(document.getElementById('number').value);
        let type = document.getElementById('type').value;

        if (!selectedSoundPack.every(pack => AVAILABLE_SOUND_PACK.includes(pack))) {
            showAlert('invalidError');
        } else if (type !== 'seconds' && type !== 'percentage') {
            showAlert('invalidError');
        } else if (number < 0) {
            showAlert('negativeError');
        } else if (type === 'percentage' && number > 100) {
            showAlert('percentageError');
        } else {
            chrome.storage.sync.set({
                who: selectedSoundPack,
                number: number,
                type: type
            });
            showAlert('savedSuccessfully');
        }
    }, false);
}, false);
