module.exports = {
    name: "define",
    description: "defines a word",
    options: [
        {
            type: "STRING",
            name: "word",
            description: "Word from the dictionary",
            required: true
        }
    ],
    exe(interaction, request) {
        request('https://api.dictionaryapi.dev/api/v2/entries/en/' + interaction.options.get("word").value, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let importedJSON = JSON.parse(body);
                interaction.reply(importedJSON[0].meanings[0].definitions[0].definition).catch(error => console.log("Error replying to a message (define comamnd)"));
            } else {
                interaction.reply("Sorry couldn't find your word").catch(error => console.log("Error replying to a message (define comamnd)"));
            }
        });
    }
}