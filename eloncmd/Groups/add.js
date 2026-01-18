const middleware = require('../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m, text, participants } = context;

        if (!text) {
            return m.reply(
                "Provide number(s) to add.\n\nExample:\nadd 2347018486818\nadd 2347018486818,23480xxxxxx"
            );
        }

        if (!participants || !Array.isArray(participants)) {
            return m.reply("❌ Failed to fetch group participants.");
        }

        const groupMembers = participants.map(u => u.id);

        const numbers = text
            .split(',')
            .map(v => v.replace(/[^0-9]/g, ''))
            .filter(v => v.length > 6);

        if (!numbers.length) {
            return m.reply("❌ No valid numbers detected.");
        }

        const jids = numbers
            .map(n => n + '@s.whatsapp.net')
            .filter(jid => !groupMembers.includes(jid));

        if (!jids.length) {
            return m.reply("⚠️ All users are already in the group.");
        }

        try {
            await client.groupParticipantsUpdate(
                m.chat,
                jids,
                'add'
            );

            await m.reply("✅ User(s) added successfully.");
        } catch (err) {
            console.error(err);
            await m.reply("❌ Failed to add user(s). They may have privacy restrictions.");
        }
    });
};
