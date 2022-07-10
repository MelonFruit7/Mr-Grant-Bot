const Discord = require('discord.js');
const client = new Discord.Client({
    intents:["GUILDS", "GUILD_MESSAGES"]
});
const {prefix, token} = require('./config.json');
const request = require('request');


client.on('messageCreate', message => {
    //don't run if the messageCreated was by a bot
    if (message.author.bot) return;

    //Gets the command and puts it trhough a switch
    switch(message.content.substring(0,message.content.indexOf(" ") == -1 ? message.content.length : message.content.indexOf(" "))) {
        //SAY COMMAND
        case `${prefix}say`:
                message.delete();
                if (message.content.length > 5) message.channel.send(message.content.substring(5,message.content.length));
        break;
        //PING COMMAND
        case `${prefix}ping`:
             message.channel.send("pong");
        break;
        //HANDS COMMAND
        case `${prefix}hands`:
            let numHands = 10;
            if (message.content.length > 6) {
                try {
                  numHands = parseInt(message.content.substring(7)) <= 100 && parseInt(message.content.substring(7)) > 0 ? parseInt(message.content.substring(7)) : 10;
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
            if (message.content.length > 11) {
                try {
                    let embed = new Discord.MessageEmbed();
                    embed.setDescription(numberNotation(parseInt(message.content.substring(11))));
                    message.channel.send({embeds: [embed]});
                } catch(error) {
                    process.stdout.write("numberNotation error");
                }
            }
        break;
        //Define a word
        case `${prefix}define`:
            if (message.content.length > 8) {
                request('https://api.dictionaryapi.dev/api/v2/entries/en/' + message.content.substring(8), function (error, response, body) {
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
            if (message.content.length > 9) {
                request('https://api.urbandictionary.com/v0/define?term=' + message.content.substring(9), (error,response,body) => {
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
