module.exports = {
  name: 'kiss',
  aliases: ['smooch', 'peck'],
  description: 'Send a friendly kiss to a tagged or quoted user',
  run: async (context) => {
    const { client, m } = context;

    try {
      console.log(`Kiss command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`);

      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error('No tagged or quoted user provided');
          return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Please tag or reply to a user to send a kiss!`);
        }
      }

      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(`Target JID: ${targetUser}`);

      if (!targetUser || typeof targetUser !== 'string') {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Invalid user! Tag or reply to a valid person to send a kiss.`);
      }

      const targetNumber = targetUser.split('@')[0];
      const senderNumber = m.sender.split('@')[0];

      // Initial kiss message
      const kissMsg = await client.sendMessage(
        m.chat,
        {
          text: `◈━━━━━━━━━━━━━━━━◈\n│❒ @${senderNumber} is sending a sweet kiss to @${targetNumber}! 💋\n◈━━━━━━━━━━━━━━━━◈`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Random kiss intensity
      const intensities = [
        {
          level: 'Shy',
          description: '@SENDER gave @TARGET a shy, cute kiss. So adorable! 😄',
          emoji: '😊',
        },
        {
          level: 'Sweet',
          description: '@SENDER sent a sweet kiss to @TARGET. Hearts are melting! 💖',
          emoji: '💖',
        },
        {
          level: 'Passionate',
          description: '@SENDER gave @TARGET a passionate kiss! Sparks are flying! 🔥💋',
          emoji: '💋🔥',
        },
      ];

      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      const resultMsg = `◈━━━━━━━━━━━━━━━━◈
*KISS REPORT* ${intensity.emoji}

*KISSER:* @${senderNumber}
*RECEIVER:* @${targetNumber}
*INTENSITY:* ${intensity.level}

*DETAILS:* ${intensity.description.replace('@TARGET', `@${targetNumber}`).replace('@SENDER', `@${senderNumber}`)}

*DISCLAIMER:* Just a fun, friendly kiss! Spread love and positivity! 😄
◈━━━━━━━━━━━━━━━━◈`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Optional: delete the initial kiss message
      if (kissMsg && kissMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: kissMsg.key });
        } catch (deleteError) {
          console.error(`Failed to delete initial kiss message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Kiss command error: ${error.stack}`);
      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Something went wrong! Couldn’t send the kiss right now.`);
    }
  },
};