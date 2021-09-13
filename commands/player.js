const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

async function start(client, interaction) {

    const playPause = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('playPause')
                .setLabel('⏸️')
                .setStyle('SECONDARY'),
        )
        .addComponents(
            new MessageButton()
                .setCustomId('next')
                .setLabel('⏭️')
                .setStyle('SECONDARY'),
        );

    await interaction.reply({ content: 'Commands', components: [playPause] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('player')
        .setDescription('Display player'),
    async execute(client, interaction) {
        await start(client, interaction);
    },
};