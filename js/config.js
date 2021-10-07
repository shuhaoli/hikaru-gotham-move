function HIKARU_GOTHAM_CONFIG() {
    return {
        OLD_PACK_LOOKUP: {
            HikaruGotham: ['Hikaru', 'Gotham'],
            SoundEffect: ['SoundEffect'],
        },
        SOUND_PACK_DATA: {
            Hikaru: {
                folder: 'Hikaru',
                voicelineNumber: 15,
            },
            Gotham: {
                folder: 'Gotham',
                voicelineNumber: 14,
            },
            SoundEffect: {
                folder: 'SoundEffect',
                voicelineNumber: 1,
            },
        },
        DEFAULT_SOUND_PACK: ['Hikaru', 'Gotham'],
        get AVAILABLE_SOUND_PACK() {
            return Object.keys(this.SOUND_PACK_DATA)
        },
        get DEFAULT_STORAGE() {
            return {
                who: this.DEFAULT_SOUND_PACK,
                number: 60,
                type: 'seconds',
                repeatEnabled: true,
                repeatNumber: 10,
                repeatType: 'seconds',
            }
        },
        ALERT_DATA: {
            'savedSuccessfully': {
                type: "success",
                message: "Successfully saved!"
            },
            'percentageError': {
                type: "danger",
                message: "How can you have a % of time remaining that's greater than 100? Pepega",
            },
            'negativeError': {
                type: "danger",
                message: "Negative value? Really?"
            },
            'invalidError': {
                type: "danger",
                message: "You think you're cool? That value is obviously invalid",
            },
            'repeatTooLowError': {
                type: "danger",
                message: "If they constantly keep yelling at you you won't forget, right? 5Head",
            }
        },
        MIN_REPEAT_TIME: 5000,
        get MIN_REPEAT_TIME_SECOND() {
            return this.MIN_REPEAT_TIME / 1000;
        },
        MIN_PERCENTAGE_TIME: 2000
    };
}
