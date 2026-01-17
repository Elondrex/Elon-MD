const fetch = require("node-fetch");  
  
module.exports = {  
  name: 'pinterest',  
  aliases: ['pin', 'pinterestimg'],  
  description: 'Fetches Pinterest images based on a search query',  
  run: async (context) => {  
    const { client, m } = context;  
  
    try {  
      const query = m.text.trim();  
      if (!query) return m.reply("Please provide a search term.");  
  
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });  
  
      const apiUrl = `https://api-faa.my.id/faa/pinterest?q=${encodeURIComponent(query)}`;  
      const res = await fetch(apiUrl);  
      const data = await res.json();  
  
      if (!data.status || !data.result || data.result.length === 0) {  
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });  
        return m.reply(`No Pinterest images were found for "${query}". Try a different keyword.`);  
      }  
  
      const images = data.result.slice(0, 5);  
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });  
  
      for (const [i, imgUrl] of images.entries()) {  
        try {  
          const response = await fetch(imgUrl);  
          const arrayBuffer = await response.arrayBuffer();  
          const buffer = Buffer.from(arrayBuffer);  
  
          await client.sendMessage(m.chat, {  
            image: buffer,  
            caption: i === 0 ? `🥀\n—\n🄴🄻🄾🄽-🄼🄳\nQuery: ${query}` : ''  
          }, { quoted: i === 0 ? m : null });  
            
          await new Promise(resolve => setTimeout(resolve, 500));  
        } catch {}  
      }  
  
    } catch (error) {  
      console.error('Pinterest error:', error);  
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });  
      await m.reply(`Pinterest search failed. Please try again later.\nError: ${error.message}`);  
    }  
  }  
};