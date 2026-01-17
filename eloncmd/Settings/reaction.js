const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;
    const newEmoji = args[0];

    const settings = await getSettings();
    const prefix = settings.prefix;
    const currentEmoji = settings.reactEmoji || 'No react emoji set';

    if (newEmoji) {
      if (newEmoji === 'random') {
        if (currentEmoji === 'random') {
          return await m.reply(
            `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
            `┋❒ Random emoji mode is already active.\n` +
            `┋❒ Reactions will continue to be random.\n` +
            `╰┈┈┈┈━━━━━━┈┈┈┈◈`
          );
        }
        await updateSetting('reactEmoji', 'random');
        await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
          `┋❒ Random emoji mode is now ON! 🔥\n` +
          `┋❒ Statuses will get random reactions.\n` +
          `╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      } else {
        if (currentEmoji === newEmoji) {
          return await m.reply(
            `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
            `┋❒ The reaction emoji is already set to "${newEmoji}".\n` +
            `┋❒ Please choose a different emoji if you want a change.\n` +
            `╰┈┈┈┈━━━━━━┈┈┈┈◈`
          );
        }
        await updateSetting('reactEmoji', newEmoji);
        await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
          `┋❒ Status reaction emoji updated to "${newEmoji}".\n` +
          `┋❒ Reactions will now use this emoji.\n` +
          `╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }
    } else {
      await m.reply(
        `╭┈┈┈┈━━━━━━┈┈┈┈◈\n` +
        `┋❒ Current reaction emoji: ${currentEmoji}\n` +
        `┋❒ Use "${prefix}reaction random" to enable random reactions or "${prefix}reaction <emoji>" to set a specific emoji.\n` +
        `╰┈┈┈┈━━━━━━┈┈┈┈◈`
      );
    }
  });
};