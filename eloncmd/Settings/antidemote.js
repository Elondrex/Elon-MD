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
        `│❒ This command works in groups only. Please use it inside a group.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    const settings = await getSettings();
    const prefix = settings.prefix || '.';

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.antidemote === true;

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      if (isEnabled === action) {
        return await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
          `│❒ Antidemote is already ${value.toUpperCase()}.\n` +
          `│❒ No changes needed.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      await updateGroupSetting(jid, 'antidemote', action ? 'true' : 'false');
      return await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Antidemote ${value.toUpperCase()} successfully! 🔥\n` +
        `│❒ Demotions are now monitored in this group.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    } else {
      return await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Antidemote Status: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}\n` +
        `│❒ Use "${prefix}antidemote on" or "${prefix}antidemote off" to change.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }
  });
};