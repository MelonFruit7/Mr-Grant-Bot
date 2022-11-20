const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage, xpUpdate} = require("./userStats.js");
module.exports = {
    name: "blackjack",
    description: "Play a game of blackjack",
    exe(message, Discord, con, playingMap) {
        if (message.content.indexOf(" ") != -1) {
            let bet = parseInt(message.content.substring(message.content.indexOf(" ") + 1));
            if (message.content.substring(message.content.indexOf(" ") + 1) == "half") bet = -1;
            if (message.content.substring(message.content.indexOf(" ") + 1) == "all") bet = -1;
            if (!isNaN(bet)) {
                con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                  if (result.length > 0) {
                      if (playingMap.has(message.author.id)) {
                          message.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (blackjack comamnd)"));
                          return;
                      }
                      if (message.content.substring(message.content.indexOf(" ") + 1) == "half") bet = parseInt(result[0].points / 2);
                      if (message.content.substring(message.content.indexOf(" ") + 1) == "all") bet = result[0].points;

                      playingMap.set(message.author.id, 1);
                      if (bet > result[0].points || bet <= 0) {
                          playingMap.delete(message.author.id);
                          message.reply("Can't bet more points then you have (or 0 points)").catch(error => console.log("Error replying to a message (blackjack comamnd)"));
                          return;
                      }
                     let suits = ['♠', '♥', '♣', '♦'], cardValues = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
                     let cards = [];
                     for (let i = 0; i < suits.length; i++) {
                        for (let j = 0; j < cardValues.length; j++) {
                            cards.push(cardValues[j] + suits[i]);
                        }
                     }
                     let dealerCards = [], playerCards = [];
                     for (let i = 0; i < 2; i++) {
                        dealerCards.push(cards.splice(Math.random()*cards.length, 1));
                        playerCards.push(cards.splice(Math.random()*cards.length, 1));
                     }
                     let embed = new Discord.MessageEmbed();
                     embed.setTitle("Blackjack\n" + message.author.username + " is playing");
                     let embedDesc = "";
                     embedDesc += "**Mr. Grant (Dealer)**\nCards: ``"+dealerCards[0]+"`` ``?``\nTotal: ``?``";
                     embedDesc += "\n**"+message.author.username+" (Player)**\nCards: ``"+playerCards[0]+"`` ``"+playerCards[1]+"``\nTotal: ``"+parseCardsSum(playerCards)+"``\nBet: "+pointsSymbol()+"``"+numWord(bet)+"``";
                     embed.setDescription(embedDesc);
                     embed.setColor("WHITE");
                     message.channel.send({embeds: [embed]}).then(msg => {
                       msg.react("🎯").catch(error => console.log("Error reacting to a message (blackjack comamnd)"));
                       msg.react("🧍").catch(error => console.log("Error reacting to a message (blackjack comamnd)"));
                       checkReactions(message, msg, playingMap, dealerCards, playerCards, cards, embed, bet, con);
                     });
                  } else { 
                    message.reply("You don't have points").catch(error => console.log("Error replying to a message (blackjack comamnd)"));  
                  }
                });
            } else {
              message.reply("Ayo no").catch(error => console.log("Error replying to a message (blackjack comamnd)"));
            }
        } else {
            message.reply("Bet some of your points").catch(error => console.log("Error replying to a message (blackjack comamnd)"));
        }
    }
}

function parseCardsSum(cards) {
    let res = 0, aces = 0;
    for (let i = 0; i < cards.length; i++) {
        switch((cards[i]+"").charAt(0)) {
            case "J":
            case "Q":
            case "K":
                res += 10;
            break;
            case "A":
                aces++;
            break;
            default:
                res += parseInt(cards[i]);
        }
    }
    for (let i = 0; i < aces; i++) {
        if (res + 11 + (aces - 1) > 21) {
            res += 1;
        } else {
            res += 11;
        }
    }
    return res;
}

/**
 * 
 * @param {* Orginal message sent by the user} message 
 * @param {* message sent by the bot} msg 
 * @param {* map that checks if a user is playing a game} playingMap 
 * @param {* dealers cards} dealerCards
 * @param {* players cards} playerCards 
 * @param {* deck of cards} cards 
 * @param {* The message embed (we have to edit it)} embed
 * @param {* The bet amount} bet
 * @param {* allows us to connect to database} con
 */
function checkReactions(message, msg, playingMap, dealerCards, playerCards, cards, embed, bet, con) {
    let filter = (reaction, user) => (reaction.emoji.name == "🎯" || reaction.emoji.name == "🧍") && user.id == message.author.id;
    msg.awaitReactions({filter, max: 1, time: 20000, errors: ["time"]}).then(x => {
        let embedDesc = "";
         if (String(x.first().emoji) == "🎯") {
            playerCards.push(cards.splice(Math.random()*cards.length, 1));
            embedDesc += "**Mr. Grant (Dealer)**\nCards: ``"+dealerCards[0]+"`` ``?``\nTotal: ``?``";
            embedDesc += "\n**"+message.author.username+" (Player)**\nCards:";
            for (let i = 0; i < playerCards.length; i++) embedDesc += " ``" + playerCards[i] + "``";
            embedDesc += "\nTotal: ``"+parseCardsSum(playerCards)+"``\nBet: "+pointsSymbol()+"``"+numWord(bet)+"``";
            embed.setDescription(embedDesc);
            msg.edit({embeds: [embed]});
         }
         embedDesc = "";
         if (String(x.first().emoji) == "🧍" || parseCardsSum(playerCards) > 21) {
                while (parseCardsSum(dealerCards) < 17 && parseCardsSum(playerCards) <= 21) {
                    dealerCards.push(cards.splice(Math.random()*cards.length, 1));
                }
            con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                
                if (parseCardsSum(playerCards) > 21) {
                    con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
                    embedDesc += "``[ Result ]``\nL + ratio + skill issue, you went over 21\n\n``[ Points ]``\n\n-"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points - bet))+"```\n";
                    embed.setColor("RED");
                } else if (parseCardsSum(dealerCards) > 21) {
                    con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
                    embedDesc += "``[ Result ]``\nGG, dealer went over 21\n\n``[ Points ]``\n\n+"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points + bet))+"```\n";
                    embed.setColor("GREEN");
                    if (bet >= parseInt(result[0].points*0.05)) {
                        xpUpdate(message.author.id, message, bet, con);
                        embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                    } else {
                        embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                    }
                } else if (parseCardsSum(dealerCards) < parseCardsSum(playerCards)) {
                    con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
                    embedDesc += "``[ Result ]``\nGG, you beat the dealer\n\n``[ Points ]``\n\n+"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points + bet))+"```\n";
                    embed.setColor("GREEN");
                    if (bet >= parseInt(result[0].points*0.05)) {
                        xpUpdate(message.author.id, message, bet, con);
                        embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                    } else {
                        embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                    }
                }  else if (parseCardsSum(dealerCards) > parseCardsSum(playerCards)) {
                    con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
                    embedDesc += "``[ Result ]``\nL + ratio + skill issue, the dealer beat you\n\n``[ Points ]``\n\n-"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points - bet))+"```\n";
                    embed.setColor("RED");
                }  else {
                    embedDesc += "``[ Result ]``\nTie ;-;\n\n``[ Points ]``\n\n+0"+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points))+"```\n";
                    embed.setColor("YELLOW");
                }

                embedDesc += "**Mr. Grant (Dealer)**\nCards:";
                for (let i = 0; i < dealerCards.length; i++) embedDesc += " ``" + dealerCards[i] + "``";
                embedDesc += "\nTotal: ``"+parseCardsSum(dealerCards)+"``";
                embedDesc += "\n**"+message.author.username+" (Player)**\nCards:";
                for (let i = 0; i < playerCards.length; i++) embedDesc += " ``" + playerCards[i] + "``";
                embedDesc += "\nTotal: ``"+parseCardsSum(playerCards)+"``\nBet: "+pointsSymbol()+"``"+numWord(bet)+"``";
                embed.setTitle("Blackjack");
                embed.setDescription(embedDesc);
                msg.edit({embeds: [embed]});
            });
            playingMap.delete(message.author.id)
            return;
         }
         let userReactions = msg.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id));
         try {
             for (let reaction of userReactions.values()) reaction.users.remove(message.author.id);
         } catch (error) {
             console.log("Couldn't remove reactions (blackjack game)");
         }
         checkReactions(message, msg, playingMap, dealerCards, playerCards, cards, embed, bet, con);
    }).catch(() => {
         con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
            let embedDesc = "";
            con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
            embedDesc += "``[ Result ]``\nImagine running out of time\n\n``[ Points ]``\n\n-"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points - bet))+"```\n";
            embed.setColor("RED");
            embedDesc += "**Mr. Grant (Dealer)**\nCards:";
            for (let i = 0; i < dealerCards.length; i++) embedDesc += " ``" + dealerCards[i] + "``";
            embedDesc += "\nTotal: ``"+parseCardsSum(dealerCards)+"``";
            embedDesc += "\n**"+message.author.username+" (Player)**\nCards:";
            for (let i = 0; i < playerCards.length; i++) embedDesc += " ``" + playerCards[i] + "``";
            embedDesc += "\nTotal: ``"+parseCardsSum(playerCards)+"``\nBet: "+pointsSymbol()+"``"+numWord(bet)+"``";
            embed.setTitle("Blackjack");
            embed.setDescription(embedDesc);
            msg.edit({embeds: [embed]});
         });
         playingMap.delete(message.author.id);
         message.reply("You ran out of time bozo.").catch(error => console.log("Error replying to a message (blackjack comamnd)"));
    });
}