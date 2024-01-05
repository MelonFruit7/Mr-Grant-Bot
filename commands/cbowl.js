module.exports = {
    name: "cbowl",
    description: "Convert minutes to cereal bowls",
    options: [
        {
            type: "STRING",
            name: "minutes",
            description: "Amount of minutes elapsed",
            required: true   
        }
    ],
    exe(interaction) {
        interaction.reply(Math.floor((parseInt(interaction.options.get("minutes").value) / 43.0) * 100) / 100.0 + " cereal bowls").catch(error => console.log("Error replying to a message (cbowl comamnd)"));
    }
}