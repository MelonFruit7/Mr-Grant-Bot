module.exports = {
    name: "battleship",
    description: "1v1 battleship game",
    exe(message, Discord, con) {
        if (message.content.indexOf(" ") != -1) {
            if (message.mentions.users.first() != undefined) {
                let userOne = message.author, userTwo = message.mentions.users.first();

                let userOneBoard = [], userTwoBoard = [], numEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
                let setupStatus = new Map();
                setupStatus.set(userOne.id, undefined);
                setupStatus.set(userTwo.id, undefined);
                
                userOneBoard.push(["📍", "🇦","🇧","🇨","🇩","🇪","🇫","🇬","🇭","🇮","🇯"]);
                userTwoBoard.push(["📍", "🇦","🇧","🇨","🇩","🇪","🇫","🇬","🇭","🇮","🇯"]);
                for (let i = 0; i < 10; i++) {
                    userOneBoard.push([numEmojis[i], "⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜"]);
                    userTwoBoard.push([numEmojis[i], "⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜"]);
                }
                if (userOne.id == userTwo.id) {
                    message.channel.send(`You can't play against yourself ${userOne} ;-;`);
                    return;
                }

             con.query("SELECT * FROM points WHERE user = " + userOne.id + " OR user = " + userTwo.id, (err, result) => {
                    if (err) throw err;
                    if (result.length == 0) {
                        con.query("INSERT INTO points (user, points, xp, lvl, playing) VALUES (" + userOne.id + ", 0, 0, 0, 0)", function (err, result) { if (err) throw err; });
                        con.query("INSERT INTO points (user, points, xp, lvl, playing) VALUES (" + userTwo.id + ", 0, 0, 0, 0)", function (err, result) { if (err) throw err; });
                    } else if (result.length == 1) {
                        if (result[0].user == userOne.id) {
                            con.query("INSERT INTO points (user, points, xp, lvl, playing) VALUES (" + userTwo.id + ", 0, 0, 0, 0)", function (err, result) { if (err) throw err; });
                        } else {
                            con.query("INSERT INTO points (user, points, xp, lvl, playing) VALUES (" + userOne.id + ", 0, 0, 0, 0)", function (err, result) { if (err) throw err; });
                        }
                        if (result[0].playing == 1) {
                            message.channel.send("A user part of this game is currently playing some game with the bot, wait until they are finished.");
                            return;
                        }
                    } else {
                        if (result[0].playing == 1 || result[1].playing == 1) {
                            message.channel.send("A user part of this game is currently playing some game with the bot, wait until they are finished.");
                            return;
                        }
                    }
                    setPlayingGame(userOne.id, 1, con);

                message.channel.send(`React to accept a battleship match against ${userOne}, ${userTwo}`).then(msg => {
                    msg.react("✅");
                    let filter = (reaction, user) => { return (reaction.emoji.name == "✅") && user.id == userTwo.id };
                    msg.awaitReactions({filter: filter, max: 1, time: 15000, errors: ["time"]}).then(x => {
                     con.query("SELECT * FROM points WHERE user = " + userTwo.id, (err, result) => {
                      if (result[0].playing == 1) {
                        setPlayingGame(userOne.id, 0, con);
                        message.channel.send("A user part of this game is currently playing some game with the bot, wait until they are finished.");
                        return;
                      }
                      setPlayingGame(userTwo.id, 1, con);
                      let ships = [4,3,3,2,2,2,1,1,1,1];
                      //user that is placing, users board, Discord, array of ships, possible failed attempts, other user, other users board, status
                      placementOfShips(userOne, userOneBoard, Discord, con, ships, ships.length, userTwo, userTwoBoard, setupStatus);
                      placementOfShips(userTwo, userTwoBoard, Discord, con, ships, ships.length, userOne, userOneBoard, setupStatus); 
                     });
                    }).catch(() => {
                        setPlayingGame(userOne.id, 0, con);
                        message.channel.send(`User did not accept the battleship match ${userOne}`);
                    });
                });
             });
            } else {
                message.reply("Please mention the person you want to battle").catch(error => console.log("error replying to message (battleship command)"));
            }
        } else {
            message.reply("Please mention the person you want to battle").catch(error => console.log("error replying to message (battleship command)"));
        }
    }
}

/** 
 * @User user that is setting up board
 * @arr board of our user
 * @Discord requred to create embeds
 * @con connection to db
 * @Ships array of ships to place
 * @attempts attempts to place all ships
 * @user2 secound user playing, we need to pass them in as a parameter in a function here
 * @arr2 board of user2
 * @setupStatus setup status of both users
 */
function placementOfShips(user, arr, Discord, con, ships, attempts, user2, arr2, setupStatus) {
    if (attempts == 0) {
        setupStatus.set(user.id, false);
        if (setupStatus.get(user2.id) == true) user2.send("Opponent Failed to Setup board (game ended)");
        user.send("Too many accumulated failed attempts at placing a ship (game ended)");
        setPlayingGame(user.id, 0, con);
        setPlayingGame(user2.id, 0, con);
        return;
    } 
    if (setupStatus.get(user2.id) == false) {
        user.send("Your opponent failed to setup their board (game ended)");
        setPlayingGame(user.id, 0, con);
        setPlayingGame(user2.id, 0, con);
        return;
    }

    let embed = new Discord.MessageEmbed();
    embed.setTitle("BattleShip board setup");
    let board = "";
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
            board += arr[i][j] + " ";
        }
        board += "\n";
    }
    let validPositions = [], shipsFoundAround;
    for (let i = 1; i < arr.length; i++) {
        for (let j = 1; j < arr[0].length; j++) {
            shipsFoundAround = false;
            //I represents Going Down and J represents Going Right
            if (i + ships[0] <= 11) {
                for (let down = i; down < i + ships[0]; down++) {
                    if (checkAround(down, j, arr, "🚢") != false) shipsFoundAround = true;
                }
                if (!shipsFoundAround) validPositions.push(String.fromCharCode(j + 64) + "" + i + "D");
            }

            shipsFoundAround = false;
            if (j + ships[0] <= 11) {
                for (let right = j; right < j + ships[0]; right++) {
                    if (checkAround(i, right, arr, "🚢") != false) shipsFoundAround = true;
                }
                if (!shipsFoundAround) validPositions.push(String.fromCharCode(j + 64) + "" + i + "R");
            }
        }
    }
    embed.setDescription("To place ship type in postion and direcrtion ex: A1R (A1 right), A1D (A1 down)\n\n"+(ships[0] == undefined ? board : "**Placing Ship of length "+ships[0]+"**\n\n**Valid Placements\n"+validPositions+"**\n\n" + board));
    user.send({embeds: [embed]}).then(msg => {
        if (ships.length == 0) {
            setupStatus.set(user.id, true);
            user.send("Finished Placing Ships");
            user2.send("Your opponent has finished placing ships");
            if (setupStatus.get(user2.id) == true) {
                playBattleship(user2, arr2, user, arr, "", 5, Discord, con);
            }    
            return;
        } 
        let msg_filter = (m) => m.author.id === user.id;
        msg.channel.awaitMessages({filter: msg_filter, time: 60000, max: 1, errors: ["time"]}).then(x => {
            let input = String(x.first()).toUpperCase();
            if (input.length == 4 || input.length == 3) {
                try {
                    for (let i = 0; i < validPositions.length; i++) {
                        if (validPositions[i] == input) {
                            break;
                        } else if (i + 1 == validPositions.length) {
                            throw new Error("Some Error");
                        }
                    }
                    if (input.length == 3) {
                        for (let i = 0; i < ships[0]; i++) {
                            if (input.charAt(2) == "R") {
                                arr[parseInt(input.charAt(1))][input.charCodeAt(0) - 64 + i] = "🚢";
                            } else if (input.charAt(2) == "D") {
                                arr[parseInt(input.charAt(1)) + i][input.charCodeAt(0) - 64] = "🚢";
                            } else {
                                throw new Error("Wrong Direction");
                            }
                        }
                        placementOfShips(user, arr, Discord, con, ships.slice(1), attempts, user2, arr2, setupStatus);
                    } else {
                        for (let i = 0; i < ships[0]; i++) {
                            if (input.charAt(3) == "R") {
                                arr[parseInt(input.substring(1,3))][input.charCodeAt(0) - 64 + i] = "🚢";
                            } else if (input.charAt(3) == "D") {
                                arr[parseInt(input.substring(1,3)) + i][input.charCodeAt(0) - 64] = "🚢";
                            } else {
                                throw new Error("Wrong Direction");
                            }
                        }
                        placementOfShips(user, arr, Discord, con, ships.slice(1), attempts, user2, arr2, setupStatus);
                    }
                } catch(err) {
                        user.send("Invalid Input try again");
                        placementOfShips(user, arr, Discord, con, ships, --attempts, user2, arr2, setupStatus);
                }
            } else {
                user.send("Invalid Input try again");
                placementOfShips(user, arr, Discord, con, ships, --attempts, user2, arr2, setupStatus);
            }
        }).catch(() => {
            setupStatus.set(user.id, false);
            if (setupStatus.get(user2.id) == true) user2.send("Opponent Failed to Setup board (game ended)");
            user.send("You spent to much time placing your ship (game ended)");
            setPlayingGame(user.id, 0, con);
            setPlayingGame(user2.id, 0, con);
        });
    });
}

/**
 * 
 * @param {*The current user playing} playingUser 
 * @param {*The board of playingUser} playingUserBoard 
 * @param {*The user being attacked} userTwo 
 * @param {*The board of userTwo} userTwoBoard 
 * @param {*previous attack made} prevMove 
 * @param {*attempts at putting in a valid input} attempts 
 * @param {*Needed for embed} Discord 
 * @param {*Needed for db} con 
 * @returns 
 */
function playBattleship(playingUser, playingUserBoard, userTwo, userTwoBoard, prevMove, attempts, Discord, con) {
    if (attempts == 0) {
        playingUser.send("You failed to attack the opponent (game ended)");
        userTwo.send("Opponent failed to attack, you win!! (game ended)");
        setPlayingGame(playingUser.id, 0, con);
        setPlayingGame(userTwo.id, 0, con);
        return;
    }
    let checkWin = 0;

    let embed = new Discord.MessageEmbed(), embed2 = new Discord.MessageEmbed();
    let vPlayingUserBoard = "", hUserTwoBoard = "";
    let vUserTwoBoard = "", hPlayingUserBoard = "";
    //Setup visible boards and hidden boards
    for (let i = 0; i < playingUserBoard.length; i++) {
        for (let j = 0; j < playingUserBoard[0].length; j++) {
            if (playingUserBoard[i][j] == "🚢") checkWin++;
            vPlayingUserBoard += playingUserBoard[i][j] + " ";
            hPlayingUserBoard += playingUserBoard[i][j] == "🚢" ? "⬜ " : playingUserBoard[i][j] + " ";
            vUserTwoBoard += userTwoBoard[i][j] + " ";
            hUserTwoBoard += userTwoBoard[i][j] == "🚢" ? "⬜ " : userTwoBoard[i][j] + " ";
        }
        vPlayingUserBoard += "\n";
        hPlayingUserBoard += "\n";
        vUserTwoBoard += "\n";
        hUserTwoBoard += "\n";
    }
    //If you have no ships on your board you lost
    if (checkWin == 0) {
        embed.setTitle("Battleship Game 🛳");
        embed.addFields(
            {name: "Your Board", value: vPlayingUserBoard, inline: true},
            {name: "Opponents Board (visible)", value: vUserTwoBoard, inline: true}
        );
        embed.setColor("GREEN");
        playingUser.send({embeds: [embed]});

        embed2.setTitle("Battleship Game 🛳");
        embed2.addFields(
            {name: "Your Board", value: vUserTwoBoard, inline: true},
            {name: "Opponents Board (Visible)", value: vPlayingUserBoard, inline: true}
        );
        embed2.setColor("GREEN");
        userTwo.send({embeds: [embed2]});

        playingUser.send("🚢 L + ratio + skill issue, you lost 🚢 (game ended)");
        userTwo.send("🚢🎉 GG you won the battleship match!! 🎉🚢 (game ended)");
        setPlayingGame(playingUser.id, 0, con);
        setPlayingGame(userTwo.id, 0, con);
        return;
    }

    let validPlacments = new Map();
    for (let i = 1; i < userTwoBoard.length; i++) {
        for (let j = 1; j < userTwoBoard[0].length; j++) {
            if (userTwoBoard[i][j] == "⬜" || userTwoBoard[i][j] == "🚢") {
                validPlacments.set(String.fromCharCode(j + 64) + i, 1);
            }
        }
    }
    //If the game just started add descriptions (100 valid placements at start of game)
    if (validPlacments.size == 100) {
        embed2.addFields({name: "Description", value: "You are playing battleship, rules are simple, state a point to shoot on your opponents board (Examples of points are A1, J10, B7, etc...)\nAfter playing a move a new board will be generated if you see a ❌ that means you missed, if you see a 🔥 that means you hit a ship if you see a 💥 that means you destroyed a ship, first to destroy all ships wins.\nThese Points will also show up on your board indicating your opponents moves."});
        embed.addFields({name: "Description", value: "You are playing battleship, rules are simple, state a point to shoot on your opponents board (Examples of points are A1, J10, B7, etc...)\nAfter playing a move a new board will be generated if you see a ❌ that means you missed, if you see a 🔥 that means you hit a ship if you see a 💥 that means you destroyed a ship, first to destroy all ships wins.\nThese Points will also show up on your board indicating your opponents moves."});
    }
    //If no invalid moves have been made by playingUser then send board to userTwo
    if (attempts == 5) {
        embed2.setTitle("Battleship Game 🛳");
        embed2.addFields(
            {name: "Turn", value: "**"+playingUser.username +"'s Turn\n\nYour Last Move: "+prevMove+"**"},
            {name: "Your Board", value: vUserTwoBoard, inline: true},
            {name: "Opponents Board", value: hPlayingUserBoard, inline: true}
        );
        embed2.setColor("RED");
        userTwo.send({embeds: [embed2]});
    }

    embed.setTitle("Battleship Game 🛳");
    embed.addFields(
        {name: "Turn", value: "**Your Turn\n\nOpponents Last Move: "+prevMove+"**"},
        {name: "Your Board", value: vPlayingUserBoard, inline: true},
        {name: "Opponents Board", value: hUserTwoBoard, inline: true}
    );
    embed.setColor("BLUE");

    playingUser.send({embeds: [embed]}).then(msg => {
        msg.channel.awaitMessages({time: 60000, max: 1, errors: ["time"]}).then(x => {
            let input = String(x.first()).toUpperCase();
            if (validPlacments.has(input)) {
                if (input.length == 2) {
                    let temp = userTwoBoard[parseInt(input.charAt(1))][input.charCodeAt(0) - 64];
                    if (temp == "⬜") userTwoBoard[parseInt(input.charAt(1))][input.charCodeAt(0) - 64] = "❌";
                    if (temp == "🚢") userTwoBoard[parseInt(input.charAt(1))][input.charCodeAt(0) - 64] = "🔥";
                    if (checkShipDestoryed(parseInt(input.charAt(1)), input.charCodeAt(0) - 64, userTwoBoard, false)) checkShipDestoryed(parseInt(input.charAt(1)), input.charCodeAt(0) - 64, userTwoBoard, true);
                } else {
                    let temp = userTwoBoard[parseInt(input.substring(1))][input.charCodeAt(0) - 64];
                    if (temp == "⬜") userTwoBoard[parseInt(input.substring(1))][input.charCodeAt(0) - 64] = "❌";
                    if (temp == "🚢") userTwoBoard[parseInt(input.substring(1))][input.charCodeAt(0) - 64] = "🔥";
                    if (checkShipDestoryed(parseInt(input.substring(1)), input.charCodeAt(0) - 64, userTwoBoard, false)) checkShipDestoryed(parseInt(input.substring(1)), input.charCodeAt(0) - 64, userTwoBoard, true);
                }
                playBattleship(userTwo, userTwoBoard, playingUser, playingUserBoard, input, 5, Discord, con);
            } else {
                playingUser.send("Invalid Input try again");
                playBattleship(playingUser, playingUserBoard, userTwo, userTwoBoard, "", --attempts, Discord, con);
            }
        }).catch(() => {
            playingUser.send("You spent to much time choosing a place to attack (game ended)");
            userTwo.send("Opponent timed out, you win!! (game ended)");
            setPlayingGame(playingUser.id, 0, con);
            setPlayingGame(userTwo.id, 0, con);
        });
    });

}

//Check Around a point on the board
function checkAround(i, j, arr, check) {
    for (let a = i - 1; a < (i + 2 > arr.length ? arr.length : i + 2); a++) {
        for (let b = j - 1; b < (j + 2 > arr[0].length ? arr[0].length : j + 2); b++) {
            if (arr[a][b] == check) return [a,b];
        }
    }
    return false;
}

//Check if a ship is destroyed, can also destroy ships
function checkShipDestoryed(i, j, arr, destroyShips) {
    for (let a = i; a < arr.length; a++) {
        if (arr[a][j] == "⬜" || arr[a][j] == "❌") {
            break;
        } else if (arr[a][j] == "🚢") {
            return false;
        } else if (arr[a][j] == "🔥" && destroyShips) {
            arr[a][j] = "💥";
        }
    }
    for (let a = i; a >= 0; a--) {
        if (arr[a][j] == "⬜" || arr[a][j] == "❌") {
            break;
        } else if (arr[a][j] == "🚢") {
            return false;
        } else if (arr[a][j] == "🔥" && destroyShips) {
            arr[a][j] = "💥";
        }
    }
    for (let a = j; a < arr.length; a++) {
        if (arr[i][a] == "⬜" || arr[i][a] == "❌") {
            break;
        } else if (arr[i][a] == "🚢") {
            return false;
        } else if (arr[i][a] == "🔥" && destroyShips) {
            arr[i][a] = "💥";
        }
    }
    for (let a = j; a >= 0; a--) {
        if (arr[i][a] == "⬜" || arr[i][a] == "❌") {
            break;
        } else if (arr[i][a] == "🚢") {
            return false;
        } else if (arr[i][a] == "🔥" && destroyShips) {
            arr[i][a] = "💥";
        }
    }
    return true;
}

function setPlayingGame(id, set, con) {
    con.query("UPDATE points SET playing = "+set+" WHERE user = " + id, (err, result) => {
        if (err) throw err;
    });
}