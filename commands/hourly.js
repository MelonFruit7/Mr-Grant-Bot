const {pointsSymbol} = require('./userStats.js');
const {numWord} = require('./numToWord.js');

module.exports = {
    name: "hourly",
    description: "gives a certain amount of points hourly",
    exe(message, con) {
        con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
            if (err) throw err;
            if (result.length < 1) {
                con.query("INSERT INTO points (user, points, xp, lvl) VALUES (" + message.author.id + ", 50, 0, 0)", function (err, result) { if (err) throw err; });
                message.reply("You were given " + 50 + " " + pointsSymbol() + ", enjoy playing :)").catch(error => console.log("Error replying to a message (hourly comamnd)"));
                return;
            }
            con.query("UPDATE points SET points = " + parseInt(result[0].points + (50*Math.pow(1.3, result[0].lvl))) + " WHERE user = " + message.author.id);
            message.reply("You were given " + numWord(parseInt(50*Math.pow(1.3, result[0].lvl))) + " " + pointsSymbol()).catch(error => console.log("Error replying to a message (hourly comamnd)"));
        });
    }
}