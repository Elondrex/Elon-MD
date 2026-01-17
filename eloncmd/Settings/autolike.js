const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`;
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
        if (settings.autolike === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Autolike is already ${value.toUpperCase()}. No changes made.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autolike', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Autolike has been turned ${value.toUpperCase()}! ${action ? 'The bot will now automatically like statuses.' : 'Automatic liking has been disabled.'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autolike on`, buttonText: { displayText: "ON 🟢" }, type: 1 },
        { buttonId: `${prefix}autolike off`, buttonText: { displayText: "OFF 🔴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Autolike is currently ${settings.autolike ? 'ON 🟢' : 'OFF 🔴'}.\nSelect an option below to change it.`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error("[Autolike] Error:", error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Failed to update Autolike. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};