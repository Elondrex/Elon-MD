const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ This command is for groups only. Please use it in a group chat.`);
    }

    try {
      const settings = await getSettings();
      if (!settings) {
        return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ No global settings found. Please check the database or try again later.`);
      }

      let groupSettings = await getGroupSetting(jid);
      if (!groupSettings) {
        return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ No settings found for this group. Please try again later.`);
      }

      let isEnabled = groupSettings?.antiforeign === true;

      const Myself = await client.decodeJid(client.user.id);
      const groupMetadata = await client.groupMetadata(m.chat);
      const userAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
      const isBotAdmin = userAdmins.includes(Myself);

      if (value === 'on' || value === 'off') {
        if (!isBotAdmin) {
          return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ I need to be an admin to change the antiforeign setting. Please make me an admin first.`);
        }

        const action = value === 'on';

        if (isEnabled === action) {
          return await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Antiforeign is already ${value.toUpperCase()}. No changes needed.`);
        }

        await updateGroupSetting(jid, 'antiforeign', action);
        await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Antiforeign has been turned ${value.toUpperCase()} successfully.`);
      } else {
        await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Current Antiforeign status: ${isEnabled ? 'ON' : 'OFF'}\n\nUse ${prefix}antiforeign on or ${prefix}antiforeign off to change it.`);
      }
    } catch (error) {
      console.error('[Antiforeign] Error in command:', error);
      await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ An error occurred while updating antiforeign. Please try again later.`);
    }
  });
};