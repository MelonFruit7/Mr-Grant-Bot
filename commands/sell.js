const {numWord} = require("./numToWord.js");
const {pointsSymbol} = require("./userStats.js");
module.exports = {
    name: "sell",
    description: "lets you sell stuff",
    exe(message, con) {
        const {price} = require("../stockPoint.json");
        if (message.content.indexOf(" ") != -1) {
            if (message.content.indexOf(" ", message.content.indexOf(" ") + 1) != -1) {
                if (message.content.substring(message.content.indexOf(" ") + 1, message.content.indexOf(" ", message.content.indexOf(" ") + 1)) == "sp") {
                    let amount = parseInt(message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1));
                    if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "half") amount = -1;
                    if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "all") amount = -1;
                    if (isNaN(amount)) return;

                    con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                        if (result.length > 0) {
                            if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "half") amount = parseInt(result[0].stockPoints / 2);
                            if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "all") amount = result[0].stockPoints;
                            if (result[0].stockPoints >= amount && amount > 0) {
                                con.query("UPDATE points SET stockPoints = " + (result[0].stockPoints - amount) + " WHERE user = " + message.author.id, (err, result) => {});
                                con.query("UPDATE points SET points = " + (result[0].points + amount*price) + " WHERE user = " + message.author.id, (err, result) => {});
                                message.reply("You sold " + numWord(amount) + " stock points (worth "+numWord(price)+" "+pointsSymbol()+" each) and got " + numWord(amount*price) + " " + pointsSymbol()).catch(error => console.log("Error replying to a message (sell command)"));
                            } else {
                                message.reply("You don't have this many stock points.").catch(error => console.log("Error replying to a message (sell command)"));
                            }
                        }
                    });
                }
            }
        }
    }
}