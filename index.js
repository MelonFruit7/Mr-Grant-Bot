const Discord = require('discord.js');
const client = new Discord.Client({
    intents:["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES"]
});
const cooldown = new Map(), playingMap = new Map();
let commandTracker = new Map([]);

module.exports = {
    client: client,
    Discord: Discord,
};
const { token } = require('./config.json');
const request = require('@cypress/request');


const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
client.once('ready', async () => {
  //client.application.commands.set([]); //This gets rid of slash commands
  //await client.application.commands.create({name: "query", description: "Query the database", options: [{type: "STRING", name: "query", description: "Query parameter", required: true}]}); //Makes the query command for me
  //await client.application.commands.create({name: "play", description: "Command for game inputs", options: [{type: "STRING", name: "input", description: "Game Input", required: true}]}); //Makes the play command for me

	for (const file of commandFiles) { //Makes slash commands for all commands
	  const command = require('./commands/' + file); 
		cooldown.set(command.name, new Map()); //Cooldown map for the command
    commandTracker.set(command.name, 0); //Tracks the use of commands
		client.commands.set(command.name, command); //A map to access our commands

    /*
    console.log(command.name);
		await client.application.commands.create({ //Initialize slash commands
	    		name: command.name,
	    		description: command.description,
          options: command.options
		});
    */
	}
});

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
    if (file.price > 100000000) file.price *= 0.9;
    fs.writeFile("./stockPoint.json", JSON.stringify(file), function writeJSON(err) {
        if (err) return console.log(err);
    });
}, 60000);


client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return;
    
    const { commandName } = interaction;

    //Gets the command and puts it trhough a switch
    switch (commandName) {
      case "query":
        if(interaction.user.id == "489197333792292864") {
          if (interaction.options.get("query").value == "stats") {
            let embed = new Discord.MessageEmbed();
            embed.setTitle("Bot Command Usage");
            embed.setColor("AQUA");
            let desc = "";
            commandTracker = new Map([...commandTracker.entries()].sort((a, b) => b[1] - a[1])); //Sort the command tracker
            commandTracker.forEach(function(value, key) {
              desc += `${key.toUpperCase()}: ${value}\n`;
            });
            embed.setDescription(desc);
            interaction.reply({embeds: [embed]});
          } else {
            con.query(interaction.options.get("query").value, (err, result) => { 
              if (err) {
                console.log("uhh don't make an error melon");
                interaction.reply("<@489197333792292864> Error");
              } else {
                interaction.reply("<@489197333792292864> Success");
              }
            });
          }
        }
        break;
    	case "bot_stats":
    		client.commands.get("bot_stats").exe(interaction, Discord, client);
        commandTracker.set("bot_stats", commandTracker.get("bot_stats")+1);
        break;
      case "commands":
        client.commands.get("commands").exe(interaction, Discord, con, playingMap);
        commandTracker.set("commands", commandTracker.get("commands")+1);
        break;
      case "say":
        client.commands.get("say").exe(interaction);
        commandTracker.set("say", commandTracker.get("say")+1);
        break;
      case "ping":
        client.commands.get("ping").exe(interaction, client);
        commandTracker.set("ping", commandTracker.get("ping")+1);
        break;
      case "hands":
        client.commands.get("hands").exe(interaction);
        commandTracker.set("hands", commandTracker.get("hands")+1);
        break;
      case "num_to_word":
        client.commands.get("num_to_word").exe(interaction, Discord);
        commandTracker.set("num_to_word", commandTracker.get("num_to_word")+1);
        break;
      case "define":
        client.commands.get("define").exe(interaction, request);
        commandTracker.set("define", commandTracker.get("define")+1);
        break;
      case "udefine":
        client.commands.get("udefine").exe(interaction, request);
        commandTracker.set("udefine", commandTracker.get("udefine")+1);
        break;
      case "cbowl":
        client.commands.get("cbowl").exe(interaction);
        commandTracker.set("cbowl", commandTracker.get("cbowl")+1);
        break;
      case "guess":
        client.commands.get("guess").exe(interaction, con, playingMap, client);
        commandTracker.set("guess", commandTracker.get("guess")+1);
        break;
      case "stats":
        client.commands.get("stats").exe(interaction, Discord, con, client);
        commandTracker.set("stats", commandTracker.get("stats")+1);
        break;
      case "roulette":
        client.commands.get("roulette").exe(interaction, Discord);
        commandTracker.set("roulette", commandTracker.get("roulette")+1);
        break;
      case "rps":
        client.commands.get("rps").exe(interaction, Discord, con, playingMap);
        commandTracker.set("rps", commandTracker.get("rps")+1);
        break;
      case "dice":
        client.commands.get("dice").exe(interaction, Discord, con, playingMap);
        commandTracker.set("dice", commandTracker.get("dice")+1);
        break;
      case "coinflip":
        client.commands.get("coinflip").exe(interaction, Discord, con, playingMap);
        commandTracker.set("coinflip", commandTracker.get("coinflip")+1);
        break;
      case "leaderboard":
        client.commands.get("leaderboard").exe(interaction, Discord, con, client);
        commandTracker.set("leaderboard", commandTracker.get("leaderboard")+1);
        break;
      case "hourly":
        if (!cooldownFunc("hourly", 60000*60, interaction)) client.commands.get("hourly").exe(interaction, con);
        commandTracker.set("hourly", commandTracker.get("hourly")+1); //I want data regardless of cooldown
        break;
      case "battleship":
        client.commands.get("battleship").exe(interaction, Discord, playingMap);
        commandTracker.set("battleship", commandTracker.get("battleship")+1);
        break;
      case "blackjack":
        client.commands.get("blackjack").exe(interaction, Discord, con, playingMap);
        commandTracker.set("blackjack", commandTracker.get("blackjack")+1);
        break;
      case "help":
        client.commands.get("help").exe(interaction);
        commandTracker.set("help", commandTracker.get("help")+1);
        break;
      case "shop":
        client.commands.get("shop").exe(interaction,Discord,con);
        commandTracker.set("shop", commandTracker.get("shop")+1);
        break;
      case "buy":
        client.commands.get("buy").exe(interaction,con);
        commandTracker.set("buy", commandTracker.get("buy")+1);
        break;
      case "sell":
        client.commands.get("sell").exe(interaction,con);
        commandTracker.set("sell", commandTracker.get("sell")+1);
        break;
      case "lottery":
        client.commands.get("lottery").exe(interaction,Discord, con, playingMap);
        commandTracker.set("lottery", commandTracker.get("lottery")+1);
    }
});

//Returns true if the user has a cooldown otherwise sets a cooldown and returns false
function cooldownFunc(command, waitTimeMS, interaction) {
    let time = new Date().getTime()
    if (cooldown.get(command).has(interaction.user.id)) {
        let timePassed = time - cooldown.get(command).get(interaction.user.id);
        if (timePassed < waitTimeMS) {
            let waitTimeMin = parseInt((waitTimeMS - timePassed)/1000/60);
            let waitTimeSec = Math.round((waitTimeMS - timePassed)/1000)%60;
            interaction.reply(`${interaction.user} you have to wait ${waitTimeMin} min and ${waitTimeSec}s to use this command again`);
            return true;
        } else {
            cooldown.get(command).set(interaction.user.id, time);
            return false;
        }
    } else {
        cooldown.get(command).set(interaction.user.id, time);
        return false;
    }
}


client.login(token);
