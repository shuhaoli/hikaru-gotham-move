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
            }
        }
    };
}
