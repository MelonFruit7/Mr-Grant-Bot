const Discord = require('discord.js');
const client = new Discord.Client({
    intents:["GUILDS", "GUILD_MESSAGES"]
});
const {prefix, token} = require('./config.json');


client.on('messageCreate', message => {
    if (message.author.bot) return;

    switch(message.content.substring(0,message.content.indexOf(" ") == -1 ? message.content.length : message.content.indexOf(" "))) {
        case `${prefix}say`:
                message.delete();
                if (message.content.length > 5) message.channel.send(message.content.substring(5,message.content.length));
        break;
        case `${prefix}ping`:
             message.channel.send("pong");
        break;
        case `${prefix}hands`:
            let numHands = 10;
            if (message.content.length > 6) {
                try {
                  numHands = parseInt(message.content.substring(7)) <= 100 ? parseInt(message.content.substring(7)) : 10;
                } catch(error) {
                  process.stdout.write("hands error");
                }
            }
            let hands = [":clap", ":vulcan", ":love_you_gesture", ":thumbsup", ":wave", ":open_hands",
                         ":hand_splayed", ":pray", ":left_facing_fist", ":pinching_hand", ":right_facing_fist",
                         ":call_me", ":ok_hand", ":pinched_fingers", ":palms_up_together", ":fingers_crossed", ":v",
                         ":raised_hands", ":point_left", ":point_right", ":point_up_2", ":point_up", ":writing_hand"];
            let res = "";
            for (let i = 0; i < numHands; i++) {
                res += hands[parseInt(Math.random() * hands.length)] + (Math.random() > 0.5 ? "" : `_tone${parseInt((Math.random() * 5) + 1)}:`);
            }
            message.delete();
            console.log(message.author.username + " used the hands command");
            message.channel.send(res);         
    }
});

client.login(token);
