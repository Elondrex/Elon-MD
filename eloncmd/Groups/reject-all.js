const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
  await middleware(context, async () => {
    const { client, m, isBotAdmin, isAdmin } = context;

    if (!m.isGroup) {
      return m.reply(`◈━━━━━━━━◈\n│❒ This command can only be used in groups.\n◈━━━━━━━━◈`);
    }

    if (!isAdmin) {
      return m.reply(`◈━━━━━━━━◈\n│❒ Only group admins can reject join requests.\n◈━━━━━━━━◈`);
    }

    if (!isBotAdmin) {
      return m.reply(`◈━━━━━━━━◈\n│❒ I need admin privileges to manage join requests. Please promote me first.\n◈━━━━━━━━◈`);
    }

    let requests;
    try {
      requests = await client.groupRequestParticipantsList(m.chat);
      console.log(`Fetched ${requests.length} pending join requests for ${m.chat}`);
    } catch (err) {
      console.error(`Failed to fetch join requests: ${err.stack}`);
      return m.reply(`◈━━━━━━━━◈\n│❒ Could not fetch join requests. Please try again later.\n◈━━━━━━━━◈`);
    }

    if (!requests.length) {
      return m.reply(`◈━━━━━━━━◈\n│❒ There are no pending join requests at the moment.\n◈━━━━━━━━◈`);
    }

    for (const participant of requests) {
      try {
        await client.groupRequestParticipantsUpdate(m.chat, [participant.jid], "reject");
        console.log(`Rejected join request: ${participant.jid}`);
      } catch (err) {
        console.error(`Failed to reject ${participant.jid}: ${err.stack}`);
        await m.reply(
          `◈━━━━━━━━◈\n│❒ Could not reject request from @${participant.jid.split('@')[0]}.\n◈━━━━━━━━◈`,
          { mentions: [participant.jid] }
        );
      }
    }

    m.reply(`◈━━━━━━━━◈\n│❒ All pending join requests have been rejected.\n◈━━━━━━━━◈`);
  });
};