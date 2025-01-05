const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const load = require('lodash');

module.exports = {
    name: "serverlist",
    category: "Developer",
    aliases: ["slist"],
    description: "",
    cooldown: 5,
    args: false,
    usage: "<string>",
    permission: [],
    owner: true, // Mark this command as owner-only
    async execute(client, message, args, prefix, color) {
        const owners = ["1219568207719960578", "747321055319949312"];

        if (!owners.includes(message.author.id)) {
            return message.channel.send({ 
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000') // Use red if no color is defined
                    .setDescription(`<:nwrong:1275390590426812426> You do not have permission to use this command.`)
                ] 
            });
        }

        const serverlist = client.guilds.cache.map((guild) => 
            `**\`\`\`Server Name: "${guild.name}"\nGuild ID: "${guild.id}"\nMember Count: "${guild.memberCount}"\`\`\`**`
        );

        const mapping = load.chunk(serverlist, 10);
        const pages = mapping.map((s) => s.join("\n"));
        let page = 0;

        const embedColor = client.embedColor || '#FF0000'; // Fallback to red if not defined

        if (client.guilds.cache.size <= 10) {
            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(pages[page])
                .setFooter({
                    text: `Page ${page + 1}/${pages.length}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setTitle(`${message.client.user.username} Server List [${client.guilds.cache.size}]`);

            return await message.channel.send({
                embeds: [embed]
            });

        } else {
            const embed2 = new EmbedBuilder()
                .setColor(embedColor)
                .setDescription(pages[page])
                .setFooter({
                    text: `Page ${page + 1}/${pages.length}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setTitle(`${message.client.user.username} Server List [${client.guilds.cache.size}]`);

            const but1 = new ButtonBuilder()
                .setCustomId("server_list_next")
                .setLabel(`Next`)
                .setStyle(ButtonStyle.Secondary);

            const but2 = new ButtonBuilder()
                .setCustomId("server_list_previous")
                .setLabel(`Back`)
                .setStyle(ButtonStyle.Secondary);

            const but3 = new ButtonBuilder()
                .setCustomId("server_list_stop")
                .setLabel(`Close`)
                .setStyle(ButtonStyle.Danger);

            const disbut = new ButtonBuilder()
                .setDisabled(true)
                .setCustomId("disabled")
                .setLabel(`Next`)
                .setStyle(ButtonStyle.Secondary);

            const disbut1 = new ButtonBuilder()
                .setDisabled(true)
                .setCustomId("disabled1")
                .setLabel(`Back`)
                .setStyle(ButtonStyle.Secondary);

            const disbut2 = new ButtonBuilder()
                .setDisabled(true)
                .setCustomId("disabled2")
                .setLabel(`Close`)
                .setStyle(ButtonStyle.Danger);

            const row1 = new ActionRowBuilder().addComponents([but2, but3, but1]);

            const msg = await message.channel.send({
                embeds: [embed2],
                components: [row1],
            });

            const collector = message.channel.createMessageComponentCollector({
                filter: (b) => {
                    if (b.user.id === message.author.id) return true;
                    else {
                        b.reply({
                            ephemeral: true,
                            content: `<:nwrong:1275390590426812426> Only **${message.author.tag}** can use this button, if you want then you've to run the command again.`,
                        });
                        return false;
                    }
                },
                time: 60000 * 5,
                idle: 60000 * 2
            });

            collector.on("collect", async (button) => {
                if (button.customId === "server_list_next") {
                    await button.deferUpdate().catch(() => {});
                    page = page + 1 < pages.length ? ++page : 0;

                    const embed3 = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(pages[page])
                        .setFooter({
                            text: `Page ${page + 1}/${pages.length}`,
                            iconURL: message.author.displayAvatarURL({ dynamic: true }),
                        })
                        .setTitle(`${message.client.user.username} Server List [${client.guilds.cache.size}]`);

                    await msg.edit({
                        embeds: [embed3],
                        components: [row1],
                    }).catch(() => {});
                } else if (button.customId === "server_list_previous") {
                    await button.deferUpdate().catch(() => {});
                    page = page > 0 ? --page : pages.length - 1;

                    const embed4 = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(pages[page])
                        .setFooter({
                            text: `Page ${page + 1}/${pages.length}`,
                            iconURL: message.author.displayAvatarURL({ dynamic: true }),
                        })
                        .setTitle(`${message.client.user.username} Server List [${client.guilds.cache.size}]`);

                    await msg.edit({
                        embeds: [embed4],
                        components: [row1],
                    }).catch(() => {});
                } else if (button.customId === "server_list_stop") {
                    await button.deferUpdate().catch(() => {});
                    collector.stop();
                } else return;
            });

            collector.on("end", async () => {
                await msg.edit({
                    components: [
                        new ActionRowBuilder().addComponents([disbut1, disbut2, disbut]),
                    ],
                });
            });
        }
    }
};
