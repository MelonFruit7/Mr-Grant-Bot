module.exports = {
    name: "upvote_reward",
    description: "Claim reward for upvoting the bot",
    exe(interaction, request, cooldownFunc, cooldown) {
        //Request data from top.gg api with correct authorization
        request({method: 'GET', url: "https://top.gg/api/bots/993377695746498580/check?userId=" + interaction.user.id, headers: {'Content-Type': 'text/html','Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk5MzM3NzY5NTc0NjQ5ODU4MCIsImJvdCI6dHJ1ZSwiaWF0IjoxNzAzMzEwNjcwfQ.1Il2vlKGyyBtGlFcaerG3PJ_P4MddjGBQUzKqLXzCmA'}}, (error,response,body) => {
            if (!error && response.statusCode == 200) { //Check if an error occured 
                let importedJSON = JSON.parse(body);
                if (importedJSON.voted == 1) {
                    if (!cooldownFunc("upvote_reward", 60000*60*12, interaction)) {
                        cooldown.get("hourly").set(interaction.user.id, 0);
                        interaction.reply("Your hourly command timer has been reset, thank you for upvoting :)").catch(error => console.log("Error replying to a message (upvote comamnd)"));
                    }
                } else {
                    interaction.reply("You haven't voted for the bot, you can vote here :)\nhttps://top.gg/bot/993377695746498580").catch(error => console.log("Error replying to a message (upvote comamnd)"));
                }
            } else {
                interaction.reply("Sorry an Error has occured").catch(error => console.log("Error replying to a message (upvote comamnd)"));
            }

        });
    }
}