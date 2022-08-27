module.exports = {
    name: "udefine",
    description: "Define a word from the urban dictionary",
    exe(message, request) {
        if (message.content.indexOf(" ") != -1) {
            request('https://api.urbandictionary.com/v0/define?term=' + message.content.substring(message.content.indexOf(" ") + 1), (error,response,body) => {
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
}