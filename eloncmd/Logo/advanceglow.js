// Advanceglow.js  
const fetch = require("node-fetch");  
  
module.exports = async (context) => {  
    const { client, m, text } = context;  
  
    if (!text) return m.reply("Please type some text to create the glow effect.");  
    if (text.length > 50) return m.reply("Text is too long. Please shorten it to under 50 characters.");  
  
    try {  
        // React with hourglass while processing  
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });  
  
        const url = `https://api.nekolabs.web.id/canvas/ephoto/advanced-glow?text=${encodeURIComponent(text.trim())}`;  
        const response = await fetch(url);  
  
        if (!response.ok) {
            // React with cross if API fails  
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });  
            return m.reply("Something went wrong with the API. Please try again later.");  
        }  
  
        const buffer = await response.buffer();  
  
        // React with checkmark on success  
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });  
  
        // Send the resulting image  
        await client.sendMessage(m.chat, {  
            image: buffer,  
            caption: "✨ Advanced Glow ✨",  
        }, { quoted: m });  
  
    } catch (error) {  
        // React with cross on error  
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });  
        m.reply("Something went wrong while generating the image. Please try again.");  
    }  
};
