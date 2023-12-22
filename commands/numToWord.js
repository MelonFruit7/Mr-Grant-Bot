module.exports = {
    name: "num_to_word",
    description: "Notates a large number into its word form",
    options: [
        {
            type: "STRING",
            name: "number",
            description: "Number to turn into a word",
            required: true
        }
    ],
    exe(interaction, Discord) {
        let embed = new Discord.MessageEmbed();
        embed.setDescription(numberNotation(parseInt(interaction.options.get("number").value)));
        interaction.reply({embeds: [embed]});
    },
    numWord(number) {
        return numberNotation(number);
    }
}

function numberNotation(number) {
    number = Math.floor(number);
      var zeros = number.toLocaleString('fullwide', { useGrouping: false });
      var abrevation = ["", "K", " Million", " Billion", " Trillion", " Quadrillion", " Quintillion", " Sextillion", " Septillion", " Octillion", " Nonillion", " Decillion", " Undecillion", " Duodecillion", " Tredecillion", " Quattuordecillion", " Quindecillion", " Sexdecillion", " Septendecillion", " Octodecillion", " Novemdecillion", " Vigintillion", " Unvigintillion", " Duovigintillion", " Trevigintillion", " Quattuorvigintillion", " Quinvigintillion", " Sesvigintillion", " Septenvigintillion", " Octovigintillion"];
      var findNumber = Math.floor(((zeros.length - 1) / 3));
      if (findNumber >= abrevation.length) return "Number is beyond Octovigintillion"

      number /= Math.pow(1000, findNumber);
      number = Math.round(number * 100) / 100;
      return number + abrevation[findNumber];
}
