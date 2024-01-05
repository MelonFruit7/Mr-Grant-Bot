module.exports = {
    name: "udefine",
    description: "Define a word from the urban dictionary",
    options: [
        {
            type: "STRING",
            name: "word",
            description: "Word from the urban dictionary",
            required: true
        }
    ],
    exe(interaction, request) {
        request('https://api.urbandictionary.com/v0/define?term=' + interaction.options.get("word").value, (error,response,body) => {
            if (JSON.parse(body).list[0] == null) {
                interaction.reply("Sorry couldn't find your word").catch(error => console.log("Error replying to a message (udefine comamnd)"));
                return;
            }
            if (!error && response.statusCode == 200) {
                let importedJSON = JSON.parse(body);
                interaction.reply(importedJSON.list[0].definition).catch(error => console.log("Error replying to a message (udefine comamnd)"));
            } else {
                interaction.reply("Sorry an Error has occured").catch(error => console.log("Error replying to a message (udefine comamnd)"));
            }
        });
    }
}