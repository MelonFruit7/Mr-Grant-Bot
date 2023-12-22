const {numWord} = require("./numToWord.js");
const {pointsSymbol} = require("./userStats.js");
module.exports = {
    name: "buy",
    description: "Allows a user buy stuff from the grant shop",
    options: [
        {
            type: "STRING",
            name: "item",
            description: "Item from shop",
            required: true
        },
        {
            type: "STRING",
            name: "amount",
            description: "Amount of this item",
            required: true
        }
    ],
    exe(interaction, con) {
        const {price} = require("../stockPoint.json");
        let item = interaction.options.get("item").value, amount = interaction.options.get("amount").value;

        if (item == "prestige") {
            con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
                if (result.length > 0) {
                    if (result[0].points >= 1000000 * Math.pow(result[0].badgeLevel + 1, 3.5)) {
                        con.query("UPDATE points SET points = " + (result[0].points - 1000000 * Math.pow(result[0].badgeLevel + 1, 3.5)) + " WHERE user = " + interaction.user.id, (error, result) => {});
                        con.query("UPDATE points SET badgeLevel = " + (result[0].badgeLevel + 1) + " WHERE user = " + interaction.user.id, (error, result) => {});
                        interaction.reply("Purchased Prestige Level " + (result[0].badgeLevel + 1) + " for " + numWord(1000000 * Math.pow(result[0].badgeLevel + 1, 3.5)) + " " + pointsSymbol()).catch(error => console.log("Error replying to a message (buy command)"));
                    } else {
                        interaction.reply("You don't have enough points to purchase the next tier prestige").catch(error => console.log("Error replying to a message (buy command)"));
                    }
                }
            });
        } else if (item == "sp") {
            amount = parseInt(amount);
            if (isNaN(amount) || amount < 1) return;
            con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
                if (result.length > 0) {
                    if (result[0].points >= amount * price) {
                        con.query("UPDATE points SET points = " + (result[0].points - amount*price) + " WHERE user = " + interaction.user.id, (error, result) => {});
                        con.query("UPDATE points SET stockPoints = " + (result[0].stockPoints + amount) + " WHERE user = " + interaction.user.id, (error, result) => {});
                        interaction.reply("Purchased " + numWord(amount) + " stock points (worth "+numWord(price)+" "+pointsSymbol()+" each) for "+numWord(amount*price)+" "+pointsSymbol()+" (the stock point price changes every minute)").catch(error => console.log("Error replying to a message (buy command)"));
                    } else {
                        interaction.reply("You don't have enough points to purchase this many stock points").catch(error => console.log("Error replying to a message (buy command)"));
                    }
                }
            });
        }
    }
}