module.exports = {
  name: 'gaycheck',
  aliases: ['gaymeter', 'gcheck', 'howgay'],
  description: 'Checks gay percentage in a fun and friendly way',
  run: async (context) => {
    const { client, m } = context;

    try {
      let targetUser = null;

      console.log(`Message context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${m.quoted?.sender || 'none'}`);

      // Determine the target user
      if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]; // Use the first tagged user
      } else if (m.quoted && m.quoted.sender) {
        targetUser = m.quoted.sender; // Use the quoted user
      } else {
        targetUser = m.sender; // Default to command sender
      }

      // Validate target user
      if (!targetUser || typeof targetUser !== 'string' || (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))) {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(`◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈\nPlease mention someone or reply to a message to check their gay percentage.\n◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈`);
      }

      const targetNumber = targetUser.split('@')[0];

      // Send initial checking message
      const checkingMsg = await client.sendMessage(
        m.chat,
        {
          text: `◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈\nChecking @${targetNumber}'s gay percentage... 🌈\n◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈`,
          mentions: [targetUser],
        },
        { quoted: m }
      );

      // Wait a short random delay for effect
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      const percentage = Math.floor(Math.random() * 101);

      // Fun verdicts based on percentage
      let verdict = '';
      let emoji = '';

      if (percentage === 0) {
        verdict = "Absolutely straight! Keep rocking your style.";
        emoji = "🚫🏳️‍🌈";
      } else if (percentage <= 25) {
        verdict = "Mostly straight with a hint of fabulousness!";
        emoji = "📏";
      } else if (percentage <= 50) {
        verdict = "Halfway to fabulous! Embrace your inner rainbow!";
        emoji = "🌈";
      } else if (percentage <= 75) {
        verdict = "Quite fabulous! The rainbow vibes are strong.";
        emoji = "🌟";
      } else if (percentage <= 99) {
        verdict = "Rainbow energy overload! You’re dazzling everyone.";
        emoji = "🌈🔥";
      } else {
        verdict = "Ultimate gay cosmic legend! Shine bright!";
        emoji = "👑🌈";
      }

      const resultMsg = `◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
*GAY METER RESULTS* ${emoji}

*TARGET:* @${targetNumber}
*GAY PERCENTAGE:* ${percentage}% 

*VERDICT:* ${verdict}

*DISCLAIMER:* Just for fun! Enjoy the rainbow vibes. 🌈
◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈`;

      // Send the final result
      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [targetUser],
        },
        { quoted: m }
      );

      // Delete the checking message
      if (checkingMsg?.key) {
        try {
          await client.sendMessage(m.chat, { delete: checkingMsg.key });
        } catch (deleteError) {
          console.error(`Failed to delete checking message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Gaycheck command error: ${error.stack}`);
      await m.reply(`◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈\nUnable to check gay percentage right now. Please try again later.\n◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈`);
    }
  },
};