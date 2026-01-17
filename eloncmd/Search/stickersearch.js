const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  description: 'Fetch GIF stickers from Tenor using your search term',
  run: async (context) => {
    const { client, m, text, botname } = context;

    if (!botname) {
      console.error('Botname not set in context.');
      return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Botname missing! Please check with the developer.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`);
    }

    try {
      // Validate sender
      if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
        console.error(`Invalid sender: ${JSON.stringify(m.sender)}`);
        return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Cannot read your number. Please try again.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`);
      }
      const userNumber = m.sender.split('@')[0];

      // Validate search term
      if (!text) {
        return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Please provide a search term to fetch stickers, @${userNumber}.\n│❒ Example: .sticker happy\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`, { mentions: [m.sender] });
      }

      // Notify in group if needed
      if (m.isGroup) {
        await m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ @${userNumber} requested stickers! Sending them now. 📥\n╰┈┈┈┈━━━━━━┈┈┈┈◈`, { mentions: [m.sender] });
      }

      const tenorApiKey = 'AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c';

      // Fetch GIFs from Tenor
      const gifResponse = await axios.get(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(text)}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`
      );

      const results = gifResponse.data.results;
      if (!results || results.length === 0) {
        return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ No stickers found for "${text}", @${userNumber}. Try a different search term.\n╰┈┈┈┈━━━━━━┈┈┈┈◈`, { mentions: [m.sender] });
      }

      // Send up to 8 stickers
      for (let i = 0; i < Math.min(8, results.length); i++) {
        const gifUrl = results[i].media_formats.gif.url;

        const stickerMess = new Sticker(gifUrl, {
          pack: botname,
          author: 'elondrex ×̷̷͜×̷',
          type: StickerTypes.FULL,
          categories: ['🤩', '🎉'],
          id: `sticker-${i}`,
          quality: 60,
          background: 'transparent'
        });

        const stickerBuffer = await stickerMess.toBuffer();
        await client.sendMessage(m.sender, { sticker: stickerBuffer }, { quoted: m });
      }

    } catch (error) {
      console.error(`Sticker command error: ${error.stack}`);
      const userNumber = m.sender?.split('@')[0] || "User";
      await m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n│❒ Failed to fetch stickers for @${userNumber}. Something went wrong.\n│❒ Please try again later.\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`, { mentions: [m.sender] });
    }
  }
};