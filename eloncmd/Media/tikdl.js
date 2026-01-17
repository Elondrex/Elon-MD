const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    try {
        if (!text) return m.reply("Please provide a TikTok link.");
        if (!text.includes("tiktok.com")) return m.reply("That doesn’t look like a valid TikTok link.");

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const encodedUrl = encodeURIComponent(text);
        const response = await fetch(`https://api.privatezia.biz.id/api/downloader/alldownload?url=${encodedUrl}`);
        const data = await response.json();

        if (!data?.status || !data?.result?.video?.url) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("TikTok download failed. The link may be invalid or unsupported.");
        }

        const videoUrl = data.result.video.url;
        const videoResponse = await fetch(videoUrl);
        const arrayBuffer = await videoResponse.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: "🥀\n—\n🄴🄻🄾🄽-🄼🄳"
        }, { quoted: m });

    } catch (error) {
        console.error("TikTok error:", error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`TikTok download failed. Please try again later.\nError: ${error.message}`);
    }
};