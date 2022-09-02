module.exports = {
    name: "commands",
    description: "Shows a list of commands",
    exe(message, Discord) {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("**Commands**");
        embed.setDescription("```*say {word}\n*ping\n*hands\n*numToWord {num}\n*define {word}\n*udefine {word}\n*cbowl {minutes}\n*guess\n*points\n*roulette\n*rps {points}\n*dice {points}\n*cf {side} {points}\n*stats\n*lb```");
        message.channel.send({embeds: [embed]});  
    }
}