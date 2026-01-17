const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ This command is only available for groups.\n` +
        `│❒ Please use it in a group chat.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    const settings = await getSettings();
    const prefix = settings?.prefix || '.';

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.antipromote === true;

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      if (isEnabled === action) {
        return await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
          `│❒ Antipromote is already set to ${value.toUpperCase()}.\n` +
          `│❒ No changes were made.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      await updateGroupSetting(jid, 'antipromote', action ? 'true' : 'false');
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Antipromote has been turned ${value.toUpperCase()}.\n` +
        `│❒ Promotions in this group will now follow this setting.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    } else {
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Current Antipromote Status: ${isEnabled ? 'ON' : 'OFF'}\n` +
        `│❒ Use "${prefix}antipromote on" or "${prefix}antipromote off" to change it.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }
  });
};