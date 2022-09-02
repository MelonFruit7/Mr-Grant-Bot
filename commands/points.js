const {numWord} = require("./numToWord.js");

module.exports = {
    name: "points",
    description: "Displays a users points",
    exe(message, con) {
        if (message.content.indexOf(" ") != -1) {
            if (message.mentions.users.first() == undefined) {
                message.reply("Not a user").catch(error => console.log("Error replying to message (points command)"));
                return;
            }
            con.query("SELECT * FROM points WHERE user = " + message.mentions.users.first().id, function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    message.reply(`${message.mentions.users.first()} has ${numWord(result[0].points)} ${pointsSymbol()}`).catch(error => console.log("Error replying to message (points command)"));
                } else {
                    message.reply("This user does not have any points").catch(error => console.log("Error replying to message (points command)"));
                }
            });
        } else {
            con.query("SELECT * FROM points WHERE user = " + message.author.id, function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    message.reply(`You have ${numWord(result[0].points)} ${pointsSymbol()}`).catch(error => console.log("Error replying to message (points command)"));
                } else {
                    message.reply("You don't have any points").catch(error => console.log("Error replying to message (points command)"));
                }
            });
        }
    },
    pointsSymbol() {
        return "<:points:1013179263547084900>";
    },
    pointsImage() {
        return "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b9347f46-a81e-4c42-8322-192a0181c8a6/d6p9iud-8ff4bad0-9810-4a13-ad44-4354afee3f14.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2I5MzQ3ZjQ2LWE4MWUtNGM0Mi04MzIyLTE5MmEwMTgxYzhhNlwvZDZwOWl1ZC04ZmY0YmFkMC05ODEwLTRhMTMtYWQ0NC00MzU0YWZlZTNmMTQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.EeiwQqATdqYhgIWeJkz4KmV19c6httUbnwclZs8xX24";
    }
}

function pointsSymbol() {
    return "<:points:1013179263547084900>";
}