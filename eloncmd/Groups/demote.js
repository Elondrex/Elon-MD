const middleware = require('../../utility/botUtil/middleware');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'demote',
  aliases: ['unadmin', 'removeadmin'],
  description: 'Demotes a user from admin in a group',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, botname, prefix } = context;

      if (!botname) {
        console.error('Elon-MD: Botname not set in context');
        return m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ Botname is not set in the context. Please contact the developer.
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }

      if (!m.isGroup) {
        console.log(`Elon-MD: Demote command attempted in non-group chat by ${m.sender}`);
        return m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ This command can only be used in group chats.
│❒ Usage: ${prefix}demote @user
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }

      // Fetch group metadata
      let groupMetadata;
      try {
        groupMetadata = await client.groupMetadata(m.chat);
      } catch (e) {
        console.error(`Elon-MD: Error fetching group metadata: ${e.stack}`);
        return m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈
│❒ Could not fetch group information: ${e.message}
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }

      const members = groupMetadata.participants;
      const admins = members
        .filter((p) => p.admin != null)
        .map((p) => p.id.split(':')[0]); // Normalize JIDs
      const botId = client.user.id.split(':')[0]; // Normalize bot ID
      console.log(`Elon-MD: Bot ID: ${botId}, Admins: ${JSON.stringify(admins)}`);

      if (!admins.includes(botId)) {
        console.log(`Elon-MD: Bot ${botId} is not admin in ${m.chat}`);
        return m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈
│❒ I am not an admin in this group. Please make me admin to use this command.
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }

      // Check for mentioned or quoted user
      if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        console.log(`Elon-MD: No user mentioned or quoted for demote by ${m.pushName}`);
        return m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ Please mention or reply to the user you want to demote.
│❒ Usage: ${prefix}demote @user
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }

      const user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      if (!user) {
        console.log(`Elon-MD: Invalid user for demote in ${m.chat}`);
        return m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ No valid user found to demote. Please try again.
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }

      const userNumber = user.split('@')[0];
      const userName =
        m.mentionedJid[0]
          ? members.find((p) => p.id.split(':')[0] === user.split(':')[0])?.name || userNumber
          : m.quoted?.pushName || userNumber;

      // Protect the owner
      const settings = await getSettings();
      const ownerNumber = settings.owner || '2347018486818@s.whatsapp.net';
      if (user.split(':')[0] === ownerNumber.split(':')[0]) {
        console.log(`Elon-MD: Attempt to demote owner ${user} by ${m.pushName}`);
        return m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ You cannot demote the group owner.
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }

      // Check if user is admin
      if (!admins.includes(user.split(':')[0])) {
        console.log(`Elon-MD: User ${userName} (${user}) is not admin in ${m.chat}`);
        return m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ ${userName} is not an admin.
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }

      try {
        await client.groupParticipantsUpdate(m.chat, [user], 'demote');
        console.log(`Elon-MD: Successfully demoted ${userName} (${user}) in ${m.chat}`);
        await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ ${userName} has been successfully demoted from admin by *${botname}*.
╰┈┈┈┈━━━━━━┈┈┈┈◈`,
          { mentions: [user] }
        );
      } catch (error) {
        console.error(`Elon-MD: Demote command error: ${error.stack}`);
        await m.reply(
          `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
│❒ Could not demote ${userName}: ${error.message}. Please try again later.
╰┈┈┈┈━━━━━━┈┈┈┈◈`
        );
      }
    });
  },
};