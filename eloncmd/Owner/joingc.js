const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, args, Owner, botname } = context;

        // Basic context checks with line-styled replies
        if (!botname) {
            console.error(`Join-Error: botname missing in context.`);
            return m.reply(
                `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Bot configuration error: bot name is missing. Please contact the developer.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`
            );
        }

        if (!Owner) {
            console.error(`Join-Error: Owner missing in context.`);
            return m.reply(
                `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Bot configuration error: owner information is missing. Please contact the developer.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`
            );
        }

        // Accept link from: command arg, replied message, or raw text anywhere
        let raw = (text && text.trim()) || (m.quoted && ((m.quoted.text) || (m.quoted && m.quoted.caption))) || "";
        raw = String(raw || "").trim();

        if (!raw) {
            return m.reply(
                `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ Please provide a valid group invite link or reply to one.\n│❒ Example: *${args && args[0] ? args[0] : '.join https://chat.whatsapp.com/abcdef...'}*\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`
            );
        }

        // Extract invite code robustly (supports full URL or plain code)
        const urlRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i;
        const match = raw.match(urlRegex);
        let inviteCode = match ? match[1] : null;

        // If no URL, maybe user sent only the code
        if (!inviteCode) {
            const token = raw.split(/\s+/)[0];
            if (/^[A-Za-z0-9_-]{8,}$/.test(token)) {
                inviteCode = token;
            }
        }

        if (!inviteCode) {
            return m.reply(
                `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ That doesn’t appear to be a valid group link or invite code. Please check and try again.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`
            );
        }

        inviteCode = inviteCode.replace(/\?.*$/, '').trim();

        try {
            const info = await client.groupGetInviteInfo(inviteCode);
            const subject = info?.subject || info?.groupMetadata?.subject || "Unknown Group";

            await client.groupAcceptInvite(inviteCode);

            return m.reply(
                `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ✅ Joined: *${subject}*\n│❒ Please follow the group rules. — ${botname}\n╰┈┈┈┈━━━━━━┈┈┈┈◈`
            );
        } catch (error) {
            console.error(`[JOIN-ERROR] invite=${inviteCode}`, error && (error.stack || error));

            const status =
                (error && error.output && error.output.statusCode) ||
                error?.statusCode ||
                error?.status ||
                (error?.data && (error.data.status || error.data)) ||
                (error?.response && error.response.status) ||
                null;

            if (status === 400 || status === 404) {
                return m.reply(
                    `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ ❌ The group does not exist or the invite link is invalid.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`
                );
            }
            if (status === 401) {
                return m.reply(
                    `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ 🚫 I was previously removed from this group and cannot rejoin using this link.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`
                );
            }
            if (status === 409) {
                return m.reply(
                    `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ ℹ️ I am already a member of this group.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`
                );
            }
            if (status === 410) {
                return m.reply(
                    `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ 🔄 This invite link has expired. Please request a new one.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`
                );
            }
            if (status === 403) {
                return m.reply(
                    `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ 🔒 I do not have permission to join this group.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`
                );
            }
            if (status === 500) {
                return m.reply(
                    `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ 📛 The group may be full or a server error occurred. Please try again later.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`
                );
            }

            const shortMsg =
                (error && (error.message || (typeof error === 'string' ? error : 'Unknown error'))) ||
                'Unknown error';

            return m.reply(
                `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ❌ Failed to join the group: ${shortMsg}\n│❒ Please verify the link and try again.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`
            );
        }
    });
};