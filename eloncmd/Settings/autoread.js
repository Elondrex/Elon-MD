const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋➤ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`;
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
        if (settings.autoread === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Autoread is already ${value.toUpperCase()}. No changes made.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autoread', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Autoread has been turned ${value.toUpperCase()}! ${action ? 'The bot will now automatically mark messages as read.' : 'Autoread has been disabled.'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autoread on`, buttonText: { displayText: "ON 🟢" }, type: 1 },
        { buttonId: `${prefix}autoread off`, buttonText: { displayText: "OFF 🔴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Autoread is currently ${settings.autoread ? 'ON 🟢' : 'OFF 🔴'}.\nUse the buttons below to change the setting.`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error("[Autoread] Error:", error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Failed to update Autoread. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};