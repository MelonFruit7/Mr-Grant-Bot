const Discord = require('discord.js');
const client = new Discord.Client({
    intents:["GUILDS", "GUILD_MESSAGES"]
});
const {prefix, token} = require('./config.json');
const request = require('request');

//MYSQL login
const mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "%Melon123%", //Not a secret :)
  database: "sys"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
})
//MYSQL login


client.on('messageCreate', message => {
    //don't run if the messageCreated was by a bot
    if (message.author.bot) return;

    //Gets the command and puts it trhough a switch
    switch(message.content.substring(0,message.content.indexOf(" ") == -1 ? message.content.length : message.content.indexOf(" "))) {
        //SAY COMMAND
        case `${prefix}say`:
                message.delete();
                if (message.content.indexOf(" ") != -1) message.channel.send(message.content.substring(message.content.substring(message.content.indexOf(" ") + 1)));
        break;
        //PING COMMAND
        case `${prefix}ping`:
             message.channel.send("pong");
        break;
        //HANDS COMMAND
        case `${prefix}hands`:
            let numHands = 10;
            if (message.content.indexOf(" ") != -1) {
                try {
                  numHands = parseInt(message.content.substring(7)) <= 100 && parseInt(message.content.substring(message.content.indexOf(" ") + 1)) > 0 ? parseInt(message.content.substring(message.content.indexOf(" ") + 1)) : 10;
                } catch(error) {
                  process.stdout.write("hands error");
                }
            }
            let hands = [":clap", ":vulcan", ":love_you_gesture", ":thumbsup", ":wave", ":open_hands",
                         ":hand_splayed", ":pray", ":left_facing_fist", ":pinching_hand", ":right_facing_fist",
                         ":call_me", ":ok_hand", ":pinched_fingers", ":palms_up_together", ":fingers_crossed", ":v",
                         ":raised_hands", ":point_left", ":point_right", ":point_up_2", ":point_up", ":writing_hand"];
            let res = "";
            for (let i = 0; i < numHands; i++) {
                res += hands[parseInt(Math.random() * hands.length)] + (Math.random() > 0.5 ? ":" : `_tone${parseInt((Math.random() * 5) + 1)}:`);
            }
            message.delete();
            message.channel.send(res);   
        break;
        //Number to Word notation 
        case `${prefix}numToWord`:
            if (message.content.indexOf(" ") != -1) {
                try {
                    let embed = new Discord.MessageEmbed();
                    embed.setDescription(numberNotation(parseInt(message.content.substring(message.content.indexOf(" ") + 1))));
                    message.channel.send({embeds: [embed]});
                } catch(error) {
                    process.stdout.write("numberNotation error");
                }
            }
        break;
        //Define a word
        case `${prefix}define`:
            if (message.content.indexOf(" ") != -1) {
                request('https://api.dictionaryapi.dev/api/v2/entries/en/' + message.content.substring(message.content.indexOf(" ") + 1), function (error, response, body) {
                 if (!error && response.statusCode == 200) {
                    let importedJSON = JSON.parse(body);
                    message.channel.send(importedJSON[0].meanings[0].definitions[0].definition);
                 } else {
                    message.channel.send("Sorry couldn't find your word");
                 }
                });
            }
        break;
        //Urabn Define a word
        case `${prefix}udefine`:
            if (message.content.indexOf(" ") != -1) {
                request('https://api.urbandictionary.com/v0/define?term=' + message.content.substring(message.content.indexOf(" ") + 1), (error,response,body) => {
                  if (JSON.parse(body).list[0] == null) {
                     message.channel.send("Sorry couldn't find your word");
                     return;
                  }
                 if (!error && response.statusCode == 200) {
                    let importedJSON = JSON.parse(body);
                    message.channel.send(importedJSON.list[0].definition);
                 } else {
                    message.channel.send("Sorry an Error has occured");
                 }
                });
            }
        break;
        case `${prefix}cbowl`:
            if (message.content.indexOf(" ") != -1) {
                message.channel.send(Math.floor((parseInt(message.content.substring(7)) / 43.0) * 100) / 100.0 + " cereal bowls");
            }
        break;
        case `${prefix}guess`:
            message.channel.send("Guess a number between 1 - 5");
            let answer = parseInt(Math.random() * 5) + 1;
            
            let msg_filter = (m) => m.author.id === message.author.id;
            message.channel.awaitMessages({filter: msg_filter, time: 5000, max: 1}).then(x => {
                let msg = x.first();
                      if (!(msg.content == answer)) {
                          return msg.reply("The correct answer was " + answer);
                      }

                      con.query("SELECT * FROM points WHERE user = " + message.author.id, function (err, result) {
                        if (err) throw err;
                        if (result.length == 0) {
                            con.query("INSERT INTO points (user, points) VALUES (" + message.author.id + ", 1)", function (err, result) {
                                if (err) throw err;
                                message.reply("Congrats you earned your first point");
                            });
                        } else {
                            let points = parseInt(result[0].points);
                            con.query("UPDATE points SET points = " + (points + 1) + " WHERE user = " + message.author.id, function(err, result) {
                                if (err) throw err;
                                message.reply("Congrats you gained a point, you now have " + (points + 1) + " points");
                            });
                        }
                      });

                      return msg.channel.send(`Congrats, ${msg.author}! You Guessed The Number Correctly! It Was ${answer}`);
            }).catch(() => {
                message.channel.send("L Bozo you ran out of time");
            });
    }
});

function numberNotation(number) {
    number = Math.floor(number);
      var zeros = number.toLocaleString('fullwide', { useGrouping: false });
      var abrevation = ["", "K", " Million", " Billion", " Trillion", " Quadrillion", " Quintillion", " Sextillion", " Septillion", " Octillion", " Nonillion", " Decillion", " Undecillion", " Duodecillion", " Tredecillion", " Quattuordecillion", " Quindecillion", " Sexdecillion", " Septendecillion", " Octodecillion", " Novemdecillion", " Vigintillion", " Unvigintillion", " Duovigintillion", " Trevigintillion", " Quattuorvigintillion", " Quinvigintillion", " Sesvigintillion", " Septenvigintillion", " Octovigintillion"];
      var findNumber = Math.floor(((zeros.length - 1) / 3));
      if (findNumber >= abrevation.length) return "Number is beyond Octovigintillion"

      number /= Math.pow(1000, findNumber);
      number = Math.round(number * 100) / 100;
      return number + abrevation[findNumber];
}


client.login(token);
