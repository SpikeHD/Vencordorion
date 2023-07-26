import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "Dorion PTT",
    description: "Enable global push-to-talk for Dorion",
    authors: [Devs.SpikeHD],
    required: true,
    patches: [
        {
            find: "INPUT_MODE_VAD},{",
            replacement: {
                match: /name:.{1,2}\?.{1,2}\..{1,2}.Messages.INPUT_MODE_PTT_LIMITED:([^\}]+)/g,
                replace: "name:$1"
            }
        }
    ]
});
