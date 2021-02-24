let observer;
let recentRandomNumber = 0;

function randomPositiveNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

function randomPositiveNumberWithoutRepeat(max) {
    let result;
    do {
        result = randomPositiveNumber(max);
    }
    while (recentRandomNumber === result);

    recentRandomNumber = result;
    return result;
}

function parseSecondsFromClock(clock) {
    const regex = /((\d):)?((\d)?\d):(\d\d)/;
    let match = clock.match(regex);
    let hour = parseInt(match[2] ? match[2] : 0);
    let min = parseInt(match[3]);
    let sec = parseInt(match[5]);
    return sec + min * 60 + hour * 3600;
}

function chessMoveReminder() {
    let timer;
    let seconds = 5;
    let audio;

    let playAudio = function(who) {
        let audioUrl = 'audio/SoundEffect/SoundEffect.mp3';
        if (who === 'HikaruGotham') {
            audioUrl = 'audio/HikaruGotham/' + randomPositiveNumberWithoutRepeat(20) + '.wav';
        }
        audio = new Audio(chrome.runtime.getURL(audioUrl));
        try {
            audio.play();
        } catch(err) {
            console.log('Unable to play audio: ' + err.message);
        }
    }

    let target = document.querySelector('#board-layout-player-bottom .clock-component');
    if (target !== null) {
        if (observer !== undefined) {
            observer.disconnect();
        }
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                let currentClock = mutation.target.innerText;
                clearTimeout(timer);
                // For some reason chess.com/live#g=xxx uses clock-playerTurn
                // whereas chess.com/game/live/xxx uses clock-player-turn
                let isTurn = mutation.target.classList.contains('clock-playerTurn')
                    || mutation.target.classList.contains('clock-player-turn');
                if (!isTurn && audio !== undefined) {
                    audio.pause();
                }
                if (isTurn) {
                    chrome.storage.sync.get({
                        'who': 'HikaruGotham',
                        'number': 60,
                        'type': 'seconds'
                    }, function(data) {
                        let who = data.who;
                        let number = data.number;
                        let type = data.type;

                        let timeToWait;

                        if (type === 'percentage') {
                            let seconds = parseSecondsFromClock(currentClock) * number * 10;
                            timeToWait = Math.max(seconds, 2000);
                        } else {
                            timeToWait = number * 1000;
                        }
                        timer = setTimeout(playAudio, timeToWait, who);
                    });
                }
            });
        });

        observer.observe(target, {
            attributes:true,
            attributeFilter:['class']
        });
    }
}

setTimeout(chessMoveReminder, 1000);

window.addEventListener('hashchange', function() {
    setTimeout(chessMoveReminder, 1000);
});
