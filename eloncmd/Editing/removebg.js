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

module.exports = {
    name: 'removebg',
    aliases: ['nobg', 'rmbg', 'transparent'],
    description: 'Removes background from images using AI',
    run: async (context) => {
        const { client, m, mime } = context;

        // Send ⌛ reaction
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const quoted = m.quoted ? m.quoted : m;
        const quotedMime = quoted.mimetype || mime || '';

        if (!/image/.test(quotedMime)) {
            return client.sendMessage(
                m.chat,
                {
                    text: 'Please reply to a valid image file to use this command.',
                    mentions: [m.sender],
                },
                { quoted: m }
            );
        }

        const loadingMsg = await client.sendMessage(
            m.chat,
            {
                text: 'Removing background... This may take a moment.',
            },
            { quoted: m }
        );

        try {
            const media = await quoted.download();
            if (!media) {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
                return client.sendMessage(
                    m.chat,
                    {
                        text: 'Failed to download the image. Please try again.',
                    },
                    { quoted: m }
                );
            }

            if (media.length > 10 * 1024 * 1024) {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
                return client.sendMessage(
                    m.chat,
                    {
                        text: 'The image exceeds the 10MB size limit.',
                    },
                    { quoted: m }
                );
            }

            const imageUrl = await uploadToCatbox(media);
            const encodedUrl = encodeURIComponent(imageUrl);
            const removeBgApiUrl = `https://api.ootaizumi.web.id/tools/removebg?imageUrl=${encodedUrl}`;

            const response = await axios.get(removeBgApiUrl, {
                headers: {
                    accept: 'application/json',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: 60000,
            });

            if (!response.data.status || !response.data.result) {
                throw new Error('The AI was unable to process the image.');
            }

            const transparentImageUrl = response.data.result;
            const transparentResponse = await axios.get(transparentImageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
            });

            const transparentImage = Buffer.from(transparentResponse.data);

            // Delete loading message
            await client.sendMessage(m.chat, { delete: loadingMsg.key });

            // Send ✅ reaction
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await client.sendMessage(
                m.chat,
                {
                    image: transparentImage,
                    caption:
                        'Background successfully removed.\n\n—\n*©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳*',
                },
                { quoted: m }
            );

            if (transparentResponse.headers['content-type']?.includes('png')) {
                await client.sendMessage(
                    m.chat,
                    {
                        document: transparentImage,
                        mimetype: 'image/png',
                        fileName: `transparent_bg_${Date.now()}.png`,
                        caption:
                            'PNG version for higher quality.\n\n—\n*©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳*',
                    },
                    { quoted: m }
                );
            }
        } catch (err) {
            console.error('RemoveBG error:', err);

            // Try to delete loading message
            try {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
            } catch (e) {}

            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let errorMessage = 'An unexpected error occurred.';

            if (err.message.includes('timeout')) {
                errorMessage =
                    'Processing took too long. The image may be complex or the server is busy.';
            } else if (err.message.includes('Network Error')) {
                errorMessage =
                    'A network error occurred. Please check your internet connection.';
            } else if (err.message.includes('Upload process failed')) {
                errorMessage = 'Failed to upload the image for processing.';
            } else if (err.message.includes('AI was unable')) {
                errorMessage =
                    'The AI could not process this image. Please try a clearer image.';
            } else if (err.message.includes('ENOTFOUND')) {
                errorMessage =
                    'Unable to connect to the background removal service.';
            } else {
                errorMessage = err.message;
            }

            await client.sendMessage(
                m.chat,
                {
                    text:
                        `❌ Background removal failed.\n\n` +
                        `*Error:* ${errorMessage}\n\n` +
                        `*Suggestions:*\n` +
                        `• Use clear, high-contrast images\n` +
                        `• Ensure the subject has defined edges\n` +
                        `• Try a simpler composition\n` +
                        `• Check your internet connection`,
                },
                { quoted: m }
            );
        }
    },
};