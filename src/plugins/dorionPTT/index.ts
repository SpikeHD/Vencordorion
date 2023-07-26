import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import { UserStore, FluxDispatcher } from "@webpack/common";

export default definePlugin({
    name: "Dorion PTT",
    description: "Enable global push-to-talk for Dorion",
    authors: [Devs.SpikeHD],
    required: true,
    patches: [
        // These are for disabling the "you're on web you can't use your keybind!!!" bitching that Discord does
        {
            find: "INPUT_MODE_VAD},{",
            replacement: [
                {
                    match: /,(.{1,2})=!.{1,2}\..{1,2},(.{1,2})=\(/g,
                    replace: ",$1=false,$2=(",
                },
                {
                    match: /(.{1,2})=.{1,2}\..{1,3}\|\|(.{1,2}!==.{1,2}\..{1,3}\.PUSH_TO_TALK)/g,
                    replace: "$1=true"
                },
                {
                    match: /;(.{1,2}===.{1,2}\..{1,3}\.PUSH_TO_TALK&&.{1,2})/g,
                    replace: ";window.__TAURI__.invoke('toggle_ptt', {state:e.value==='PUSH_TO_TALK'});$1"
                }
            ]
        },

        // These are for storing the PTT keybind
        {
            find: ".handleComboChange=function",
            replacement: [{
                match: /this.setState\(\{codes:(.{1,2})\}\)/g,
                replace: "$self.savePttKeys($1);this.setState({codes:$1})"
            }]
        }
    ],

    savePttKeys: (keys: number[][]) => {
        const keyCodes = keys.map(k => k[1]);
        const keyToStr = (key: number) => {
            let keyStr = '';

            // Convert special keys to strings
            // see: https://docs.rs/device_query/latest/device_query/keymap/enum.Keycode.html
            switch (key) {
                case 8:
                    keyStr = 'Backspace';
                    break;
                case 9:
                    keyStr = 'Tab';
                    break;
                case 13:
                    keyStr = 'Enter';
                    break;
                case 16:
                    keyStr = 'Shift';
                    break;
                case 17:
                    keyStr = 'Control';
                    break;
                case 18:
                    keyStr = 'Alt';
                    break;
                case 20:
                    keyStr = 'CapsLock';
                    break;
                case 27:
                    keyStr = 'Escape';
                    break;
                case 32:
                    keyStr = 'Space';
                    break;
                case 33:
                    keyStr = 'PageUp';
                    break;
                case 34:
                    keyStr = 'PageDown';
                    break;
                case 35:
                    keyStr = 'End';
                    break;
                case 36:
                    keyStr = 'Home';
                    break;
                case 37:
                    keyStr = 'Left';
                    break;
                case 38:
                    keyStr = 'Up';
                    break;
                case 39:
                    keyStr = 'Right';
                    break;
                case 40:
                    keyStr = 'Down';
                    break;
                case 45:
                    keyStr = 'Insert';
                    break;
                case 46:
                    keyStr = 'Delete';
                    break;
                default:
                    keyStr = String.fromCharCode(key);
                    break;
            };

            return keyStr;
        };

        // Convert key codes to strings
        const keyStrs = keyCodes.map(keyToStr);

        // Save keybinds to backend
        window.__TAURI__.invoke("save_ptt_keys", {
            keys: keyStrs
        });
    },

    start: () => {
        // Create a tauri-based keybind listener
        window.__TAURI__.event.listen('ptt_toggle', toggleSelfMute);
    }
});

function toggleSelfMute(event: any) {
    console.log(event.payload);

    FluxDispatcher.dispatch({
        type: 'SPEAKING',
        context: 'default',
        userId: UserStore.getCurrentUser().id,
        speakingFlags: event.payload.state ? 1 : 0
    });
}
