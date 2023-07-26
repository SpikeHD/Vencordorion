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
            replacement: [
                {
                    match: /,(.{1,2})=!.{1,2}\..{1,2},(.{1,2})=\(/g,
                    replace: ",$1=false,$2=(",
                },
                {
                    match: /(.{1,2})=.{1,2}\..{1,3}\|\|(.{1,2}!==.{1,2}\..{1,3}\.PUSH_TO_TALK)/g,
                    replace: "$1=true"
                }
            ]
        }
    ]
});
