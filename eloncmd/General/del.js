module.exports = {
  name: 'del',
  aliases: ['delete', 'd'],
  description: 'Deletes the replied-to or quoted message',
  run: async (context) => {
    const { client, m, botname } = context;

    if (!botname) {
      console.error(`Botname not set.`);
      return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Bot name not found in context. Please check your setup.\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
    }

    try {
      // Validate m.sender
      if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
        console.error(`Invalid m.sender: ${JSON.stringify(m.sender)}`);
        return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Unable to read your number. Please try again.\n│❒ Check https://github.com/elondrex/Elon-MD for help.\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
      }

      const userNumber = m.sender.split('@')[0];
      const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
      const isGroup = m.key.remoteJid.endsWith('@g.us');

      // Determine the message to delete
      let deleteKey = null;
      let quotedSender = null;

      if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const contextInfo = m.message.extendedTextMessage.contextInfo;
        if (contextInfo.stanzaId && contextInfo.participant) {
          deleteKey = {
            remoteJid: contextInfo.remoteJid || m.key.remoteJid,
            fromMe: contextInfo.participant === botJid,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant
          };
          quotedSender = contextInfo.participant;
        }
      }

      if (!deleteKey && m.quoted && m.quoted.message) {
        deleteKey = {
          remoteJid: m.quoted.key.remoteJid,
          fromMe: m.quoted.fromMe,
          id: m.quoted.key.id,
          participant: m.quoted.key.participant || m.quoted.sender
        };
        quotedSender = m.quoted.sender;
      }

      if (!deleteKey) {
        return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Please reply to or quote a message to delete it.\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
      }

      // Group permissions check
      if (isGroup && !deleteKey.fromMe) {
        const groupMetadata = await client.groupMetadata(m.key.remoteJid);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin != null).map(p => p.id);
        const isBotAdmin = groupAdmins.includes(botJid);

        if (!isBotAdmin) {
          return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ I’m not an admin and cannot delete @${quotedSender.split('@')[0]}’s message. Please promote me.\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`, {
            mentions: [quotedSender, m.sender]
          });
        }
      }

      // Delete the message
      await client.sendMessage(m.key.remoteJid, { delete: deleteKey });

      await m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\nMessage deleted successfully, @${userNumber}!\nPowered by *${botname}*\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`, {
        mentions: [m.sender]
      });

    } catch (error) {
      console.error(`Del command error: ${error.stack}`);
      await m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n│❒ Failed to delete the message, @${m.sender.split('@')[0]}.\n│❒ Please try again.\n│❒ Check https://github.com/elondrex/Elon-MD for help.\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`, {
        mentions: [m.sender]
      });
    }
  }
};