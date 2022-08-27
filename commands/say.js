module.exports = {
    name: "say",
    description: "Allows you to speak as the bot",
    exe(message) {
        if (message.content.indexOf(" ") != -1 && message.member.permissions.has(['ADMINISTRATOR'])) {
            if (message.deletable) message.delete().catch(error => console.log("Error deleting a message (say command)"));
            message.channel.send(message.content.substring(message.content.indexOf(" ") + 1));
        } else { 
            message.reply("Need Admin To Use").catch(error => console.log("Error replying to a message (say command)"));
        }
    }
}