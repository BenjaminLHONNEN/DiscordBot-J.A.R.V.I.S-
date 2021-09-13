const fs = require('fs');
const {Client, Collection, Intents} = require('discord.js');
const {token} = require('./config.json');
const {next, pause} = require("./player-handler.js");
const wait = require('util').promisify(setTimeout);

// Initialise Discord JS client
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

// List commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('ready', async () => {
    console.log('Discord.js client is ready!');
});

client.on('interactionCreate', async interaction => {
    // Handle Player button click
    if(interaction.isButton()){
        console.log("interaction : ", interaction.customId);
        if(interaction.customId === "playPause"){
            pause(interaction.guild.id);
            await interaction.reply("👌");
            await wait(1000);
            await interaction.deleteReply();
        }
        if(interaction.customId === "next"){
            next(interaction.guild.id);
            await interaction.reply("👌");
            await wait(1000);
            await interaction.deleteReply();
        }
    }

    // Handle command
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.log(error);
        console.error(error);
        return interaction.reply({
            content: 'Test - There was an error while executing this command!' + error,
            ephemeral: true
        });
    }
});

client.login(token);

client.on("message", args => {
    // console.log(args)
})