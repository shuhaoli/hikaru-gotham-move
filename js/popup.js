const { OLD_PACK_LOOKUP, AVAILABLE_SOUND_PACK, DEFAULT_SOUND_PACK, DEFAULT_STORAGE, ALERT_DATA, MIN_REPEAT_TIME_SECOND } = HIKARU_GOTHAM_CONFIG();
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
    chrome.storage.sync.get(DEFAULT_STORAGE, function({who, number, type, repeatEnabled, repeatNumber, repeatType}) {
        initCheckboxes(typeof who === 'object' ? who : OLD_PACK_LOOKUP[who]); // Fallback for version upgrade
        updateElement('number', number);
        updateElement('type', type);
        document.getElementById('repeatEnabled').checked = repeatEnabled;
        updateElement('repeatNumber', repeatNumber);
        updateElement('repeatType', repeatType);
        document.getElementById('repeatNumber').min = repeatType === 'percentage' ? 1 : MIN_REPEAT_TIME_SECOND;
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

function onRepeatTypeChange(event) {
    const repeatNumberElement = document.getElementById("repeatNumber");
    const isRepeatTimePercentage = event.target.value === 'percentage';
    repeatNumberElement.min = isRepeatTimePercentage ? 1 : MIN_REPEAT_TIME_SECOND;
    if (isRepeatTimePercentage && repeatNumberElement.value < MIN_REPEAT_TIME_SECOND) {
        repeatNumberElement.value = MIN_REPEAT_TIME_SECOND;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("youtube").addEventListener("click", function() {
        chrome.tabs.create({url: 'https://www.youtube.com/c/jackli_gg'});
    });

    document.getElementById("website").addEventListener("click", function() {
        chrome.tabs.create({url: 'http://www.jackli.gg'});
    });

    document.getElementById('who').addEventListener('click', onPackContainerClick);

    document.getElementById('repeatType').addEventListener('change', onRepeatTypeChange);

    update();

    let saveButton = document.getElementById('save');
    saveButton.addEventListener('click', function() {
        let number = parseFloat(document.getElementById('number').value);
        let type = document.getElementById('type').value;
        let repeatEnabled = !!document.getElementById('repeatEnabled').checked;
        let repeatNumber = parseFloat(document.getElementById('repeatNumber').value);
        let repeatType = document.getElementById('repeatType').value;

        if (!selectedSoundPack.every(pack => AVAILABLE_SOUND_PACK.includes(pack))) return showAlert('invalidError');

        if (!['seconds', 'percentage'].includes(type)) return showAlert('invalidError');
        if (number < 0) return showAlert('negativeError');
        if (type === 'percentage' && number > 100) return showAlert('percentageError');

        if (repeatType === 'percentage'){
            if (repeatNumber > 100) return showAlert('percentageError');
            if (repeatNumber < 1) return showAlert('repeatTooLowError');
        } else if (repeatType === 'seconds') {
            if (repeatNumber < MIN_REPEAT_TIME_SECOND) return showAlert('repeatTooLowError');
        } else {
            return showAlert('invalidError');
        }

        chrome.storage.sync.set({
            who: selectedSoundPack,
            number,
            type,
            repeatEnabled,
            repeatNumber,
            repeatType,
        });

        showAlert('savedSuccessfully');
    }, false);
}, false);
