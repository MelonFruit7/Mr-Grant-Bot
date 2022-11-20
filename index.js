const Discord = require('discord.js');
const client = new Discord.Client({
    intents:["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES"]
});
const cooldown = new Map(), playingMap = new Map();
module.exports = {
    client: client,
    Discord: Discord,
};
const {prefix, token} = require('./config.json');
const request = require('request');


const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require('./commands/' + file);

    cooldown.set(command.name, new Map());
    client.commands.set(command.name, command);
}

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

const file = require("./stockPoint.json");
setInterval(() => {
    file.price = file.price * (Math.random() * 0.2 + 0.9014);
    if (file.price < 1) file.price *= 1.5;
    if (file.price > 1000000000000) file.price *= 0.9;
    fs.writeFile("./stockPoint.json", JSON.stringify(file), function writeJSON(err) {
        if (err) return console.log(err);
    });
}, 60000);

client.on('messageCreate', message => {
    //don't run if the messageCreated was by a bot
    if (message.author.bot) return;

    //Gets the command and puts it trhough a switch
    switch(message.content.substring(0,message.content.indexOf(" ") == -1 ? message.content.length : message.content.indexOf(" "))) {
        case `${prefix}query`:
        if(message.author.id == "489197333792292864") {
            con.query(message.content.substring(message.content.indexOf(" ") + 1, message.content.length), (err, result) => { 
                if (err) {
                    console.log("uhh don't make an error melon");
                    message.channel.send("<@489197333792292864> Error");
                } else {
                    message.channel.send("<@489197333792292864> Success");
                }
            });
        }
        break;
        case `${prefix}botStats`:
            client.commands.get("botStats").exe(message, Discord, client);
        break;
        case `${prefix}commands`:
            client.commands.get("commands").exe(message, Discord);
        break;
        //SAY COMMAND
        case `${prefix}say`:
            client.commands.get("say").exe(message);
        break;
        //PING COMMAND
        case `${prefix}ping`:
            client.commands.get("ping").exe(message, client);
        break;
        //HANDS COMMAND
        case `${prefix}hands`:
            client.commands.get("hands").exe(message);
        break;
        //Number to Word notation 
        case `${prefix}ntw`:
        case `${prefix}numToWord`:
            client.commands.get("numToWord").exe(message, Discord);
        break;
        //Define a word
        case `${prefix}define`:
            client.commands.get("define").exe(message, request);
        break;
        //Urabn Define a word
        case `${prefix}udefine`:
            client.commands.get("udefine").exe(message, request);
        break;
        //Cbowl
        case `${prefix}cbowl`:
            client.commands.get("cbowl").exe(message);
        break;
        //guess a number
        case `${prefix}guess`:
            client.commands.get("guess").exe(message, con, playingMap);
        break;
        //check your points
        case `${prefix}stats`:
            client.commands.get("userStats").exe(message, Discord, con);
        break;
        //Multipalyer roulette
        case `${prefix}roulette`:
            client.commands.get("roulette").exe(message, Discord);
        break;
        //Rock Paper Scissors
        case `${prefix}rps`:
            client.commands.get("rps").exe(message, Discord, con, playingMap);
        break;
        //Dice Command
        case `${prefix}dice`:
            client.commands.get("dice").exe(message, Discord, con, playingMap);
        break;
        //coinflip command
        case `${prefix}coinflip`:
        case `${prefix}cf`:
            client.commands.get("coinflip").exe(message, Discord, con, playingMap);
        break;
        //leaderboard
        case `${prefix}lb`:
        case `${prefix}leaderboard`:
            client.commands.get("leaderboard").exe(message, Discord, con);
        break;
        case `${prefix}hourly`:
            if (!cooldownFunc("hourly", 60000*60, message)) {
                client.commands.get("hourly").exe(message, con);
            }
        break;
        case `${prefix}battleship`:
            client.commands.get("battleship").exe(message, Discord, playingMap);
        break;
        case `${prefix}blackjack`:
        case `${prefix}bj`:
            client.commands.get("blackjack").exe(message, Discord, con, playingMap);
        break;
        case `${prefix}help`:
            client.commands.get("help").exe(message);
        break;
        case `${prefix}shop`:
            client.commands.get("shop").exe(message,Discord,con);
        break;
        case `${prefix}buy`:
            client.commands.get("buy").exe(message,con);
        break;
        case `${prefix}sell`:
            client.commands.get("sell").exe(message,con);
    }
});

//Returns true if the user has a cooldown otherwise sets a cooldown and returns false
function cooldownFunc(command, waitTimeMS, message) {
    let time = new Date().getTime()
    if (cooldown.get(command).has(message.author.id)) {
        let timePassed = time - cooldown.get(command).get(message.author.id);
        if (timePassed < waitTimeMS) {
            let waitTimeMin = parseInt((waitTimeMS - timePassed)/1000/60);
            let waitTimeSec = Math.round((waitTimeMS - timePassed)/1000)%60;
            message.channel.send(`${message.author} you have to wait ${waitTimeMin} min and ${waitTimeSec}s to use this command again`);
            return true;
        } else {
            cooldown.get(command).set(message.author.id, time);
            return false;
        }
    } else {
        cooldown.get(command).set(message.author.id, time);
        return false;
    }
}


client.login(token);
