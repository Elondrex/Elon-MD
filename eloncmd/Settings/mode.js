const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n┋❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`;
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
      const validModes = ['public', 'private'];

      if (validModes.includes(value)) {
        if (settings.mode === value) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`The bot is already in ${value.toUpperCase()} mode.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('mode', value);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Bot mode has been set to ${value.toUpperCase()}!`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}mode public`, buttonText: { displayText: "PUBLIC 🌐" }, type: 1 },
        { buttonId: `${prefix}mode private`, buttonText: { displayText: "PRIVATE 🔒" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Current Mode: ${settings.mode ? settings.mode.toUpperCase() : 'Undefined'}. Use the buttons below to change the mode.`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('Error updating bot mode:', error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Unable to update bot mode due to a database error. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};