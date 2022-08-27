module.exports = {
    name: "define",
    description: "defines a word",
    exe(message, request) {
        if (message.content.indexOf(" ") != -1) {
            request('https://api.dictionaryapi.dev/api/v2/entries/en/' + message.content.substring(message.content.indexOf(" ") + 1), function (error, response, body) {
             if (!error && response.statusCode == 200) {
                let importedJSON = JSON.parse(body);
                message.channel.send(importedJSON[0].meanings[0].definitions[0].definition);
             } else {
                message.channel.send("Sorry couldn't find your word");
             }
            });
        }
    }
}