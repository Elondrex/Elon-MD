const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
  await middleware(context, async () => {
    const { client, m, botNumber } = context;

    // Log message context for debugging
    console.log(`Kick command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}`);

    // Check if a user is mentioned or quoted
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return m.reply(`◈━━━━━━━━◈\n│❒ Please mention a user or quote their message to kick.\n◈━━━━━━━━◈`);
    }

    // Get the target user (mentioned or quoted)
    const users = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
    if (!users) {
      console.error(`No valid user found: mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}`);
      return m.reply(`◈━━━━━━━━◈\n│❒ No user found. Make sure to tag or quote someone.\n◈━━━━━━━━◈`);
    }

    // Validate JID format
    if (
      typeof users !== 'string' ||
      (!users.includes('@s.whatsapp.net') && !users.includes('@lid'))
    ) {
      console.error(`Invalid JID format: ${users}`);
      return m.reply(`◈━━━━━━━━◈\n│❒ Invalid user format. Please tag a valid user.\n◈━━━━━━━━◈`);
    }

    // Extract phone number part from JID
    const parts = users.split('@')[0];
    if (!parts) {
      console.error(`Failed to extract number from JID: ${users}`);
      return m.reply(`◈━━━━━━━━◈\n│❒ Could not extract user information. Please try again.\n◈━━━━━━━━◈`);
    }

    // Prevent kicking the bot itself
    if (users === botNumber) {
      return m.reply(`◈━━━━━━━━◈\n│❒ I cannot kick myself from the group.\n◈━━━━━━━━◈`);
    }

    try {
      // Attempt to remove the user from the group
      await client.groupParticipantsUpdate(m.chat, [users], 'remove');
      await m.reply(
        `◈━━━━━━━━◈\n│❒ @${parts} has been removed from the group.\n◈━━━━━━━━◈`,
        { mentions: [users] }
      );
    } catch (error) {
      console.error(`Error in kick command: ${error.stack}`);
      await m.reply(
        `◈━━━━━━━━◈\n│❒ Could not remove @${parts}. Ensure I have admin privileges and try again.\n◈━━━━━━━━◈`,
        { mentions: [users] }
      );
    }
  });
};