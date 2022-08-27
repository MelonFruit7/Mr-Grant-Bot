const {client, Discord} = require("../index.js");
module.exports = {
    name: "roulette",
    description: "Multiplayer game based on luck",
    exe(message, Discord) {
        if (!gameMap.has(String(message.guild.id))) {
            message.channel.send({embeds: [new Discord.MessageEmbed().setTitle("**Roulette**")]}).then(msg => {
                msg.delete();
                    gameMap.set(String(message.guild.id), {botMsgId: String(msg.id), arr: [message.author], embedString: ""});
                    msg.react('✅').catch(error => console.log("error adding reaction to message (roulette command)")); 
            }).catch();
            setTimeout(() => {
                message.channel.send("Game Starting");
                let guildId = message.guild.id;
                gameMap.get(String(guildId)).botMsgId = "";
                let gameInterval = setInterval(() => {
                    if (gameMap.get(guildId).arr.length > 1) {
                        let survivor = gameMap.get(guildId).arr.splice(parseInt(Math.random() * gameMap.get(guildId).arr.length), 1);
                        let embed = new Discord.MessageEmbed();

                        embed.setTitle("**Roulette**");
                        gameMap.get(guildId).embedString = "";
                        gameMap.get(guildId).embedString += "**This Rounds Survivor 🙂** \n" + survivor + "\n\n" + "**" + gameMap.get(guildId).arr.length + " Remaining**\n\n";
                        for(let i = 0; i < gameMap.get(guildId).arr.length; i++) {
                            gameMap.get(guildId).embedString += `${gameMap.get(guildId).arr[i]}\n`;
                        }
                        embed.setDescription(gameMap.get(guildId).embedString);
                        embed.setFooter({
                            text: "⌛ Next Round Starts In 5 Seconds"
                        });
                        embed.setColor('PURPLE');
                        message.channel.send({embeds: [embed]}).then(msg => {
                            setTimeout(() => {msg.delete()}, 4000);
                        }).catch();
                    } else {
                        let embed = new Discord.MessageEmbed().setTitle("L + ratio + luck issue")
                                                              .setDescription(`🤡 ${gameMap.get(guildId).arr[0]} 🤡`)
                                                              .setThumbnail(`https://cdn.discordapp.com/avatars/${gameMap.get(guildId).arr[0].id}/${gameMap.get(guildId).arr[0].avatar}.png?size=256`)
                                                              .setColor('RED');

                        message.channel.send({embeds: [embed]}).then(() => {
                            clearInterval(gameInterval);
                            gameMap.delete(String(message.guild.id));
                        }).catch();
                    }
                }, 5000);
            }, 30000);
        } else {
            message.channel.send("A Game is Currently In progress");
        }
    }
}

let gameMap = new Map();
client.on('messageReactionAdd', (reaction, user) => {
  let guildId = reaction.message.guild.id;
  if (gameMap.has(guildId)) {
   if (reaction.message.id === gameMap.get(guildId).botMsgId && reaction.emoji.name == '✅') {
    for (let i = 0; i < gameMap.get(guildId).arr.length; i++) {
        if (user === gameMap.get(guildId).arr[i]) return;
    }
    gameMap.get(guildId).embedString = "";
    if (!user.bot) gameMap.get(guildId).arr.push(user);

    let embed = new Discord.MessageEmbed();
    embed.setTitle("**Roulette**");
    for (let i = 0; i < gameMap.get(guildId).arr.length; i++) {
        gameMap.get(guildId).embedString += `${gameMap.get(guildId).arr[i]}\n`;
    }
    embed.setDescription(gameMap.get(guildId).embedString);
    embed.setFooter({
        text: "Game starts in 30 seconds"
    });
    embed.setColor('PURPLE');
    reaction.message.edit({embeds: [embed]});
   }
  }
});