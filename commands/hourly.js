const {pointsSymbol} = require('./userStats.js');
const {numWord} = require('./numToWord.js');

module.exports = {
    name: "hourly",
    description: "gives a certain amount of points hourly",
    exe(message, con) {
        con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
            if (err) throw err;
            con.query("UPDATE points SET points = " + parseInt(result[0].points + (50*Math.pow(1.3, result[0].lvl))) + " WHERE user = " + message.author.id);
            message.reply("You were given " + numWord(parseInt(50*Math.pow(1.3, result[0].lvl))) + " " + pointsSymbol()).catch(error => console.log("Error replying to a message (hourly comamnd)"));
        });
    }
}