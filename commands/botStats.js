module.exports = {
    name: "bot_stats",
    description: "Bot stats",
    exe(interaction, Discord, client) {
        let colors = ['RED', 'BLUE', 'PURPLE', 'GREEN', 'YELLOW', 'ORANGE'];
        let embed = new Discord.MessageEmbed()
        .setTitle(`<:dice5:1013282200604647457> Grant Bot`)
        .setDescription(`**Guilds**\n${client.guilds.cache.size}`)
        .setColor(colors[parseInt(Math.random() * colors.length)])
        .setFooter({text: `Developed by MelonFruit#8222`});
        interaction.reply({embeds: [embed]}); 
    }
}
