module.exports = {
    name: "ping",
    description: "Gets the bots ping",
    exe(interaction, client) {
        interaction.reply(`🏓Pong! \n Latency is ${Date.now() - interaction.createdTimestamp}ms. \n API Latency is ${Math.round(client.ws.ping)}ms`).catch(error => console.log("Error replying to a message (ping comamnd)"));
    }
}