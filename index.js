const Discord = require('discord.js');
const client = new Discord.Client({
    intents:["GUILDS", "GUILD_MESSAGES"]
});
const {prefix, token} = require('./config.json');

client.on('messageCreate', (message) => {
    if (message.content === "ping") {
        message.channel.send("pong");
    }
});

client.on('messageCreate', message => {
    if (message.content.startsWith(`${prefix}say`) && !message.author.bot) {
        message.delete();
        if (message.content.length > 5) message.channel.send(message.content.substring(5,message.content.length));
    }
});

client.login(token);
