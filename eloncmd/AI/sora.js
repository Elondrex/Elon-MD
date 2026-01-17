const fetch = require('node-fetch');

module.exports = {
  name: 'sora',
  aliases: ['soraai', 'genvideo'],
  description: 'Generates a video using Sora AI with your text prompt',
  run: async (context) => {
    const { client, m, botname } = context;

    try {
      const prompt = m.text.trim();
      if (!prompt) return m.reply("Give me a prompt.");

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
      const statusMsg = await m.reply(`Generating your video: "${prompt}"`);

      const params = new URLSearchParams({
        apikey: 'fgsiapi-2dcdfa06-6d',
        prompt: prompt,
        ratio: 'landscape',
        enhancePrompt: 'true'
      });

      const response = await fetch(`https://fgsi.dpdns.org/api/ai/sora2?${params.toString()}`);
      const data = await response.json();

      if (!data.status || !data.result) throw new Error('API failed to generate video.');

      const videoUrl = data.result;

      await client.sendMessage(m.chat, { delete: statusMsg.key });
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: `🦄\n—\n🄴🄻🄾🄽-🄼🄳`,
        gifPlayback: false
      }, { quoted: m });

    } catch (error) {
      console.error('Sora error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Video generation failed.\nError: ${error.message}`);
    }
  }
};