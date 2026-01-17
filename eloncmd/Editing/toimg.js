const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'sticker.webp' });

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

module.exports = {
    name: 'toimg',
    aliases: ['toimage', 'stickertoimg', 'sticker'],
    description: 'Converts stickers to images',
    run: async (context) => {
        const { client, m } = context;

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            if (!m.quoted) {
                return m.reply(
                    'Please reply to a sticker to use this command.'
                );
            }

            const quotedMime = m.quoted.mimetype || '';
            if (!/webp/.test(quotedMime)) {
                return m.reply(
                    'The replied message is not a sticker. Please quote a valid .webp sticker.'
                );
            }

            const stickerBuffer = await m.quoted.download();
            if (!stickerBuffer) {
                return m.reply(
                    'Failed to download the sticker. Please try again.'
                );
            }

            const stickerUrl = await uploadToCatbox(stickerBuffer);
            const encodedUrl = encodeURIComponent(stickerUrl);
            const convertApiUrl = `https://api.elrayyxml.web.id/api/maker/convert?url=${encodedUrl}&format=PNG`;

            const response = await axios.get(convertApiUrl, {
                headers: {
                    accept: 'application/json',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: 30000,
            });

            if (!response.data.status || !response.data.result) {
                throw new Error(
                    'The conversion service returned an invalid response.'
                );
            }

            const imageUrl = response.data.result;
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 20000,
            });

            const imageBuffer = Buffer.from(imageResponse.data);

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await client.sendMessage(
                m.chat,
                {
                    image: imageBuffer,
                    caption:
                        'Sticker successfully converted to an image.\n—\n🄴🄻🄾🄽-🄼🄳',
                },
                { quoted: m }
            );

            await client.sendMessage(
                m.chat,
                {
                    document: imageBuffer,
                    mimetype: 'image/png',
                    fileName: `sticker_${Date.now()}.png`,
                    caption:
                        'PNG version for better quality.\n—\n🄴🄻🄾🄽-🄼🄳',
                },
                { quoted: m }
            );
        } catch (err) {
            console.error('ToImg error:', err);

            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let userMessage = 'Sticker conversion failed.';

            if (err.message.includes('timeout')) {
                userMessage =
                    'The conversion took too long. Please try again later.';
            } else if (err.message.includes('Network Error')) {
                userMessage =
                    'A network error occurred. Please check your connection.';
            } else if (err.message.includes('Upload Refused')) {
                userMessage =
                    'Failed to upload the sticker. Please try again.';
            } else if (err.message.includes('invalid response')) {
                userMessage =
                    'The conversion service could not process the sticker.';
            }

            await m.reply(`${userMessage}\nError: ${err.message}`);
        }
    },
};