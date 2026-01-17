const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`;
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
        if (settings.autobio === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Autobio is already ${value.toUpperCase()}. No changes made.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autobio', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Autobio has been turned ${value.toUpperCase()}. ${action ? 'The bot will now update its status every 10 seconds.' : 'Status updates are now disabled.'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autobio on`, buttonText: { displayText: "ON 🟢" }, type: 1 },
        { buttonId: `${prefix}autobio off`, buttonText: { displayText: "OFF 🔴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Autobio is currently ${settings.autobio ? 'ON 🟢' : 'OFF 🔴'}.\nSelect an option below to change it.`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error("[Autobio] Error:", error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Failed to update Autobio. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};