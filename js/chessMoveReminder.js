const { OLD_PACK_LOOKUP, SOUND_PACK_DATA, DEFAULT_SOUND_PACK, DEFAULT_STORAGE, MIN_REPEAT_TIME, MIN_PERCENTAGE_TIME } = HIKARU_GOTHAM_CONFIG();
let observer;
let oldHref = document.location.href;
let recentRandomNumber = 0;

let timer;
let audio;
let repeatIntervalStartTimer;
let repeatInterval;

let lastPlayedClockTime;

function randomPositiveNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

function randomPositiveNumberWithoutRepeat(max) {
    let result;
    do {
        result = randomPositiveNumber(max);
    } while (recentRandomNumber === result);

    recentRandomNumber = result;
    return result;
}

function getCurrentClock() {
    return getCurrentClockFromComponent(getClockComponent());
}

function getClockComponent() {
    return document.querySelector('#board-layout-player-bottom .clock-component')
            || document.querySelector('.rclock-bottom');
}

function getCurrentClockFromComponent(clockComponent) {
    let clockTimeComponent = clockComponent.querySelector('.time') || clockComponent;
    return clockTimeComponent.innerText.replaceAll('\n', '');
}

function getAudio(who) {
    let pack = who[randomPositiveNumber(who.length) - 1];
    let {folder, voicelineNumber} = SOUND_PACK_DATA[pack];
    let audioIndex = voicelineNumber === 1 ? 1 : randomPositiveNumberWithoutRepeat(voicelineNumber);
    return `audio/${folder}/${audioIndex}.mp3`;
}

async function playAudio(who) {
    if (!who.length) return;
    let currentClock = getCurrentClock();
    if (currentClock === lastPlayedClockTime) {
        // The time has not changed. The game is probably over
        resetTimers();
        return;
    }
    lastPlayedClockTime = currentClock;
    let audioUrl = getAudio(who);
    audio = new Audio(chrome.runtime.getURL(audioUrl));
    try {
        await audio.play();
    } catch (err) {
        console.log('MOVE Extension: Unable to play audio: ' + err.message);
    }
};

function calcTime(currentClock, type, number) {
    if (type === 'percentage') {
        return Math.max(parseSecondsFromClock(currentClock) * number * 10, MIN_PERCENTAGE_TIME);
    }
    return number * 1000;
}

function parseSecondsFromClock(clock) {
    let split = clock.split(':').reverse();
    let hour = parseInt(split[2] || 0);
    let min = parseInt(split[1]);
    let sec = parseInt(split[0]);
    return sec + min * 60 + hour * 3600;
}

function resetTimers() {
    clearTimeout(timer);
    clearTimeout(repeatIntervalStartTimer);
    clearInterval(repeatInterval);
}

function chessMoveReminder() {
    let target = getClockComponent();

    if (target !== null) {
        if (observer !== undefined) {
            observer.disconnect();
        }

        observer = new MutationObserver(function (mutations) {
            let mutation = mutations[0];
            let currentClock = getCurrentClockFromComponent(mutation.target);
            resetTimers();

            // For some reason chess.com/live#g=xxx uses clock-playerTurn
            // whereas chess.com/game/live/xxx uses clock-player-turn
            let isTurn =
                mutation.target.classList.contains('clock-playerTurn') ||
                mutation.target.classList.contains('clock-player-turn') ||
                mutation.target.classList.contains('running');

            if (mutation.oldValue !== mutation.target.classList.value) {
                if (audio !== undefined) audio.pause();
                if (isTurn) {
                    chrome.storage.sync.get(
                        DEFAULT_STORAGE,
                        function ({who, number, type, repeatEnabled, repeatNumber, repeatType}) {
                            let formattedWho = typeof who === 'object' ? who : OLD_PACK_LOOKUP[who];
                            let timeToTell = calcTime(currentClock, type, number);

                            timer = setTimeout(playAudio, timeToTell, formattedWho);
                            
                            if (repeatEnabled) {
                                repeatIntervalStartTimer = setTimeout(function () {
                                    const timeToRepeat = Math.max(calcTime(currentClock, repeatType, repeatNumber), MIN_REPEAT_TIME);
                                    repeatInterval = setInterval(playAudio, timeToRepeat, formattedWho);
                                }, timeToTell);
                            }
                        }
                    );
                }
            }
        });

        observer.observe(target, {
            attributes: true,
            attributeFilter: ['class'],
            attributeOldValue: true,
        });
    }
}

setTimeout(chessMoveReminder, 1000);

let bodyList = document.querySelector('body');
let pageReloadObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (oldHref !== document.location.href) {
            resetTimers();
            oldHref = document.location.href;
            setTimeout(chessMoveReminder, 1000);
        }
    });
});
let config = {
    childList: true,
    subtree: true,
};

pageReloadObserver.observe(bodyList, config);
