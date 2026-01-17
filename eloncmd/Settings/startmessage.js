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
          { text: formatStylishReply("Database not found. Please check your settings.") },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (settings.startmessage === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Start message is already ${value.toUpperCase()}. No changes needed.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('startmessage', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Start message ${value.toUpperCase()} activated! 🔥 ${action ? 'Welcome messages will now be sent to new users. 🎉' : 'Welcome messages have been disabled.'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}startmessage on`, buttonText: { displayText: "ON 🎉" }, type: 1 },
        { buttonId: `${prefix}startmessage off`, buttonText: { displayText: "OFF 🚫" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Start message is currently ${settings.startmessage ? 'ON 🎉' : 'OFF 🚫'}. Use the buttons below to toggle.`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("An error occurred while updating start message. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};