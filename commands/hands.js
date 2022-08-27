module.exports = {
    name: "hands",
    description: "Outputs hands",
    exe(message) {
        let numHands = 10;
        if (message.content.indexOf(" ") != -1) {
            numHands = parseInt(message.content.substring(message.content.indexOf(" ") + 1)) <= 100 && parseInt(message.content.substring(message.content.indexOf(" ") + 1)) > 0 ? parseInt(message.content.substring(message.content.indexOf(" ") + 1)) : 10;
        }
        let hands = [":clap", ":vulcan", ":love_you_gesture", ":thumbsup", ":wave", ":open_hands",
                     ":hand_splayed", ":pray", ":left_facing_fist", ":pinching_hand", ":right_facing_fist",
                     ":call_me", ":ok_hand", ":pinched_fingers", ":palms_up_together", ":fingers_crossed", ":v",
                     ":raised_hands", ":point_left", ":point_right", ":point_up_2", ":point_up", ":writing_hand"];
        let res = "";
        for (let i = 0; i < numHands; i++) {
            res += hands[parseInt(Math.random() * hands.length)] + (Math.random() > 0.5 ? ":" : `_tone${parseInt((Math.random() * 5) + 1)}:`);
        }
        if (message.deletable) message.delete().catch(error => console.log("error deleting a message (hands command)"));
        message.channel.send(res);              
    }
}