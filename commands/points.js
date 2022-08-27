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
                    message.reply(`${message.mentions.users.first()} has ${result[0].points} points`).catch(error => console.log("Error replying to message (points command)"));
                } else {
                    message.reply("This user does not have any points").catch(error => console.log("Error replying to message (points command)"));
                }
            });
        } else {
            con.query("SELECT * FROM points WHERE user = " + message.author.id, function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    message.reply(`You have ${result[0].points} points`).catch(error => console.log("Error replying to message (points command)"));
                } else {
                    message.reply("You don't have any points").catch(error => console.log("Error replying to message (points command)"));
                }
            });
        }
    }
}