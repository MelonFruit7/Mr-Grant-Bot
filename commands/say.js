const { GuildMember } = require("discord.js");

module.exports = {
    name: "say",
    description: "Allows you to speak as the bot",
    options: [
        {
            type: "STRING",
            name: "say",
            description: "Word for bot",
            required: true
        }
    ],
    exe(interaction) {
        if (interaction.options.get("say").value.length > 0 && interaction.member.permissions.has(['ADMINISTRATOR'])) {
            interaction.reply(interaction.options.get("say").value).catch(error => console.log("Error replying to a message (say comamnd)"));
        } else { 
            interaction.reply("Need Admin To Use").catch(error => console.log("Error replying to a message (say comamnd)"));
        }
    }
}