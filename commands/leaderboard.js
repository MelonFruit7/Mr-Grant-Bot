const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage} = require("./userStats.js");

module.exports = {
    name: "leaderboard",
    description: "leaderboard of points",
    exe(interaction, Discord, con, client) {
        let colors = ['RED', 'BLUE', 'PURPLE', 'GREEN', 'ORANGE'];
        let embed = new Discord.MessageEmbed();
        embed.setTitle("Points Leaderboard");
        embed.setColor(colors[parseInt(Math.random() * colors.length)]);
        let topTen = "", userPlacement = "";
        con.query("SELECT * FROM points ORDER BY points DESC", async (err, result) => {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                if (i < 10) {
                    await client.users.fetch(result[i].user).then(user => {
                        topTen += `**${i + 1}.** ${user.username} - ${numWord(result[i].points)} ${pointsSymbol()}\n`;
                    }).catch(() => {
                        topTen += `**${i + 1}.** <@${result[i].user}> - ${numWord(result[i].points)} ${pointsSymbol()}\n`;
                    });
                }
                if (interaction.user.id == result[i].user) {
                    let ext = "";
                    if ((i+1) % 100 > 10 && (i+1) % 100 < 20) {
                        ext += "th";
                    } else {
                        switch((i + 1) % 10) {
                            case 1: ext += "st";
                            break;
                            case 2: ext += "nd";
                            break;
                            case 3: ext += "rd";
                            break;
                            default: ext += "th";
                        }
                    }
                    userPlacement += `You are ${i + 1}${ext} with ${numWord(result[i].points)} points`;
                }
                if (userPlacement != "" && i >= 10) break;
            } 
            embed.setDescription(topTen);
            embed.setFooter({text: userPlacement});
            interaction.reply({embeds: [embed]});
        });
    }
}
