const yts = require("yt-search");
const axios = require("axios");

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text) return m.reply("Please provide a song name.");
    if (text.length > 100) return m.reply("The song title is too long. Please keep it under 100 characters.");

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
        
        const searchQuery = `${text} official`;
        const searchResult = await yts(searchQuery);
        const video = searchResult.videos[0];
        if (!video) return m.reply(`No results found for "${text}". Please try a different song.`);

        const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl);
        const apiData = response.data;

        if (!apiData.status || !apiData.result || !apiData.result.downloadUrl) {
            throw new Error("Audio service did not return a valid download link.");
        }

        const audioUrl = apiData.result.downloadUrl;
        const title = apiData.result.title || "Untitled";
        const artist = video.author.name || "Unknown Artist";

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title.substring(0, 100)}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: `${artist} | 🄴🄻🄾🄽-🄼🄳`,
                    thumbnailUrl: apiData.result.thumbnail || video.thumbnail,
                    sourceUrl: video.url,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });

    } catch (error) {
        console.error(`Play error:`, error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        let userMessage = 'Audio download failed. Please try again later.';
        if (error.message.includes('Audio service')) {
            userMessage = 'The audio service could not process this request.';
        }
        if (error.message.includes('timeout')) {
            userMessage = 'The request timed out. Please try again.';
        }

        await m.reply(`${userMessage}\nError: ${error.message}`);
    }
};