let observer;
let oldHref = document.location.href;
let recentRandomNumber = 0;

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

function parseSecondsFromClock(clock) {
    let split = clock.split(':').reverse();
    let hour = parseInt(split[2] || 0);
    let min = parseInt(split[1]);
    let sec = parseInt(split[0]);
    return sec + min * 60 + hour * 3600;
}

function chessMoveReminder() {
    let timer;
    let audio;

    let playAudio = async function (who) {
        let audioUrl = 'audio/SoundEffect/SoundEffect.mp3';
        if (who === 'HikaruGotham') {
            audioUrl =
                'audio/HikaruGotham/' +
                randomPositiveNumberWithoutRepeat(29) +
                '.wav';
        }
        audio = new Audio(chrome.runtime.getURL(audioUrl));
        try {
            await audio.play();
        } catch (err) {
            console.log('MOVE Extension: Unable to play audio: ' + err.message);
        }
    };
    let target =
        document.querySelector(
            '#board-layout-player-bottom .clock-component'
        ) || document.querySelector('.rclock-bottom');
    if (target !== null) {
        if (observer !== undefined) {
            observer.disconnect();
        }
        observer = new MutationObserver(function (mutations) {
            let mutation = mutations[0];
            let currentClock =
                mutation.target.querySelector('.time') || mutation.target;
            currentClock = currentClock.innerText.replace('/\n/g', '');
            clearTimeout(timer);
            // For some reason chess.com/live#g=xxx uses clock-playerTurn
            // whereas chess.com/game/live/xxx uses clock-player-turn
            let isTurn =
                mutation.target.classList.contains('clock-playerTurn') ||
                mutation.target.classList.contains('clock-player-turn') ||
                mutation.target.classList.contains('running');
            if (
                audio !== undefined &&
                mutation.oldValue !== mutation.target.classList.value
            )
                audio.pause();
            if (
                isTurn &&
                mutation.oldValue !== mutation.target.classList.value
            ) {
                chrome.storage.sync.get(
                    {
                        who: 'HikaruGotham',
                        number: 60,
                        type: 'seconds',
                    },
                    function (data) {
                        // let who = data.who;
                        // let number = data.number;
                        // let type = data.type;
                        let { who, number, type } = data;
                        let timeToWait;

                        if (type === 'percentage') {
                            let seconds =
                                parseSecondsFromClock(currentClock) *
                                number *
                                10;
                            timeToWait = Math.max(seconds, 2000);
                        } else {
                            timeToWait = number * 1000;
                        }
                        timer = setTimeout(playAudio, timeToWait, who);
                    }
                );
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

window.onload = function () {
    let bodyList = document.querySelector('body');
    let pageReloadObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (oldHref !== document.location.href) {
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
};
