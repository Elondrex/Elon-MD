const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'sticker.webp' });
    const response = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
    if (!response.data || !response.data.includes('catbox')) throw new Error('Upload Refused');
    return response.data;
}

module.exports = {
    name: 'tomp4',
    aliases: ['tovideo', 'stickertomp4', 'sticker2video'],
    description: 'Converts stickers to MP4 videos',
    run: async (context) => {
        const { client, m, mime } = context;
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            if (!m.quoted)
                return m.reply('Please reply to a sticker to use this command.');

            const quotedMime = m.quoted.mimetype || '';
            if (!/webp/.test(quotedMime))
                return m.reply('The replied message is not a sticker. Please reply to a .webp sticker.');

            const statusMsg = await m.reply('Converting your sticker to a video. Please wait...');

            const stickerBuffer = await m.quoted.download();
            if (!stickerBuffer) {
                await client.sendMessage(m.chat, { delete: statusMsg.key });
                return m.reply('Failed to download the sticker. Please try again.');
            }

            const stickerUrl = await uploadToCatbox(stickerBuffer);
            const encodedUrl = encodeURIComponent(stickerUrl);
            const convertApiUrl = `https://api.elrayyxml.web.id/api/maker/convert?url=${encodedUrl}&format=MP4`;

            const response = await axios.get(convertApiUrl, {
                headers: {
                    'accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 30000
            });

            if (!response.data.status || !response.data.result)
                throw new Error('Conversion service failed');

            const videoUrl = response.data.result;
            const videoResponse = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 20000
            });

            const videoBuffer = Buffer.from(videoResponse.data);

            await client.sendMessage(m.chat, { delete: statusMsg.key });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await client.sendMessage(
                m.chat,
                {
                    video: videoBuffer,
                    caption: 'Your sticker has been successfully converted to a video.\n—\n🄴🄻🄾🄽-🄼🄳'
                },
                { quoted: m }
            );

            await client.sendMessage(
                m.chat,
                {
                    document: videoBuffer,
                    mimetype: 'video/mp4',
                    fileName: `sticker_${Date.now()}.mp4`,
                    caption: 'MP4 document version.\n—\n🄴🄻🄾🄽-🄼🄳'
                },
                { quoted: m }
            );

        } catch (err) {
            console.error('ToMP4 error:', err);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let userMessage = 'The conversion failed. Please try again later.';
            if (err.message.includes('timeout'))
                userMessage = 'The conversion took too long and timed out.';
            if (err.message.includes('Network Error'))
                userMessage = 'A network error occurred. Please check your connection.';
            if (err.message.includes('Upload Refused'))
                userMessage = 'Failed to upload the sticker. Please try another one.';
            if (err.message.includes('Conversion service failed'))
                userMessage = 'The conversion service could not process this sticker.';

            await m.reply(`${userMessage}\nError: ${err.message}`);
        }
    }
};