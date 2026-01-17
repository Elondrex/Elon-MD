const axios = require("axios");
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

const { HEROKU_API_KEY, HEROKU_APP_NAME } = process.env;

module.exports = async (context) => {
    const { client, m } = context;

    const formatStylishReply = (message) => {
        return (
            `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
            `┋❒ ${message}\n` +
            `╰┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
            `> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`
        );
    };

    await ownerMiddleware(context, async () => {
        await client.sendMessage(m.chat, { react: { text: '🚀', key: m.key } });

        try {
            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                return await client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
                            "⚠️ Heroku API key or App Name is missing.\n" +
                            "Please configure *HEROKU_API_KEY* and *HEROKU_APP_NAME* properly before updating."
                        ),
                    },
                    { quoted: m }
                );
            }

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        "🔄 Triggering update now.\n" +
                        "The bot will restart automatically once the update is complete."
                    ),
                },
                { quoted: m }
            );

            await axios.post(
                `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
                {
                    source_blob: {
                        url: "https://github.com/elondrex/Elon-MD/tarball/main",
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${HEROKU_API_KEY}`,
                        Accept: "application/vnd.heroku+json; version=3",
                        "Content-Type": "application/json",
                    },
                }
            );

            return await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        "✅ Update triggered successfully.\n" +
                        "Please wait while 🄴🄻🄾🄽-🄼🄳 restarts with the latest updates."
                    ),
                },
                { quoted: m }
            );

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;

            let msg;

            if (errorMessage.includes("API key")) {
                msg =
                    "❌ Invalid Heroku API key.\n" +
                    "Please verify your *HEROKU_API_KEY* and try again.";
            } else if (errorMessage.includes("not found")) {
                msg =
                    "❌ Heroku app not found.\n" +
                    "Please check that *HEROKU_APP_NAME* is correct.";
            } else {
                msg = `❌ Update failed:\n${errorMessage}\nPlease try again.`;
            }

            await client.sendMessage(
                m.chat,
                { text: formatStylishReply(msg) },
                { quoted: m }
            );
        }
    });
};