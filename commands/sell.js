const {numWord} = require("./numToWord.js");
const {pointsSymbol, getPointsForBet} = require("./userStats.js");
module.exports = {
    name: "sell",
    description: "Lets you sell stuff",
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

        if (item == "sp") {
            con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
                if (result.length > 0) {
                    amount = getPointsForBet(amount, result[0].stockPoints); //Works perfectly here to allow user to enter percentages or number of items they want to sell
                    if (result[0].stockPoints >= amount && amount > 0) {
                        con.query("UPDATE points SET stockPoints = " + (result[0].stockPoints - amount) + " WHERE user = " + interaction.user.id, (err, result) => {});
                        con.query("UPDATE points SET points = " + (result[0].points + amount*price) + " WHERE user = " + interaction.user.id, (err, result) => {});
                        interaction.reply("You sold " + numWord(amount) + " stock points (worth "+numWord(price)+" "+pointsSymbol()+" each) and got " + numWord(amount*price) + " " + pointsSymbol()).catch(error => console.log("Error replying to a message (sell command)"));
                    } else {
                        interaction.reply("You don't have this many stock points.").catch(error => console.log("Error replying to a message (sell command)"));
                    }
                }
            });
        }
    }
}