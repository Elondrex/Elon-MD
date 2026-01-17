const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
    });

    if (!response.data || !response.data.includes('catbox')) {
        throw new Error('Upload process failed');
    }

    return response.data;
}

module.exports = async (context) => {
    const { client, m, text } = context;
    let loadingMsg;

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        if (!m.quoted) {
            return m.reply("Please reply to an image you want to analyze.");
        }

        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime.startsWith("image/")) {
            return m.reply("The message you replied to is not an image. Please provide a valid image.");
        }

        const mediaBuffer = await q.download();
        if (!mediaBuffer) {
            return m.reply("Failed to download the image. Please try again.");
        }

        const prompt = text ? text : "Describe this image.";

        loadingMsg = await m.reply(`Analyzing your image with prompt: "${prompt}"...`);

        const uploadedURL = await uploadToCatbox(mediaBuffer);

        const api = `https://api.ootaizumi.web.id/ai/gptnano?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(uploadedURL)}`;
        const result = await axios.get(api);

        if (loadingMsg) {
            await client.sendMessage(m.chat, { delete: loadingMsg.key });
        }

        if (result.data?.result) {
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            return client.sendMessage(
                m.chat,
                {
                    text: `🔍 *Image Analysis Results*\n\n*Prompt Used:* ${prompt}\n\n*Analysis:*\n${result.data.result}\n\n—\n*©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳*`,
                },
                { quoted: m }
            );
        }

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply("The AI could not provide an analysis for this image. Please try a different image or prompt.");

    } catch (err) {
        console.error('Image analysis error:', err);

        try {
            if (loadingMsg) await client.sendMessage(m.chat, { delete: loadingMsg.key });
        } catch (e) {}

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`Image analysis failed. Error: ${err.message}`);
    }
};