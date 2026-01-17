const fetch = require('node-fetch');
const FormData = require('form-data');

async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
    });

    const text = await response.text();
    if (!text.includes('catbox')) {
        throw new Error('UPLOAD FAILED');
    }

    return text;
}

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    if (!botname) {
        return m.reply(`The bot does not have a name set. Please contact the developer.`);
    }

    if (!text && !m.quoted && !(m.mtype === 'imageMessage' && m.body.includes('.remini'))) {
        return m.reply(`Please provide an image either by replying to it or by sending a direct URL.\nExample: .remini https://image.com/photo.png`);
    }

    let imageUrl = text;

    // If user replied to an image
    if ((!text || text === '.remini') && m.quoted && m.quoted.mtype === 'imageMessage') {
        try {
            const buffer = await client.downloadMediaMessage(m.quoted);
            imageUrl = await uploadToCatbox(buffer);
        } catch (uploadError) {
            console.error(`Failed to upload image: ${uploadError.message}`);
            return m.reply(`Failed to upload the image. Please try again.`);
        }
    }

    // If user sent an image directly with the command
    if (m.mtype === 'imageMessage' && m.body.includes('.remini')) {
        try {
            const buffer = await client.downloadMediaMessage(m);
            imageUrl = await uploadToCatbox(buffer);
        } catch (uploadError) {
            console.error(`Failed to upload image: ${uploadError.message}`);
            return m.reply(`Failed to upload the image. Please try again.`);
        }
    }

    if (!imageUrl || imageUrl === '.remini') {
        return m.reply(`No valid image provided. Please reply to an image or provide a valid URL.`);
    }

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.elrayyxml.web.id/api/tools/remini?url=${encodedUrl}`;

        const response = await fetch(apiUrl, {
            timeout: 30000,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*'
            }
        });

        if (!response.ok) {
            throw new Error(`The API returned a status: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('image')) {
            throw new Error(`The API did not return an image. Received: ${contentType}`);
        }

        const imageBuffer = await response.buffer();

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await client.sendMessage(
            m.chat,
            {
                image: imageBuffer,
                caption: `Here's your enhanced image.\n—\n©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(`Remini error: ${error.message}`);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`Failed to enhance the image.\nError: ${error.message}`);
    }
};