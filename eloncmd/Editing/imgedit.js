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
    const { client, m, text } = context;

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        if (!m.quoted) {
            return m.reply('Please reply to an image to use this command.');
        }

        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        if (!mime.startsWith('image/')) {
            return m.reply('The replied message is not an image.');
        }

        const prompt = text ? text : 'add a text stating idk';
        const mediaBuffer = await q.download();
        const uploadedUrl = await uploadToCatbox(mediaBuffer);

        const apiUrl = `https://api-faa.my.id/faa/editfoto?url=${encodeURIComponent(
            uploadedUrl
        )}&prompt=${encodeURIComponent(prompt)}`;

        const editResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(
            m.chat,
            {
                image: Buffer.from(editResponse.data),
                caption: `Image processed successfully.\nPrompt: ${prompt}\n—\n🄴🄻🄾🄽-🄼🄳`,
            },
            { quoted: m }
        );
    } catch (error) {
        console.error('imgedit error:', error);

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        let userMessage = 'The image editing process failed.';

        if (error.message.includes('timeout')) {
            userMessage = 'The request took too long. Please try again.';
        } else if (error.message.includes('Network Error')) {
            userMessage = 'A network error occurred. Please check your connection.';
        } else if (error.message.includes('Upload Refused')) {
            userMessage = 'The image upload was rejected.';
        }

        await m.reply(`${userMessage}\nError: ${error.message}`);
    }
};