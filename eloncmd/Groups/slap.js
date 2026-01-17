const middleware = require('../../utility/botUtil/middleware');

module.exports = {
  name: 'slap',
  aliases: ['smack', 'hit'],
  description: 'Sends a fun slap reaction to a tagged or quoted user',
  run: async (context) => {
    const { client, m } = context;

    try {
      // Log message context for debugging
      console.log(`Slap command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`);

      // Check if a user is tagged or quoted
      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error('No tagged or quoted user provided');
          return m.reply(`◈━━━━━━━━◈\n│❒ Please tag someone or quote a message to slap.\n◈━━━━━━━━◈`);
        }
      }

      // Get the target user (tagged or quoted)
      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(`Target JID: ${targetUser}`);

      // Validate target user
      if (
        !targetUser ||
        typeof targetUser !== 'string' ||
        (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))
      ) {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(`◈━━━━━━━━◈\n│❒ Invalid user. Please tag a valid person to slap.\n◈━━━━━━━━◈`);
      }

      // Extract phone numbers
      const targetNumber = targetUser.split('@')[0];
      const senderNumber = m.sender.split('@')[0];
      if (!targetNumber || !senderNumber) {
        console.error(`Failed to extract numbers: target=${targetUser}, sender=${m.sender}`);
        return m.reply(`◈━━━━━━━━◈\n│❒ Could not extract user information. Please try again.\n◈━━━━━━━━◈`);
      }

      // Send slapping message with dramatic delay
      const slappingMsg = await client.sendMessage(
        m.chat,
        {
          text: `◈━━━━━━━━◈\n│❒ @${senderNumber} is playfully slapping @${targetNumber}... 🖐️\n│❒ Let’s see the reaction!\n◈━━━━━━━━◈`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Random dramatic delay between 1-3 seconds
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate random slap intensity
      const intensities = [
        {
          level: 'Light',
          description: 'a gentle tap that made @TARGET giggle! @SENDER, nice try!',
          emoji: '😄',
        },
        {
          level: 'Medium',
          description: 'a solid playful smack! @TARGET, that got your attention! @SENDER, well done!',
          emoji: '🖐️',
        },
        {
          level: 'Strong',
          description: 'a dramatic slap for maximum fun! @TARGET, that was surprising! @SENDER, impressive!',
          emoji: '💥',
        },
      ];
      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      // Build the final friendly result message
      const resultMsg = `◈━━━━━━━━◈
*SLAP REPORT* ${intensity.emoji}

*SLAPPER:* @${senderNumber}
*RECIPIENT:* @${targetNumber}
*INTENSITY:* ${intensity.level}

*VERDICT:* ${intensity.description.replace('@TARGET', `@${targetNumber}`).replace('@SENDER', `@${senderNumber}`)}

*DISCLAIMER:* This is all in good fun! 🙂
◈━━━━━━━━◈`;

      // Send the final result
      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Delete the slapping message for cleaner look
      if (slappingMsg && slappingMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: slappingMsg.key });
        } catch (deleteError) {
          console.error(`Failed to delete slapping message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Slap command error: ${error.stack}`);
      await m.reply(`◈━━━━━━━━◈\n│❒ Something went wrong. Unable to perform the slap at this time.\n◈━━━━━━━━◈`);
    }
  },
};