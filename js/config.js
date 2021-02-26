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
                voicelineNumber: 5,
            },
            SoundEffect: {
                folder: 'SoundEffect',
                voicelineNumber: 1,
            },
        },
        DEFAULT_SOUND_PACK: ['Hikaru', 'Gotham'],
        get AVAILABLE_SOUND_PACK() {
            return Object.keys(SOUND_PACK_DATA)
        },
    }
}
