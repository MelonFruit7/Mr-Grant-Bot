module.exports = {
    name: "ping",
    description: "Gets the bots ping",
    exe(interaction, client) {
        interaction.reply(`🏓Pong! \n Latency is ${Date.now() - interaction.createdTimestamp}ms. \n API Latency is ${Math.round(client.ws.ping)}ms`);
    }
}