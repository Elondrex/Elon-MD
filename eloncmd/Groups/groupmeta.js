const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m, text, prefix, pict } = context;

        const args = text.trim().split(/ +/);
        const command = args[0]?.toLowerCase() || '';
        const newText = args.slice(1).join(' ').trim();

        switch (command) {
            case 'setgroupname':
                if (!newText) return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Yo, give me a new group name! Usage: ${prefix}setgroupname <new name>\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
                if (newText.length > 100) return m.reply('◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Group name can’t be longer than 100 characters, genius! 😑\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈');

                try {
                    await client.groupUpdateSubject(m.chat, newText);
                    await m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Group name slammed to "${newText}"! Let’s keep the chaos going! 😈\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`, {
                        contextInfo: {
                            externalAdReply: {
                                title: `🄴🄻🄾🄽-🄼🄳`,
                                body: `Group Update`,
                                previewType: "PHOTO",
                                thumbnail: pict,
                                sourceUrl: 'https://github.com/elondrex/Elon-MD'
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error updating group subject:', error);
                    await m.reply('◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Failed to update group name. WhatsApp’s acting up, not me! 😬\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈');
                }
                break;

            case 'setgroupdesc':
                if (!newText) return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Gimme a new description! Usage: ${prefix}setgroupdesc <new description>\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`);

                try {
                    await client.groupUpdateDescription(m.chat, newText);
                    await m.reply('◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Group description updated! Time to flex that new vibe! 🔥\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈', {
                        contextInfo: {
                            externalAdReply: {
                                title: `🄴🄻🄾🄽-🄼🄳`,
                                body: `Group Update`,
                                previewType: "PHOTO",
                                thumbnail: pict,
                                sourceUrl: 'https://github.com/elondrex/Elon-MD'
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error updating group description:', error);
                    await m.reply('◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Couldn’t update the description. Blame WhatsApp’s nonsense! 😬\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈');
                }
                break;

            case 'setgrouprestrict':
                const action = newText.toLowerCase();
                if (!['on', 'off'].includes(action)) return m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Usage: ${prefix}setgrouprestrict <on|off>\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`);

                try {
                    const restrict = action === 'on';
                    await client.groupSettingUpdate(m.chat, restrict ? 'locked' : 'unlocked');
                    await m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Group editing is now ${restrict ? 'locked to admins only' : 'open to all members'}! Keep it toxic! 😎\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`, {
                        contextInfo: {
                            externalAdReply: {
                                title: `🄴🄻🄾🄽-🄼🄳`,
                                body: `Group Update`,
                                previewType: "PHOTO",
                                thumbnail: pict,
                                sourceUrl: 'https://github.com/elondrex/Elon-MD'
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error updating group settings:', error);
                    await m.reply('◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Failed to update group settings.\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈');
                }
                break;

            default:
                await m.reply(`◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n❒ Invalid groupmeta command! Use ${prefix}setgroupname, ${prefix}setgroupdesc, or ${prefix}setgrouprestrict\n◈┈┈┈┈┈┈┈┈┈┈┈┈◈`);
        }
    });
};