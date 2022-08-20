const Discord = require('discord.js');
const client = new Discord.Client({
    intents:["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"]
});
const {prefix, token} = require('./config.json');
const request = require('request');

//MYSQL login
const mysql = require('mysql');

var db_info = {
  host: "localhost",
  user: "root",
  password: "%Melon123%", //Not a secret :)
  database: "sys"
};
var con;

function handleDisconnect() {
    con = mysql.createConnection(db_info); 
                                                   
  
    con.connect(function(err) {              
      if(err) {                                
        console.log("error when connecting to db");
        setTimeout(handleDisconnect, 2000); 
      } else {
        console.log("Connected!");
      }                                     
    });                                     
                                           
    con.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
        handleDisconnect();                         
      } else {                                      
        throw err;                                  
      }
    });
  }
handleDisconnect();
//MYSQL login


client.on('messageCreate', message => {
    //don't run if the messageCreated was by a bot
    if (message.author.bot) return;

    //Gets the command and puts it trhough a switch
    switch(message.content.substring(0,message.content.indexOf(" ") == -1 ? message.content.length : message.content.indexOf(" "))) {
        //SAY COMMAND
        case `${prefix}commands`:
            let embed = new Discord.MessageEmbed();
            embed.setTitle("**Commands**");
            embed.setDescription("```*say {word}\n*ping\n*hands\n*numToWord {num}\n*define {word}\n*udefine {word}\n*cbowl {minutes}\n*guess\n*points\n*roulette\n*rps {points}```");
            message.channel.send({embeds: [embed]});
        break;
        case `${prefix}say`:
                message.delete();
                if (message.content.indexOf(" ") != -1 && message.member.permissions.has(['ADMINISTRATOR'])) {
                    message.channel.send(message.content.substring(message.content.indexOf(" ") + 1));
                } else {
                    message.reply("Need Admin To Use");
                }
        break;
        //PING COMMAND
        case `${prefix}ping`:
             message.channel.send(`🏓Pong! \n Latency is ${Date.now() - message.createdTimestamp}ms. \n API Latency is ${Math.round(client.ws.ping)}ms`);
        break;
        //HANDS COMMAND
        case `${prefix}hands`:
            let numHands = 10;
            if (message.content.indexOf(" ") != -1) {
                try {
                  numHands = parseInt(message.content.substring(message.content.indexOf(" ") + 1)) <= 100 && parseInt(message.content.substring(message.content.indexOf(" ") + 1)) > 0 ? parseInt(message.content.substring(message.content.indexOf(" ") + 1)) : 10;
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
            con.query("SELECT * FROM points WHERE user = " + message.author.id, function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    if (result[0].playing == 0) {
                       setPlayingGame(message.author.id, 1);
                       message.reply("Guess a number between 1 - 1000");
                       let answer = parseInt(Math.random() * 1000) + 1;
                       guessCommand(answer, message, 4000);

                    } else {
                        message.reply("You are currently playing");
                    }
                } else {
                    con.query("INSERT INTO points (user, points, playing) VALUES (" + message.author.id + ", 0, 1)", function (err, result) { if (err) throw err; });
                    message.reply("Guess a number between 1 - 1000");
                    let answer = parseInt(Math.random() * 1000) + 1;
                    guessCommand(answer, message, 4000);
                }
            });
        break;
        case `${prefix}points`:
            if (message.content.indexOf(" ") != -1) {
                if (message.mentions.users.first() == undefined) {
                    message.reply("Not a user");
                    return;
                }
                con.query("SELECT * FROM points WHERE user = " + message.mentions.users.first().id, function(err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        message.reply(`${message.mentions.users.first()} has ${result[0].points} points`);
                    } else {
                        message.reply("This user does not have any points");
                    }
                });
            } else {
                con.query("SELECT * FROM points WHERE user = " + message.author.id, function(err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        message.reply(`You have ${result[0].points} points`);
                    } else {
                        message.reply("You don't have any points");
                    }
                });
            }
        break;
        case `${prefix}roulette`:
        if (!gameMap.has(String(message.guild.id))) {
            message.channel.send({embeds: [new Discord.MessageEmbed().setTitle("**Roulette**")]}).then(msg => {
                    gameMap.set(String(message.guild.id), {botMsgId: String(msg.id), arr: [message.author], embedString: ""});
                    msg.react('✅'); 
            }).catch();
            setTimeout(() => {
                message.channel.send("Game Starting");
                let guildId = message.guild.id;
                gameMap.get(String(guildId)).botMsgId = "";
                let gameInterval = setInterval(() => {
                    if (gameMap.get(guildId).arr.length > 1) {
                        let survivor = gameMap.get(guildId).arr.splice(parseInt(Math.random() * gameMap.get(guildId).arr.length), 1);
                        let embed = new Discord.MessageEmbed();

                        embed.setTitle("**Roulette**");
                        gameMap.get(guildId).embedString = "";
                        gameMap.get(guildId).embedString += "**This Rounds Survivor 🙂** \n" + survivor + "\n\n" + "**" + gameMap.get(guildId).arr.length + " Remaining**\n\n";
                        for(let i = 0; i < gameMap.get(guildId).arr.length; i++) {
                            gameMap.get(guildId).embedString += `${gameMap.get(guildId).arr[i]}\n`;
                        }
                        embed.setDescription(gameMap.get(guildId).embedString);
                        embed.setFooter({
                            text: "⌛ Next Round Starts In 5 Seconds"
                        });
                        embed.setColor('PURPLE');
                        message.channel.send({embeds: [embed]}).then(msg => {
                            setTimeout(() => {msg.delete()}, 4000);
                        }).catch();
                    } else {
                        let embed = new Discord.MessageEmbed().setTitle("L + ratio + luck issue")
                                                              .setDescription(`🤡 ${gameMap.get(guildId).arr[0]} 🤡`)
                                                              .setThumbnail(`https://cdn.discordapp.com/avatars/${gameMap.get(guildId).arr[0].id}/${gameMap.get(guildId).arr[0].avatar}.png?size=256`)
                                                              .setColor('RED');

                        message.channel.send({embeds: [embed]}).then(() => {
                            clearInterval(gameInterval);
                            gameMap.delete(String(message.guild.id));
                        }).catch();
                    }
                }, 5000);
            }, 30000);
        } else {
            message.channel.send("A Game is Currently In progress");
        }
        break;
        case `${prefix}rps`:
         let rpsArr = ["🗿", "📄", "✂️"];
         if (message.content.indexOf(" ") != -1) {
            let bet = parseInt(message.content.substring(message.content.indexOf(" ") + 1));
            if (message.content.substring(message.content.indexOf(" ") + 1) == "half") bet = -1337;
            if (!isNaN(bet)) {
              con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    if (result[0].playing == 1) {
                        message.reply("You are currently playing a game");
                        return;
                    }
                    if (bet == -1337) bet = parseInt(result[0].points / 2);
                    setPlayingGame(message.author.id, 1);
                    if (bet > result[0].points / 2 || bet <= 0) {
                        setPlayingGame(message.author.id, 0);
                        message.reply("Can't bet more than half of your points (or 0 points)");
                        return;
                    }
                    let embed = new Discord.MessageEmbed(); 
                    embed.setTitle("**Rock 🗿, Paper 📄, Scissors✂️**");
                    embed.setDescription("Wager: "+bet+" points\nPoints:```js\n"+(result[0].points - bet)+"```");
                    message.channel.send({embeds: [embed]}).then(msg => {
                        msg.react("🗿");
                        msg.react("📄");
                        msg.react("✂️");
                        let filter = (reaction, user) => {
                            return (reaction.emoji.name == "🗿" || reaction.emoji.name == "📄" || reaction.emoji.name == "✂️")
                            && user.id == message.author.id;
                        }
                        msg.awaitReactions({filter, max: 1, time: 15000, errors: ["time"]}).then(x => {
                            let rpsAnswer = parseInt(Math.random() * 3);
                            let yourAnswer = null;
                            switch(String(x.first().emoji)) {
                                case "🗿": yourAnswer = 0;
                                break;
                                case "📄": yourAnswer = 1;
                                break;
                                case "✂️": yourAnswer = 2;
                            }
                            //Tie
                            if (yourAnswer === rpsAnswer) {
                            embed.setDescription("Wager: "+bet+" points\nPoints:```js\n"+(result[0].points)+"```\n**It's a Tie!**\n"+rpsArr[yourAnswer]+" vs " + rpsArr[rpsAnswer]);
                            msg.edit({embeds: [embed]});
                            //Bot Wins
                            } else if (yourAnswer === (rpsAnswer - 1 < 0 ? 2 : rpsAnswer - 1)) {
                            con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
                            embed.setDescription("Wager: "+bet+" points\nPoints:```js\n"+(result[0].points - bet)+"```\n**You Lost!**\n"+rpsArr[yourAnswer]+" vs " + rpsArr[rpsAnswer]);
                            msg.edit({embeds: [embed]});
                            //You Win
                            } else if(rpsAnswer === (yourAnswer - 1 < 0 ? 2 : yourAnswer - 1)) {
                            con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
                            embed.setDescription("Wager: "+bet+" points\nPoints:```js\n"+(result[0].points + bet)+"```\n**You Won!**\n"+rpsArr[yourAnswer]+" vs " + rpsArr[rpsAnswer]);
                            msg.edit({embeds: [embed]});
                            }
                            setPlayingGame(message.author.id, 0);
                        }).catch(() => {
                            setPlayingGame(message.author.id, 0);
                            message.reply("Bro can't even play rock paper scissors (you ran out of time)");
                        });
                    });
                } else {
                    message.reply("You don't have points");
                }
              });
            } else {
                message.reply("Ayo no");
            }
         } else {
            message.reply("Bet some of your points");
         }
    }
});


let gameMap = new Map();
client.on('messageReactionAdd', (reaction, user) => {
  let guildId = reaction.message.guild.id;
  if (gameMap.has(guildId)) {
   if (reaction.message.id === gameMap.get(guildId).botMsgId && reaction.emoji.name == '✅') {
    for (let i = 0; i < gameMap.get(guildId).arr.length; i++) {
        if (user === gameMap.get(guildId).arr[i]) return;
    }
    gameMap.get(guildId).embedString = "";
    if (!user.bot) gameMap.get(guildId).arr.push(user);

    let embed = new Discord.MessageEmbed();
    embed.setTitle("**Roulette**");
    for (let i = 0; i < gameMap.get(guildId).arr.length; i++) {
        gameMap.get(guildId).embedString += `${gameMap.get(guildId).arr[i]}\n`;
    }
    embed.setDescription(gameMap.get(guildId).embedString);
    embed.setFooter({
        text: "Game starts in 30 seconds"
    });
    embed.setColor('PURPLE');
    reaction.message.edit({embeds: [embed]});
   }
  }
});

function guessCommand(answer, message, points) {
    if (points == 0) {
        setPlayingGame(message.author.id, 0);
        message.reply("You took too many guesses no points for you, the answer was " + answer);
        return;
    }
    let msg_filter = (m) => m.author.id === message.author.id;
    message.channel.awaitMessages({filter: msg_filter, time: 10000, max: 1}).then(x => {
        let msg = x.first();
        if (String(parseInt(msg.content)) == "NaN") {
            guessCommand(answer, message, parseInt(points / 2));
            msg.reply("Numbers Only :(");
            return;
        }
              if (!(parseInt(msg.content) == answer)) {
                  if (parseInt(msg.content) > answer) {
                    msg.reply("Guess Lower");
                  } else {
                    msg.reply("Guess Higher");
                  }
                  guessCommand(answer, message, parseInt(points / 2));
                  return;
              }

              con.query("SELECT * FROM points WHERE user = " + message.author.id, function (err, result) {
                if (err) throw err;
                    let currentPoints = parseInt(result[0].points);
                    con.query("UPDATE points SET points = " + (currentPoints + points) + " WHERE user = " + message.author.id, function(err, result) {
                        if (err) throw err;
                        message.reply("Congrats you gained " + points + " points, you now have " + (currentPoints + points) + " points");
                    });
              });

              setPlayingGame(message.author.id, 0);
              return msg.channel.send(`Congrats, ${msg.author}! You Guessed The Number Correctly! It Was ${answer}`);
    }).catch(() => {
        setPlayingGame(message.author.id, 0);
        message.reply("L Bozo you ran out of time");
    });
}

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

function setPlayingGame(id, set) {
    con.query("UPDATE points SET playing = "+set+" WHERE user = " + id, (err, result) => {
        if (err) throw err;
    });
}


client.login(token);
