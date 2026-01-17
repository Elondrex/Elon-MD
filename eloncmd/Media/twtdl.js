const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    const formatStylishReply = (message) => {
        return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈\n> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`;
    };

    const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`API failed with status ${response.status}`);
                }
                return response;
            } catch (error) {
                if (attempt === retries || error.type !== "request-timeout") {
                    throw error;
                }
                console.error(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    if (!text) {
        return m.reply(
            formatStylishReply(
                "Please provide a Twitter/X video link.\nExample: .twitterdl https://x.com/user/status/123"
            )
        );
    }

    if (!text.includes("twitter.com") && !text.includes("x.com")) {
        return m.reply(
            formatStylishReply(
                "That doesn’t appear to be a valid Twitter/X link. Please check and try again."
            )
        );
    }

    try {
        const encodedUrl = encodeURIComponent(text);
        const response = await fetchWithRetry(
            `https://api.privatezia.biz.id/api/downloader/alldownload?url=${encodedUrl}`,
            { headers: { Accept: "application/json" }, timeout: 15000 }
        );

        const data = await response.json();

        if (!data?.status || !data?.result?.video?.url) {
            return m.reply(
                formatStylishReply(
                    "No video was found for this link. It may be unavailable or unsupported."
                )
            );
        }

        const twtvid = data.result.video.url;
        const title = data.result.title || "No title available";

        const videoResponse = await fetchWithRetry(twtvid, { timeout: 15000 });
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video (HTTP ${videoResponse.status})`);
        }

        const arrayBuffer = await videoResponse.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);

        await client.sendMessage(
            m.chat,
            {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: formatStylishReply(
                    `🎥 Twitter/X Video\n\n📌 *Title:* ${title}`
                ),
                gifPlayback: false,
            },
            { quoted: m }
        );
    } catch (e) {
        console.error("Twitter/X download error:", e);
        m.reply(
            formatStylishReply(
                `An error occurred while processing the request.\nDetails: ${e.message}`
            )
        );
    }
};