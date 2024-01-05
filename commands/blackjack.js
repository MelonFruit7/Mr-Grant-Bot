const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage, xpUpdate, getPointsForBet} = require("./userStats.js");
module.exports = {
    name: "blackjack",
    description: "Play a game of blackjack",
    options: [
        {
            type: "STRING",
            name: "bet",
            description: "Amount to bet for the game",
            required: true
        }
    ],
    exe(interaction, Discord, con, playingMap) {
        let bet = interaction.options.get("bet").value;

        con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
            if (result.length > 0) {
                if (playingMap.has(interaction.user.id)) {
                    interaction.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (blackjack comamnd)"));
                    return;
                }
                bet = getPointsForBet(bet, result[0].points);

                playingMap.set(interaction.user.id, 1);
                if (bet > result[0].points || bet <= 0) {
                    playingMap.delete(interaction.user.id);
                    interaction.reply("Can't bet more points then you have (or 0 points)").catch(error => console.log("Error replying to a message (blackjack comamnd)"));
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
                embed.setTitle("Blackjack\n" + interaction.user.username + " is playing");
                let embedDesc = "";
                embedDesc += "**Mr. Grant (Dealer)**\nCards: ``"+dealerCards[0]+"`` ``?``\nTotal: ``?``";
                embedDesc += "\n**"+interaction.user.username+" (Player)**\nCards: ``"+playerCards[0]+"`` ``"+playerCards[1]+"``\nTotal: ``"+parseCardsSum(playerCards)+"``\nBet: "+pointsSymbol()+"``"+numWord(bet)+"``";
                embed.setDescription(embedDesc);
                embed.setThumbnail(pointsImage());
                embed.setColor("WHITE");

                interaction.deferReply().catch(error => console.log("Error defering an interaction (blackjack comamnd)"));
                interaction.deleteReply().catch(error => console.log("Error deleting an interaction (blackjack comamnd)"));
                interaction.channel.send({embeds: [embed]}).then(msg => {
                    msg.react("🎯").catch(error => console.log("Error reacting to a message (blackjack comamnd)"));
                    msg.react("🧍").catch(error => console.log("Error reacting to a message (blackjack comamnd)"));
                    checkReactions(interaction, msg, playingMap, dealerCards, playerCards, cards, embed, bet, con);
                }).catch(error => console.log("Error replying to a message (blackjack comamnd)"));
            } else { 
                interaction.reply("You don't have points").catch(error => console.log("Error replying to a message (blackjack comamnd)"));  
            }
        });
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
 * @param {* Orginal message sent by the user} interaction 
 * @param {* message sent by the bot} msg 
 * @param {* map that checks if a user is playing a game} playingMap 
 * @param {* dealers cards} dealerCards
 * @param {* players cards} playerCards 
 * @param {* deck of cards} cards 
 * @param {* The message embed (we have to edit it)} embed
 * @param {* The bet amount} bet
 * @param {* allows us to connect to database} con
 */
function checkReactions(interaction, msg, playingMap, dealerCards, playerCards, cards, embed, bet, con) {
    let filter = (reaction, user) => (reaction.emoji.name == "🎯" || reaction.emoji.name == "🧍") && user.id == interaction.user.id;
    msg.awaitReactions({filter, max: 1, time: 20000, errors: ["time"]}).then(x => {
        let embedDesc = "";
         if (String(x.first().emoji) == "🎯") {
            playerCards.push(cards.splice(Math.random()*cards.length, 1));
            embedDesc += "**Mr. Grant (Dealer)**\nCards: ``"+dealerCards[0]+"`` ``?``\nTotal: ``?``";
            embedDesc += "\n**"+interaction.user.username+" (Player)**\nCards:";
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
            con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
                
                if (parseCardsSum(playerCards) > 21) {
                    con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + interaction.user.id, (err, result) => { if (err) throw err });
                    embedDesc += "``[ Result ]``\nL + ratio + skill issue, you went over 21\n\n``[ Points ]``\n\n-"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points - bet))+"```\n";
                    embed.setColor("RED");
                } else if (parseCardsSum(dealerCards) > 21) {
                    con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + interaction.user.id, (err, result) => { if (err) throw err });
                    embedDesc += "``[ Result ]``\nGG, dealer went over 21\n\n``[ Points ]``\n\n+"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points + bet))+"```\n";
                    embed.setColor("GREEN");
                    if (bet >= parseInt(result[0].points*0.05)) {
                        xpUpdate(interaction.user.id, interaction, bet, con);
                        embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                    } else {
                        embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                    }
                } else if (parseCardsSum(dealerCards) < parseCardsSum(playerCards)) {
                    con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + interaction.user.id, (err, result) => { if (err) throw err });
                    embedDesc += "``[ Result ]``\nGG, you beat the dealer\n\n``[ Points ]``\n\n+"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points + bet))+"```\n";
                    embed.setColor("GREEN");
                    if (bet >= parseInt(result[0].points*0.05)) {
                        xpUpdate(interaction.user.id, interaction, bet, con);
                        embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                    } else {
                        embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                    }
                }  else if (parseCardsSum(dealerCards) > parseCardsSum(playerCards)) {
                    con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + interaction.user.id, (err, result) => { if (err) throw err });
                    embedDesc += "``[ Result ]``\nL + ratio + skill issue, the dealer beat you\n\n``[ Points ]``\n\n-"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points - bet))+"```\n";
                    embed.setColor("RED");
                }  else {
                    embedDesc += "``[ Result ]``\nTie ;-;\n\n``[ Points ]``\n\n+0"+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points))+"```\n";
                    embed.setColor("YELLOW");
                }

                embedDesc += "**Mr. Grant (Dealer)**\nCards:";
                for (let i = 0; i < dealerCards.length; i++) embedDesc += " ``" + dealerCards[i] + "``";
                embedDesc += "\nTotal: ``"+parseCardsSum(dealerCards)+"``";
                embedDesc += "\n**"+interaction.user.username+" (Player)**\nCards:";
                for (let i = 0; i < playerCards.length; i++) embedDesc += " ``" + playerCards[i] + "``";
                embedDesc += "\nTotal: ``"+parseCardsSum(playerCards)+"``\nBet: "+pointsSymbol()+"``"+numWord(bet)+"``";
                embed.setTitle("Blackjack");
                embed.setDescription(embedDesc);
                msg.edit({embeds: [embed]});
            });
            playingMap.delete(interaction.user.id)
            return;
         }
         let userReactions = msg.reactions.cache.filter(reaction => reaction.users.cache.has(interaction.user.id));
         try {
             for (let reaction of userReactions.values()) reaction.users.remove(interaction.user.id);
         } catch (error) {
             console.log("Couldn't remove reactions (blackjack game)");
         }
         checkReactions(interaction, msg, playingMap, dealerCards, playerCards, cards, embed, bet, con);
    }).catch(() => {
         con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
            let embedDesc = "";
            con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + interaction.user.id, (err, result) => { if (err) throw err });
            embedDesc += "``[ Result ]``\nImagine running out of time\n\n``[ Points ]``\n\n-"+numWord(bet)+pointsSymbol()+" ```yaml\n"+(numWord(result[0].points - bet))+"```\n";
            embed.setColor("RED");
            embedDesc += "**Mr. Grant (Dealer)**\nCards:";
            for (let i = 0; i < dealerCards.length; i++) embedDesc += " ``" + dealerCards[i] + "``";
            embedDesc += "\nTotal: ``"+parseCardsSum(dealerCards)+"``";
            embedDesc += "\n**"+interaction.user.username+" (Player)**\nCards:";
            for (let i = 0; i < playerCards.length; i++) embedDesc += " ``" + playerCards[i] + "``";
            embedDesc += "\nTotal: ``"+parseCardsSum(playerCards)+"``\nBet: "+pointsSymbol()+"``"+numWord(bet)+"``";
            embed.setTitle("Blackjack");
            embed.setDescription(embedDesc);
            msg.edit({embeds: [embed]});
         });
         playingMap.delete(interaction.user.id);
         interaction.channel.send("<@"+interaction.user+"> You ran out of time bozo.").catch(error => console.log("Error sending a message (blackjack comamnd)"));
    });
}