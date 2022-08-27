module.exports = {
    name: "ping",
    description: "Gets the bots ping",
    exe(message, client) {
        message.channel.send(`🏓Pong! \n Latency is ${Date.now() - message.createdTimestamp}ms. \n API Latency is ${Math.round(client.ws.ping)}ms`);
    }
}