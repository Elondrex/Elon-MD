const fetch = require('node-fetch');

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    if (!botname) return m.reply("The bot does not have a name set. Please contact the developer.");
    if (!text) return m.reply("Please provide a prompt to ask the AI.");

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
        const statusMsg = await m.reply("Processing your request. Please wait...");

        const apiUrl = `https://szhost.biz.id/api/ai/chatgpt4o`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) throw new Error(`Service unavailable: ${response.status}`);

        const data = await response.json();

        if (!data.status || !data.result || !data.result.message) {
            throw new Error('The AI returned an empty response.');
        }

        let replyText = data.result.message;

        // Filter restricted terms
        const blockedTerms = ["owner", "prefix", "all", "broadcast", "gc", "kick", "add", "promote", "demote", "delete", "set", "reset", "clear", "block", "unblock", "leave", "ban", "get", "update", "config", "jadibot"];
        const lowerReply = replyText.toLowerCase();
        const containsBlocked = blockedTerms.some(term => lowerReply.includes(term));

        if (containsBlocked) replyText = "I'm unable to assist with that request.";

        // Delete loading message and send success reaction
        await client.sendMessage(m.chat, { delete: statusMsg.key });
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        await m.reply(`[GPT]\n${replyText}\n—\n🄴🄻🄾🄽-🄼🄳`);

    } catch (error) {
        console.error('GPT error:', error);

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        let userMessage = 'The AI service could not process your request.';

        if (error.message.includes('Service unavailable')) {
            userMessage = 'The API is currently unavailable. Please try again later.';
        }

        if (error.message.includes('empty response')) {
            userMessage = 'The AI returned no text. Please try asking a clearer question.';
        }

        await m.reply(`${userMessage}\nError: ${error.message}`);
    }
};