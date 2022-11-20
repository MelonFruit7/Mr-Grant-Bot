const {numWord} = require("./numToWord.js");
const {pointsSymbol} = require("./userStats.js");
module.exports = {
    name: "buy",
    description: "lets a user buy stuff from the grant shop",
    exe(message, con) {
        const {price} = require("../stockPoint.json");
        if (message.content.indexOf(" ") != -1) {
            let temp = message.content.substring(message.content.indexOf(" ") + 1);
            if (temp == "prestige") {
                con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                    if (result.length > 0) {
                        if (result[0].points >= 1000000 * Math.pow(result[0].badgeLevel + 1, 3.5)) {
                            con.query("UPDATE points SET points = " + (result[0].points - 1000000 * Math.pow(result[0].badgeLevel + 1, 3.5)) + " WHERE user = " + message.author.id, (error, result) => {});
                            con.query("UPDATE points SET badgeLevel = " + (result[0].badgeLevel + 1) + " WHERE user = " + message.author.id, (error, result) => {});
                            message.reply("Purchased Prestige Level " + (result[0].badgeLevel + 1) + " for " + numWord(1000000 * Math.pow(result[0].badgeLevel + 1, 3.5)) + " " + pointsSymbol()).catch(error => console.log("Error replying to a message (buy command)"));
                        } else {
                            message.reply("You don't have enough points to purchase the next tier prestige").catch(error => console.log("Error replying to a message (buy command)"));
                        }
                    }
                });
            } else if (temp.startsWith("sp")) {
                if (message.content.indexOf(" ", message.content.indexOf(" ") + 1) != -1) {
                    let amount = parseInt(message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1));
                    if (isNaN(amount) || amount < 1) return;
                    con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                        if (result.length > 0) {
                            if (result[0].points >= amount * price) {
                                con.query("UPDATE points SET points = " + (result[0].points - amount*price) + " WHERE user = " + message.author.id, (error, result) => {});
                                con.query("UPDATE points SET stockPoints = " + (result[0].stockPoints + amount) + " WHERE user = " + message.author.id, (error, result) => {});
                                message.reply("Purchased " + numWord(amount) + " stock points (worth "+numWord(price)+" "+pointsSymbol()+" each) for "+numWord(amount*price)+" "+pointsSymbol()+" (the stock point price changes every minute)").catch(error => console.log("Error replying to a message (buy command)"));
                            } else {
                                message.reply("You don't have enough points to purchase this many stock points").catch(error => console.log("Error replying to a message (buy command)"));
                            }
                        }
                    });
                }
            }
        }
    }
}