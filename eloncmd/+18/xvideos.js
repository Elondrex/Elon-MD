const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text) return m.reply("Please enter a search term.");
    if (text.length > 150) return m.reply("Please keep your input under 150 characters.");

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const searchQuery = encodeURIComponent(text.trim());
        const searchResponse = await fetch(
            `https://api.nekolabs.web.id/discovery/xvideos/search?q=${searchQuery}`
        );
        const searchData = await searchResponse.json();

        if (!searchData.success || !searchData.result || searchData.result.length === 0) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`No results found for "${text}". Try using different keywords.`);
        }

        const firstVideo = searchData.result[0];
        const videoPageUrl = firstVideo.url;
        const videoTitle = firstVideo.title || "Untitled Video";
        const duration = firstVideo.duration || "Unknown";
        const cleanTitle = `(${videoTitle.replace(/[^a-zA-Z0-9]/g, "_")})_${duration.replace(/[^a-zA-Z0-9]/g, "")}`;

        const encodedVideoUrl = encodeURIComponent(videoPageUrl);
        const downloadResponse = await fetch(
            `https://api.nekolabs.web.id/downloader/xvideos?url=${encodedVideoUrl}`
        );
        const downloadData = await downloadResponse.json();

        if (!downloadData.success || !downloadData.result || !downloadData.result.videos) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("The video was found, but it could not be downloaded at the moment.");
        }

        let videoDownloadUrl =
            downloadData.result.videos.high || downloadData.result.videos.low;

        if (!videoDownloadUrl) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("No compatible MP4 version is available for this video.");
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(
            m.chat,
            {
                video: { url: videoDownloadUrl },
                mimetype: "video/mp4",
                fileName: `${cleanTitle}.mp4`,
                caption: `*${videoTitle}*\n⏱ ${duration}`,
                contextInfo: {
                    externalAdReply: {
                        title:
                            videoTitle.length > 80
                                ? videoTitle.substring(0, 77) + "..."
                                : videoTitle,
                        body: "Video Preview",
                        thumbnailUrl: downloadData.result.thumb || firstVideo.cover,
                        sourceUrl: videoPageUrl,
                        mediaType: 2,
                        renderLargerThumbnail: true,
                    },
                },
            },
            { quoted: m }
        );
    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply("An unexpected error occurred. Please try again later.");
    }
};
