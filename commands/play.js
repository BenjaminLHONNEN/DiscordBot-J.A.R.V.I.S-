const {SlashCommandBuilder} = require('@discordjs/builders');
const {addVideo, getPlayerOrCreate} = require("../player-handler")
const {joinVoiceChannel,} = require('@discordjs/voice');

// Handle play command
// Connect to the Voice channel and launch player service
async function start(client, interaction) {
    const url = interaction.options.getString('url');
    const guild = client.guilds.cache.get(interaction.guild.id)
    const member = guild.members.cache.get(interaction.member.user.id);
    const voiceChannel = member.voice.channel;

    if (voiceChannel) {
        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            let player = getPlayerOrCreate(interaction.guild.id, connection);

            connection.subscribe(player);

            addVideo(voiceChannel.guild.id, url);

            return await interaction.reply('Playing : ' + url);

        } catch (error) {
            console.error(error);
        }
    } else {
        await interaction.reply('Join a voice channel then try again!');
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play 🎶🎶🎶')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('url')
                .setRequired(true)),
    async execute(client, interaction) {
        await start(client, interaction);
    },
};