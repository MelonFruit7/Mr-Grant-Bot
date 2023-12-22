module.exports = {
    name: "help",
    description: "Sends invite to support server",
    exe(interaction) {
        interaction.reply("Check direct messages 🙂").catch(error => console.log("Error replying to a user (help comamnd)"));
        interaction.user.send("You can contact MelonFruit or join the support server https://discord.gg/fHh6Y7Nwb5\n\nTo see all the commands use the command ``/commands``").catch(error => console.log("Error dming a user (help comamnd)"));
    }
}