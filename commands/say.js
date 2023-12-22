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
            interaction.reply(interaction.options.get("say").value);
        } else { 
            interaction.reply("Need Admin To Use");
        }
    }
}