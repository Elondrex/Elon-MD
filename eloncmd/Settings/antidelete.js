const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("No settings found in the database. Please check your setup.") },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (settings.antidelete === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Antidelete is already ${value.toUpperCase()}! ✅`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('antidelete', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Antidelete ${value.toUpperCase()} activated! 🔥 ${action ? 'Deleted messages will be retained.' : 'Messages can be deleted freely.'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}antidelete on`, buttonText: { displayText: "ON 🦁" }, type: 1 },
        { buttonId: `${prefix}antidelete off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Antidelete is currently ${settings.antidelete ? 'ON 🦁' : 'OFF 😴'}. Choose an option:`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('Antidelete update error:', error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Failed to update antidelete. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};