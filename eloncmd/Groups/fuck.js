module.exports = {
  name: 'poke',
  aliases: ['tease', 'nudge'],
  description: 'Sends a fun, playful reaction to a tagged or quoted user',
  run: async (context) => {
    const { client, m } = context;

    try {
      console.log(`Poke command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`);

      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error('No tagged or quoted user provided');
          return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Please tag or reply to a user to poke!`);
        }
      }

      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(`Target JID: ${targetUser}`);

      if (!targetUser || typeof targetUser !== 'string') {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Invalid user! Tag or reply to a valid person.`);
      }

      const targetNumber = targetUser.split('@')[0];
      const senderNumber = m.sender.split('@')[0];

      // Initial poke message
      const pokeMsg = await client.sendMessage(
        m.chat,
        {
          text: `◈━━━━━━━━━━━━━━━━◈\n│❒ @${senderNumber} is playfully poking @${targetNumber}! 😄\n◈━━━━━━━━━━━━━━━━◈`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Random playful intensity
      const intensities = [
        {
          level: 'Gentle',
          description: '@SENDER gave @TARGET a light, friendly poke. Everyone smiles! 😊',
          emoji: '😊',
        },
        {
          level: 'Cheeky',
          description: '@SENDER playfully teased @TARGET. Fun times ahead! 😎',
          emoji: '😎',
        },
        {
          level: 'Epic',
          description: '@SENDER sent a super energetic poke to @TARGET. What a reaction! 🎉',
          emoji: '🎉',
        },
      ];

      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      const resultMsg = `◈━━━━━━━━━━━━━━━━◈
*POKE REPORT* ${intensity.emoji}

*FROM:* @${senderNumber}
*TO:* @${targetNumber}
*INTENSITY:* ${intensity.level}

*DETAILS:* ${intensity.description.replace('@TARGET', `@${targetNumber}`).replace('@SENDER', `@${senderNumber}`)}

*DISCLAIMER:* Just for fun and friendly interaction! Keep it lighthearted. 😄
◈━━━━━━━━━━━━━━━━◈`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      // Optional: delete the initial poke message to keep chat clean
      if (pokeMsg && pokeMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: pokeMsg.key });
        } catch (deleteError) {
          console.error(`Failed to delete initial poke message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Poke command error: ${error.stack}`);
      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Something went wrong while poking. Please try again later.`);
    }
  },
};