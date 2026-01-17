module.exports = async (context) => {
  const { client, m, chatUpdate, store, isBotAdmin, isAdmin } = context;

  if (!m.isGroup) {
    return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈
│❒ This command can only be used in groups. Please try it there.
◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
  }

  if (!isAdmin) {
    return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈
│❒ You need to be a group admin to approve participants. 
◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
  }

  if (!isBotAdmin) {
    return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈
│❒ I need admin rights to approve participants. Please make me an admin first.
◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
  }

  try {
    const responseList = await client.groupRequestParticipantsList(m.chat);

    if (responseList.length === 0) {
      return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈
│❒ There are no pending join requests at the moment.
◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
    }

    for (const participant of responseList) {
      try {
        await client.groupRequestParticipantsUpdate(
          m.chat,
          [participant.jid],
          "approve"
        );
      } catch (error) {
        console.error('Error approving participant:', error);
        return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈
│❒ Could not approve @${participant.jid.split('@')[0]}. Please try again later.`, 
        { mentions: [participant.jid] });
      }
    }

    m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈
│❒ All pending join requests have been approved successfully.
◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
    
  } catch (error) {
    console.error('Error fetching pending participants:', error);
    m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈
│❒ Something went wrong while fetching pending requests. Please try again later.
◈┈┈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
  }
};