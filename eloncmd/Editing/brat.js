const fetch = require('node-fetch');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    name: 'brat',
    aliases: ['bratsticker', 'brattext'],
    description: 'Creates a brat-style text sticker',
    run: async (context) => {
        const { client, m, prefix } = context;

        const text = m.body
            .replace(new RegExp(`^${prefix}(brat|bratsticker|brattext)\\s*`, 'i'), '')
            .trim();

        if (!text) {
            return client.sendMessage(
                m.chat,
                {
                    text: `╭┈┈┈┈━━━━━━┈┈┈┈◈
┋❒ Hey @${m.sender.split('@')[0]}, you forgot to include the text.
┋❒ Example: ${prefix}brat Hello world
╰┈┈┈┈━━━━━━┈┈┈┈◈◈`,
                    mentions: [m.sender],
                },
                { quoted: m }
            );
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            const apiUrl = `https://api.nekolabs.web.id/canvas/brat/v1?text=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());

            const sticker = new Sticker(buffer, {
                pack: 'Brat Stickers',
                author: '🄴🄻🄾🄽-🄼🄳',
                type: StickerTypes.FULL,
                categories: ['😤', '🤡'],
                quality: 50,
                background: 'transparent',
            });

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await client.sendMessage(m.chat, await sticker.toMessage(), { quoted: m });
        } catch (error) {
            console.error('Brat command error:', error);

            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

            let errorMessage = 'Failed to generate the sticker.';

            if (error.message.includes('status')) {
                errorMessage = 'The API is currently unavailable. Please try again later.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Network error detected. Please check your connection.';
            } else {
                errorMessage = `Error details: ${error.message}`;
            }

            await client.sendMessage(
                m.chat,
                {
                    text: `╭┈┈┈┈━━━━━━┈┈┈┈◈◈
┋❒ Brat sticker creation failed.
┋❒ ${errorMessage}
╰┈┈┈┈━━━━━━┈┈┈┈◈◈`,
                },
                { quoted: m }
            );
        }
    },
};
