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

const soundPackData = {
    Hikaru: {
        folder: 'Hikaru',
        voicelineNumber: 15
    },
    Gotham: {
        folder: 'Gotham',
        voicelineNumber: 5
    }
};

const soundPackDataKeys = Object.keys(soundPackData);

function chessMoveReminder() {
    let timer;
    let audio;

    let getAudio = function(who){
        if(!soundPackDataKeys.includes(who)) return 'audio/SoundEffect/SoundEffect.mp3';
        let {folder, voicelineNumber} = soundPackData[who];
        return `audio/${folder}/${semiRandomPositiveNumber(voicelineNumber)}.wav`;
    }

    let playAudio = function(who) {
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
                        'who': 'Hikaru',
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
