const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    const { client, m, prefix, pict, botname } = context;

    if (!botname) {
        console.error(`Botname not set.`);
        return m.reply(
            `◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n` +
            `│❒ Bot is not configured. No botname found in context.\n` +
            `◈┈┈┈┈┈┈┈┈┈┈┈┈◈`
        );
    }

    if (!pict) {
        console.error(`No image provided.`);
        return m.reply(
            `◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n` +
            `│❒ No image to send. Please provide an image in context.\n` +
            `◈┈┈┈┈┈┈┈┈┈┈┈┈◈`
        );
    }

    try {
        const caption = 
            `◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n` +
            `│❒ Hello ${m.pushName}, *${botname}* is online and ready!\n` +
            `│❒ Type *${prefix}menu* to see available commands.\n` +
            `◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n` +
            `│❒ Powered by *elondrex*`;

        // Handle pict input
        let imageOptions;
        if (Buffer.isBuffer(pict)) {
            console.log(`[ALIVE-DEBUG] pict is a Buffer, saving to temp file`);
            const tempImagePath = path.join(__dirname, 'temp_alive_image.jpg');
            fs.writeFileSync(tempImagePath, pict);
            imageOptions = { url: tempImagePath };
        } else if (typeof pict === 'string') {
            console.log(`[ALIVE-DEBUG] pict is a string: ${pict}`);
            if (pict.startsWith('http://') || pict.startsWith('https://') || fs.existsSync(pict)) {
                imageOptions = { url: pict };
            } else {
                throw new Error(`Invalid image path or URL: ${pict}`);
            }
        } else {
            throw new Error(`Unsupported pict type: ${typeof pict}`);
        }

        // Send the image with caption
        await client.sendMessage(
            m.chat,
            { image: imageOptions, caption: caption, mentions: [m.sender] },
            { quoted: m }
        );

        // Clean up temp image if created
        if (imageOptions.url.startsWith(__dirname)) {
            try {
                fs.unlinkSync(imageOptions.url);
                console.log(`[ALIVE-DEBUG] Cleaned up temp image: ${imageOptions.url}`);
            } catch (err) {
                console.error(`[ALIVE-ERROR] Failed to clean up temp image: ${err.stack}`);
            }
        }

    } catch (error) {
        console.error(`[ALIVE-ERROR] ALIVE command crashed: ${error.stack}`);
        await m.reply(
            `◈┈┈┈┈┈┈┈┈┈┈┈┈◈\n` +
            `│❒ An error occurred while processing the command.\n` +
            `│❒ Error: ${error.message}\n` +
            `◈┈┈┈┈┈┈┈┈┈┈┈┈◈`
        );
    }
};