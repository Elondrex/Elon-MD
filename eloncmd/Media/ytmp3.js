const fetch = require("node-fetch");
const ytdl = require("ytdl-core");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    if (!botname)
        return m.reply("Bot name is not configured. Please contact the developer.");

    if (!text)
        return m.reply(`Please provide a YouTube link, ${m.pushName}.`);

    const urls = text.match(
        /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?[a-zA-Z0-9_-]{11})/gi
    );

    if (!urls)
        return m.reply("That does not appear to be a valid YouTube link. Please check and try again.");

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const encodedUrl = encodeURIComponent(text);
        const response = await fetch(
            `https://api-faa.my.id/faa/ytmp3?url=${encodedUrl}`,
            {
                timeout: 15000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "application/json"
                }
            }
        );

        if (!response.ok)
            throw new Error(`API responded with ${response.status} ${response.statusText}`);

        const data = await response.json();

        if (!data.status || !data.result || !data.result.mp3)
            throw new Error("API returned no valid audio data.");

        const title = data.result.title || "Untitled";
        const audioUrl = data.result.mp3;
        const mimeType = "audio/mpeg";

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(
            m.chat,
            { audio: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: mimeType },
            { quoted: m }
        );

        await client.sendMessage(
            m.chat,
            { document: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: mimeType },
            { quoted: m }
        );

    } catch (error) {
        console.error("ytmp3 error:", error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        try {
            const info = await ytdl.getInfo(text);
            const format = ytdl.chooseFormat(info.formats, {
                filter: "audioonly",
                quality: "highestaudio"
            });

            const audioUrl = format.url;
            const title = info.videoDetails.title;
            const mimeType = "audio/mpeg";

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await client.sendMessage(
                m.chat,
                { audio: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: mimeType },
                { quoted: m }
            );

            await client.sendMessage(
                m.chat,
                { document: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: mimeType },
                { quoted: m }
            );

        } catch (fallbackError) {
            console.error("Fallback error:", fallbackError);
            await m.reply(
                `Both download methods failed. Please try again later.\nError: ${fallbackError.message}`
            );
        }
    }
};