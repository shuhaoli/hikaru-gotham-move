const { OLD_PACK_LOOKUP, SOUND_PACK_DATA, AVAILABLE_SOUND_PACK, DEFAULT_SOUND_PACK } = HIKARU_GOTHAM_CONFIG()
let observer;
let recentRandomNumber = 0;

function randomPositiveNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

function semiRandomPositiveNumber(max) {
    let result = randomPositiveNumber(max);
    while (recentRandomNumber === result) {
        result = randomPositiveNumber(max);
    }
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
    let audio;

    let getAudio = function(who){
        let pack = who[randomPositiveNumber(who.length) - 1];
        let {folder, voicelineNumber} = SOUND_PACK_DATA[pack];
        return `audio/${folder}/${semiRandomPositiveNumber(voicelineNumber)}.mp3`;
    }

    let playAudio = function(who) {
        if(!who.length) return;
        let audioUrl = getAudio(who);
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
                let currentClock = mutation.target.attributes.getNamedItem('data-clock').value;
                clearTimeout(timer);
                let isTurn = mutation.target.classList.contains('clock-playerTurn');
                if (!isTurn && audio !== undefined) {
                    audio.pause();
                }
                if (isTurn) {
                    chrome.storage.sync.get({
                        'who': DEFAULT_SOUND_PACK,
                        'number': 60,
                        'type': 'seconds'
                    }, function(data) {
                        let who = typeof data.who === "object" ? data.who : OLD_PACK_LOOKUP[data.who];
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
