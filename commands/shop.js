const {numWord} = require("./numToWord.js");
const {pointsSymbol} = require("./userStats.js");
module.exports = {
    name: "shop",
    description: "Displays items that you can purchase with points",
    exe(message, Discord, con) {
        const {price} = require("../stockPoint.json");
        con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
            if (result.length > 0) {
                let embed = new Discord.MessageEmbed();
                embed.setTitle("SHOP!");
                let embedDesc = "***Items:***\n\n";
                embedDesc += "**Prestige Badge Level " + (result[0].badgeLevel + 1) + " 🐔**\nCost: **" +numWord(1000000 * Math.pow(result[0].badgeLevel + 1, 3.5)) + " " + pointsSymbol() + "**\nCommand: \\*buy prestige\n\n";
                embedDesc += "**STOCK POINT** 🐦\nCost: **"+ numWord(price)+" "+pointsSymbol()+"**\nCommands: \\*buy sp {amount}, \\*sell sp {amount}";
                embed.setDescription(embedDesc);
                embed.setColor("GREEN");
                message.reply({embeds: [embed]}).catch(error => console.log("Error replying to a message (shop comamnd)"));
            }
        });
    }
}