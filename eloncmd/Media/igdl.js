const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    try {
        if (!text) return m.reply("Please provide an Instagram link to download.");
        if (!text.includes("instagram.com")) return m.reply("That doesn't look like a valid Instagram link.");

        // React with hourglass while processing
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const encodedUrl = encodeURIComponent(text);
        const apiUrl = `https://api.fikmydomainsz.xyz/download/instagram?url=${encodedUrl}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data?.status || !data?.result?.[0]?.url_download) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("Instagram download failed. The post may be private or the link is invalid.");
        }

        const igVideoUrl = data.result[0].url_download;

        // React with checkmark on success
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        // Send the video
        await client.sendMessage(m.chat, {
            video: { url: igVideoUrl },
            mimetype: "video/mp4",
            caption: "🄴🄻🄾🄽-🄼🄳",
            gifPlayback: false,
        }, { quoted: m });

    } catch (error) {
        console.error("Instagram error:", error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`Instagram download failed. Please check your link and try again.\nError: ${error.message}`);
    }
};