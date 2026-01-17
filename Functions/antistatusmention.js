const { getSettings } = require("../Database/config");

module.exports = async (client, m) => {
    try {
        if (!m?.message) return;
        if (m.key.fromMe) return;
        if (!m.isGroup) return;

        const exemptGroup = "120363156185607326@g.us";
        if (m.chat === exemptGroup) return;

        const settings = await getSettings();
        const mode = settings.antistatusmention;

        if (!mode || mode === "off" || mode === "false") return;

        if (m.mtype !== 'groupStatusMentionMessage') return;

        const isAdmin = m.isAdmin;
        const isBotAdmin = m.isBotAdmin;

        if (isAdmin) {
            await client.sendMessage(m.chat, {
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ *Admin Status Mention*\n┋❒ User: @${m.sender.split("@")[0]}\n┋❒ Status: Admin privileges\n┋❒ Admins are allowed\n╰┈┈┈┈━━━━━━┈┈┈┈◈`,
                mentions: [m.sender],
            });
            return;
        }

        if (!isBotAdmin) return;

        await client.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.sender,
            },
        });

        if (mode === "delete" || mode === "true") {
            await client.sendMessage(m.chat, {
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ *🄴🄻🄾🄽-🄼🄳 AntiStatusMention*\n┋❒ User: @${m.sender.split("@")[0]}\n┋❒ Action: Status mention deleted 🗑️\n┋❒ Warning: Next time = removal\n╰┈┈┈┈━━━━━━┈┈┈┈◈`,
                mentions: [m.sender],
            });
        }

        if (mode === "remove") {
            try {
                await client.groupParticipantsUpdate(m.chat, [m.sender], "remove");
                await client.sendMessage(m.chat, {
                    text: `╭┈┈┈┈━━━━━━┈┈┈┈◈\n┋❒ *🄴🄻🄾🄽-🄼🄳 AntiStatusMention*\n┋❒ User: @${m.sender.split("@")[0]}\n│❒ Action: Removed from group 🚫\n╰┈┈┈┈━━━━━━┈┈┈┈◈`,
                    mentions: [m.sender],
                });
            } catch {
                await client.sendMessage(m.chat, {
                    text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ *Admin Error*\n┋❒ Error can't remove! user\n╰┈┈┈┈━━━━━━┈┈┈┈◈`,
                });
            }
        }
    } catch (err) {}
};