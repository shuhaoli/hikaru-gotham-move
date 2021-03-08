const { OLD_PACK_LOOKUP, AVAILABLE_SOUND_PACK, DEFAULT_SOUND_PACK, ALERT_DATA } = HIKARU_GOTHAM_CONFIG();
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

let prevAlertId;

function dismissAlert(element) {
    element.id = "";
    element.className += " alertOut";
    setTimeout(function() {
        element.remove();
    }, 500);
}

function newAlert(type = "primary", message = "", prevAlertId) {
    // The alert must contain a message.
    if (!message) return;
    // Force dismiss previous alert if not.
    clearTimeout(prevAlertId);
    const prevAlertEl = document.getElementById("alertBox");
    if (prevAlertEl) dismissAlert(prevAlertEl);
    // Create a new alert.
    const newAlert = document.createElement('div');
    newAlert.id = "alertBox";
    newAlert.className = "alert alert-" + type;
    newAlert.appendChild(document.createTextNode(message));
    // Append to the alert area.
    const alertArea = document.getElementById("alertArea");
    alertArea.insertBefore(newAlert, alertArea.childNodes[0]);
    // Make the new alert auto-dismiss on time.
    return setTimeout(function() {
        dismissAlert(document.getElementById("alertBox"));
    }, 3500);
}

function showAlert(alertType){
    const {type, message} = ALERT_DATA[alertType];
    prevAlertId = newAlert(type, message, prevAlertId);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("youtube").addEventListener("click", function() {
        chrome.tabs.create({url: 'https://www.youtube.com/c/jackli_gg'});
    });

    document.getElementById("website").addEventListener("click", function() {
        chrome.tabs.create({url: 'http://www.jackli.gg'});
    });

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
