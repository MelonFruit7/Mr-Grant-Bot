module.exports = {
    name: "cbowl",
    description: "inside joke",
    exe(message) {
        if (message.content.indexOf(" ") != -1) {
            message.channel.send(Math.floor((parseInt(message.content.substring(message.content.indexOf(" ") + 1)) / 43.0) * 100) / 100.0 + " cereal bowls");
        }
    }
}