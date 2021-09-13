const { SlashCommandBuilder } = require('@discordjs/builders');
const { getServer } = require("../player-handler")
const {
    joinVoiceChannel,
} = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the player server session'),
    async execute(client, interaction) {
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

                console.log("guild id : ", interaction.guild.id);
                let server = getServer(interaction.guild.id, connection);

                console.log("server.connections : ", server.connections.length)
                for (let c of server.connections){
                    c.subscribe(server.player);
                }

                await interaction.reply('Joinned!');

            } catch (error) {
                console.error(error);
            }
        } else {
            await interaction.reply('Join a voice channel then try again!');
        }
    },
};