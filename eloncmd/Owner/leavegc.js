const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware'); 

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, Owner, participants, botname } = context;

        if (!botname) {
            console.error(`Botname not set.`);
            return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Bot configuration error: bot name missing. Please contact the developer.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`);
        }

        if (!Owner) {
            console.error(`Owner not set.`);
            return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Bot configuration error: owner info missing. Please contact the developer.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`);
        }

        if (!m.isGroup) {
            return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ This command can only be used in groups.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`);
        }

        try {
            const maxMentions = 50;
            const mentions = participants.slice(0, maxMentions).map(a => a.id);
            await client.sendMessage(m.chat, { 
                text: `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ${botname} is leaving the group. Wishing you all the best!\n${mentions.length < participants.length ? 'Note: Not all participants were mentioned due to limit.' : ''}\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`, 
                mentions 
            }, { quoted: m });
            console.log(`[LEAVE-DEBUG] Leaving group ${m.chat}, mentioned ${mentions.length} participants`);
            await client.groupLeave(m.chat);
        } catch (error) {
            console.error(`[LEAVE-ERROR] Couldn’t leave the group: ${error.stack}`);
            await m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Failed to leave the group: ${error.message}. Please try again.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`);
        }
    });
};