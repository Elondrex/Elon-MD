const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const newPrefix = args[0];

    const settings = await getSettings();

    if (newPrefix === 'null') {
      if (!settings.prefix) {
        return await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
          `│❒ The bot is already without a prefix.\n` +
          `│❒ No changes needed.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }
      await updateSetting('prefix', '');
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Prefix has been removed.\n` +
        `│❒ The bot is now prefixless.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    } else if (newPrefix) {
      if (settings.prefix === newPrefix) {
        return await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
          `│❒ The prefix is already set to "${newPrefix}".\n` +
          `│❒ No changes needed.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }
      await updateSetting('prefix', newPrefix);
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ New prefix has been set to "${newPrefix}".\n` +
        `│❒ All commands will now use this prefix.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    } else {
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `│❒ Current Prefix: ${settings.prefix || 'None'}\n` +
        `│❒ Use "${settings.prefix || '.'}prefix null" to remove the prefix or "${settings.prefix || '.'}prefix <symbol>" to set a new one.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }
  });
};