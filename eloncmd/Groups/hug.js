module.exports = {
  name: 'hug',
  aliases: ['cuddle', 'embrace'],
  description: 'Send a friendly hug to a tagged or quoted user',
  run: async (context) => {
    const { client, m } = context;

    try {
      console.log(`Hug command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`);

      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error('No tagged or quoted user provided');
          return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Please tag or reply to a user to send a hug!`);
        }
      }

      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(`Target JID: ${targetUser}`);

      if (!targetUser || typeof targetUser !== 'string') {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Invalid user! Tag or reply to a valid person to send a hug.`);
      }

      const targetNumber = targetUser.split('@')[0];
      const senderNumber = m.sender.split('@')[0];

      // Initial hug message
      const hugMsg = await client.sendMessage(
        m.chat,
        {
          text: `◈━━━━━━━━━━━━━━━━◈\n│❒ @${senderNumber} is giving a warm hug to @${targetNumber}! 🤗\n◈━━━━━━━━━━━━━━━━◈`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Random hug intensity
      const intensities = [
        {
          level: 'Gentle',
          description: '@SENDER gave @TARGET a soft, comforting hug. So heartwarming! ❤️',
          emoji: '😊',
        },
        {
          level: 'Warm',
          description: '@SENDER shared a cozy hug with @TARGET. Everyone feels good! 🤗',
          emoji: '🤗',
        },
        {
          level: 'Epic',
          description: '@SENDER wrapped @TARGET in a big, enthusiastic hug! So much love! 💖',
          emoji: '💖',
        },
      ];

      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      const resultMsg = `◈━━━━━━━━━━━━━━━━◈
*HUG REPORT* ${intensity.emoji}

*HUGGER:* @${senderNumber}
*RECEIVER:* @${targetNumber}
*INTENSITY:* ${intensity.level}

*DETAILS:* ${intensity.description.replace('@TARGET', `@${targetNumber}`).replace('@SENDER', `@${senderNumber}`)}

*DISCLAIMER:* Just a fun, friendly hug! Stay positive and spread kindness! 😄
◈━━━━━━━━━━━━━━━━◈`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Optional: delete the initial hug message
      if (hugMsg && hugMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: hugMsg.key });
        } catch (deleteError) {
          console.error(`Failed to delete initial hug message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Hug command error: ${error.stack}`);
      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Something went wrong! Couldn’t send the hug right now.`);
    }
  },
};