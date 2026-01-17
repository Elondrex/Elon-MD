const axios = require("axios");
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

const { HEROKU_API_KEY, HEROKU_APP_NAME } = process.env;

module.exports = async (context) => {
    const { client, m, prefix } = context;

    const formatStylishReply = (message) => {
        return (
            `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
            `┋❒ ${message}\n` +
            `╰┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
            `> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`
        );
    };

    await ownerMiddleware(context, async () => {
        await client.sendMessage(m.chat, { react: { text: '🔂', key: m.key } });

        try {
            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                return await client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
                            "⚠️ Missing Heroku configuration.\n" +
                            "Please set *HEROKU_API_KEY* and *HEROKU_APP_NAME* before checking updates."
                        ),
                    },
                    { quoted: m }
                );
            }

            // Get latest commit from GitHub
            const githubRes = await axios.get(
                "https://api.github.com/repos/elondrex/Elon-MD/commits/main"
            );
            const latestCommit = githubRes.data;
            const latestSha = latestCommit.sha;

            // Get last Heroku build
            const herokuRes = await axios.get(
                `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
                {
                    headers: {
                        Authorization: `Bearer ${HEROKU_API_KEY}`,
                        Accept: "application/vnd.heroku+json; version=3",
                    },
                }
            );

            const lastBuild = herokuRes.data[0];
            const deployedSha = lastBuild?.source_blob?.url || "";
            const alreadyDeployed = deployedSha.includes(latestSha);

            if (alreadyDeployed) {
                const msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        interactiveMessage: {
                            body: { text: "Your bot is already on the latest version." },
                            footer: { text: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳" },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "Options",
                                            sections: [
                                                {
                                                    rows: [
                                                        { title: "📱 Menu", description: "Get command list", id: `${prefix}menu` },
                                                        { title: "⚙ Settings", description: "Bot settings", id: `${prefix}settings` },
                                                    ],
                                                },
                                            ],
                                        }),
                                    },
                                ],
                            },
                        },
                    },
                    { quoted: m }
                );

                return await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            }

            // Update available
            const msg = generateWAMessageFromContent(
                m.chat,
                {
                    interactiveMessage: {
                        body: {
                            text: `🆕 Update Available!\n\nA new version is available.\n\n📌 *Commit:* ${latestCommit.commit.message}\n👤 *Author:* ${latestCommit.commit.author.name}\n🕒 *Date:* ${new Date(latestCommit.commit.author.date).toLocaleString()}\n\nTap the button below to update your bot or type ${prefix}triggerupdate.`
                        },
                        footer: { text: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "Update Options",
                                        sections: [
                                            {
                                                title: "Actions",
                                                rows: [
                                                    { title: "🚀 Trigger Update", description: "Update now", id: `${prefix}triggerupdate` },
                                                    { title: "📱 Menu", description: "Back to command list", id: `${prefix}menu` },
                                                ],
                                            },
                                        ],
                                    }),
                                },
                            ],
                        },
                    },
                },
                { quoted: m }
            );

            await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;

            let msg;

            if (errorMessage.includes("API key")) {
                msg = "❌ Invalid Heroku API key. Please check your configuration and try again.";
            } else if (errorMessage.includes("not found")) {
                msg = "❌ Heroku app not found. Ensure *HEROKU_APP_NAME* is correct.";
            } else {
                msg = `❌ Update check failed:\n${errorMessage}\nPlease try again.`;
            }

            await client.sendMessage(
                m.chat,
                { text: formatStylishReply(msg) },
                { quoted: m }
            );
        }
    });
};