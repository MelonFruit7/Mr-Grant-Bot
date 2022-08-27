const Discord = require('discord.js');
const client = new Discord.Client({
    intents:["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"]
});
module.exports = {
    client: client,
    Discord: Discord
};
const {prefix, token} = require('./config.json');
const request = require('request');


const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require('./commands/' + file);

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


client.on('messageCreate', message => {
    //don't run if the messageCreated was by a bot
    if (message.author.bot) return;

    //Gets the command and puts it trhough a switch
    switch(message.content.substring(0,message.content.indexOf(" ") == -1 ? message.content.length : message.content.indexOf(" "))) {
        //SAY COMMAND
        case `${prefix}commands`:
            client.commands.get("commands").exe(message, Discord);
        break;
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
        case `${prefix}cbowl`:
            client.commands.get("cbowl").exe(message);
        break;
        case `${prefix}guess`:
            client.commands.get("guess").exe(message, con);
        break;
        case `${prefix}points`:
            client.commands.get("points").exe(message, con);
        break;
        case `${prefix}roulette`:
            client.commands.get("roulette").exe(message, Discord);
        break;
        case `${prefix}rps`:
         client.commands.get("rps").exe(message, Discord, con);
    }
});

function setPlayingGame(id, set) {
    con.query("UPDATE points SET playing = "+set+" WHERE user = " + id, (err, result) => {
        if (err) throw err;
    });
}


client.login(token);
