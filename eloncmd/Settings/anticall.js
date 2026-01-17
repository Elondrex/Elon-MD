const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`;
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
      const isEnabled = settings.anticall === true;

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (isEnabled === action) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Anticall is already ${value.toUpperCase()}! ✅`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('anticall', action);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Anticall has been turned ${value.toUpperCase()}! 🔥 Callers will be handled automatically.`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}anticall on`, buttonText: { displayText: "ON 🥶" }, type: 1 },
        { buttonId: `${prefix}anticall off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Anticall Status: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}. Choose an option:`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('Anticall update error:', error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Failed to update anticall. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};