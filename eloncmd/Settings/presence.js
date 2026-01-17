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
          { text: formatStylishReply("Database is down, no settings found. Please check the database.") },
          { quoted: m, ad: true }
        );
      }

      const validPresenceValues = ['online', 'offline', 'recording', 'typing'];
      const value = args.join(" ").toLowerCase();

      if (validPresenceValues.includes(value)) {
        if (settings.presence === value) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Presence is already set to ${value.toUpperCase()}. No changes needed.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('presence', value);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Presence updated to ${value.toUpperCase()}. Bot is now showing this status.`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}presence online`, buttonText: { displayText: "ONLINE 🟢" }, type: 1 },
        { buttonId: `${prefix}presence offline`, buttonText: { displayText: "OFFLINE ⚫" }, type: 1 },
        { buttonId: `${prefix}presence recording`, buttonText: { displayText: "RECORDING 🎙️" }, type: 1 },
        { buttonId: `${prefix}presence typing`, buttonText: { displayText: "TYPING ⌨️" }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Current presence: ${settings.presence ? settings.presence.toUpperCase() : 'NONE'}. Choose a new status if you wish.`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error("Error updating presence:", error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Unable to update presence at the moment. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};