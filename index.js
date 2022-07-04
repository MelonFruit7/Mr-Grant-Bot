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
            let hands = [":clap:", ":vulcan:", ":love_you_gesture:", ":thumbsup:", ":wave:", ":open_hands:",
                         ":hand_splayed:", ":pray:", ":left_facing_fist:", ":pinching_hand:", ":right_facing_fist:",
                         ":call_me:", ":ok_hand:", ":pinched_fingers:", ":palms_up_together:", ":fingers_crossed:", ":v:",
                         ":raised_hands:", ":point_left:", ":point_right:", ":point_up_2:", ":point_up:", ":writing_hand:"];
            let res = "";
            for (let i = 0; i < 10; i++) {
                res += hands[parseInt(Math.random() * hands.length)];
            }
            message.delete();
            message.channel.send(res);         
    }
});

client.login(token);
