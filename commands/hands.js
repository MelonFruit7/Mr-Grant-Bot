module.exports = {
    name: "hands",
    description: "Outputs hands",
    options: [
        {
            type: "STRING",
            name: "hands",
            description: "Amount of hands",
            required: true   
        }
    ],
    exe(interaction) {
        let numHands = 10;
        numHands = parseInt(interaction.options.get("hands").value) <= 100 && parseInt(interaction.options.get("hands").value) > 0 ? parseInt(interaction.options.get("hands").value) : 10;
        let hands = [":clap", ":vulcan", ":love_you_gesture", ":thumbsup", ":wave", ":open_hands",
                     ":hand_splayed", ":pray", ":left_facing_fist", ":pinching_hand", ":right_facing_fist",
                     ":call_me", ":ok_hand", ":pinched_fingers", ":palms_up_together", ":fingers_crossed", ":v",
                     ":raised_hands", ":point_left", ":point_right", ":point_up_2", ":point_up", ":writing_hand"];
        let res = "";
        for (let i = 0; i < numHands; i++) res += hands[parseInt(Math.random() * hands.length)] + (Math.random() > 0.5 ? ":" : `_tone${parseInt((Math.random() * 5) + 1)}:`);
        interaction.reply(res).catch(error => console.log("Error replying to a message (hands comamnd)"));    
    }
}