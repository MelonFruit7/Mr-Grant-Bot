module.exports = {
    name: "commands",
    description: "Shows a list of commands",
    exe(interaction, Discord) {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("**Commands**");
        embed.setDescription("```/say {word}\n/ping\n/hands\n/num_to_word {num}\n/define {word}\n/udefine {word}\n/cbowl {minutes}\n/guess\n/stats\n/roulette\n/rps {points}\n/dice {points}\n/coinflip {side} {points}\n/bot_stats\n/leaderboard\n/hourly\n/battleship {user} {gamemode}\n/blackjack {points}\n/lottery {points}\n/help\n/shop```");
        interaction.reply({embeds: [embed]}).catch(error => console.log("Error replying to a message (commands comamnd)"));  
    }
}