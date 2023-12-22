module.exports = {
    name: "cbowl",
    description: "inside joke",
    options: [
        {
            type: "STRING",
            name: "minutes",
            description: "Amount of minutes elapsed",
            required: true   
        }
    ],
    exe(interaction) {
        interaction.reply(Math.floor((parseInt(interaction.options.get("minutes").value) / 43.0) * 100) / 100.0 + " cereal bowls");
    }
}