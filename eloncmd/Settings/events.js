const { getSettings, getGroupSettings, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const jid = m.chat;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      if (!jid.endsWith('@g.us')) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("This command only works in groups. Please use it inside a group chat.") },
          { quoted: m, ad: true }
        );
      }

      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("No settings found in the database. Please check your setup.") },
          { quoted: m, ad: true }
        );
      }

      const value = args[0]?.toLowerCase();
      let groupSettings = await getGroupSettings(jid);
      let isEnabled = groupSettings?.events === true || groupSettings?.events === 'true';

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (isEnabled === action) {
          return await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(`Events are already ${value.toUpperCase()} in this group.`),
            },
            { quoted: m, ad: true }
          );
        }

        await updateGroupSetting(jid, 'events', action);
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(`Events have been ${value.toUpperCase()}! ${action ? 'Group events are now active.' : 'Events have been turned off.'}`),
          },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}events on`, buttonText: { displayText: 'ON ✅' }, type: 1 },
        { buttonId: `${prefix}events off`, buttonText: { displayText: 'OFF ❌' }, type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Events Status: ${isEnabled ? 'ON ✅ (Active)' : 'OFF ❌ (Inactive)'}\nUse the buttons below to change the status.`),
          footer: '> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳',
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('Error in events.js:', error.stack);
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Could not update events due to a database error: ${error.message}. Please try again later.`),
        },
        { quoted: m, ad: true }
      );
    }
  });
};