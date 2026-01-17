const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        { headers: form.getHeaders() }
    );

    if (!response.data || !response.data.includes('catbox')) {
        throw new Error('Upload Refused');
    }

    return response.data;
}

module.exports = async (context) => {
    const { client, m } = context;

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const quoted = m.quoted ? m.quoted : m;
        const quotedMime = quoted.mimetype || '';

        if (!/image/.test(quotedMime)) {
            return m.reply(
                'The replied message is not an image. Please quote a valid image.'
            );
        }

        const media = await quoted.download();
        if (!media) {
            return m.reply(
                'Failed to download the image. Please try sending it again.'
            );
        }

        if (media.length > 10 * 1024 * 1024) {
            return m.reply(
                'The image is too large. The maximum allowed size is 10MB.'
            );
        }

        const imageUrl = await uploadToCatbox(media);
        const apiURL = `https://api.fikmydomainsz.xyz/imagecreator/tofigur?url=${encodeURIComponent(
            imageUrl
        )}`;

        const response = await axios.get(apiURL);

        if (!response.data || !response.data.status || !response.data.result) {
            throw new Error('Invalid response from the image processing service.');
        }

        const resultUrl = response.data.result;
        const figureBuffer = (
            await axios.get(resultUrl, { responseType: 'arraybuffer' })
        ).data;

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(
            m.chat,
            {
                image: Buffer.from(figureBuffer),
                caption:
                    'Image successfully converted to a figure.\n—\n🄴🄻🄾🄽-🄼🄳',
            },
            { quoted: m }
        );
    } catch (err) {
        console.error('tofigur error:', err);

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        let userMessage = 'The image processing failed.';

        if (err.message.includes('timeout')) {
            userMessage =
                'The request took too long. Please try again later.';
        } else if (err.message.includes('Network Error')) {
            userMessage =
                'A network error occurred. Please check your internet connection.';
        } else if (err.message.includes('Upload Refused')) {
            userMessage =
                'The image could not be uploaded. Please try again.';
        } else if (err.message.includes('Invalid response')) {
            userMessage =
                'The image service returned an invalid response.';
        }

        await m.reply(`${userMessage}\nError: ${err.message}`);
    }
};