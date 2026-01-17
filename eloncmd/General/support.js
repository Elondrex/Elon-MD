module.exports = async (context) => {
  const { client, m } = context;

  const message = `
★┈━━┈◈ 🄴🄻🄾🄽-🄼🄳 ◈┈┈━━┈➤
╭┈━〔 *Support Links* 〕━┈╮

> 👑 *Owner*  
https://wa.me/2347018486818

> 📢 *Channel Link*  
https://whatsapp.com/channel/0029VbC58oLAjPXSXn7Hyv1Q

> 👥 *Website*  
https://elondrex.vercel.app

╰━┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈━╯
> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳
`;

  try {
    await client.sendMessage(
      m.chat,
      { text: message },
      { quoted: m }
    );
  } catch (error) {
    console.error("Support command error:", error);
    await m.reply("⚠️ Failed to send support links. Please try again.");
  }
};