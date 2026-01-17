// Wetglass.js
const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text) return m.reply("Please type some text to generate the wet glass effect.");
    if (text.length > 50) return m.reply("Text is too long. Please use 50 characters or fewer.");

    try {
        // React with hourglass while processing
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const url = `https://api.nekolabs.web.id/canvas/ephoto/text-on-wet-glass?text=${encodeURIComponent(text.trim())}`;
        const response = await fetch(url);

        if (!response.ok) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("There was an issue with the API. Please try again later.");
        }

        const buffer = await response.buffer();

        // React with checkmark on success
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        // Send the resulting image
        await client.sendMessage(m.chat, {
            image: buffer,
            caption: "🖼️ Wet Glass Text Effect"
        }, { quoted: m });

    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply("An error occurred while generating the wet glass text. Please try again.");
    }
};