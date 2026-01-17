const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n┋❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply('Database is not available or no settings found. Please check your setup.') },
          { quoted: m, ad: true }
        );
      }

      const value = args[0]?.toLowerCase();
      const validOptions = ['on', 'off'];

      if (validOptions.includes(value)) {
        const newState = value === 'on';
        if (settings.autoview === newState) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Autoview is already ${value.toUpperCase()}. No changes made.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('autoview', newState);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Autoview has been turned ${value.toUpperCase()}! ${newState ? 'The bot will now view all statuses automatically.' : 'Autoview has been disabled.'}`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}autoview on`, buttonText: { displayText: 'ON ✅' }, type: 1 },
        { buttonId: `${prefix}autoview off`, buttonText: { displayText: 'OFF ❌' }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Autoview Status: ${settings.autoview ? 'ON ✅ (Watching all statuses)' : 'OFF ❌ (Not viewing statuses)'}\nUse the buttons below to change the setting.`),
          footer: '> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳',
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error("[Autoview] Error:", error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply('Failed to update Autoview. Please try again later.') },
        { quoted: m, ad: true }
      );
    }
  });
};