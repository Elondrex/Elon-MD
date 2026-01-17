const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `╭┈┈┈┈━━━━━━┈┈┈┈◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Database is not available or no settings found. Please check your setup.") },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();
      const validValues = ['on', 'off'];

      // If the argument is invalid or missing, show current status with buttons
      if (!validValues.includes(value)) {
        const buttons = [
          { buttonId: `${prefix}chatbotpm on`, buttonText: { displayText: "ENABLE CHATBOT 🤖" }, type: 1 },
          { buttonId: `${prefix}chatbotpm off`, buttonText: { displayText: "DISABLE CHATBOT 🔴" }, type: 1 },
        ];

        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(`Chatbot PM is currently ${settings.chatbotpm ? 'ENABLED' : 'DISABLED'}. Use ${prefix}chatbotpm on/off to toggle.`),
            footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
            buttons,
            headerType: 1,
            viewOnce: true,
          },
          { quoted: m, ad: true }
        );
      }

      const newState = value === 'on';
      if (settings.chatbotpm === newState) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Chatbot PM is already ${newState ? 'ENABLED' : 'DISABLED'}!`) },
          { quoted: m, ad: true }
        );
      }

      await updateSetting('chatbotpm', newState);
      return await client.sendMessage(
        m.chat,
        { text: formatStylishReply(`Chatbot PM has been ${newState ? 'ENABLED' : 'DISABLED'}! ${newState ? 'The bot will now reply automatically in private messages. 🤖' : 'Chatbot functionality has been turned off.'}`) },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('Error toggling Chatbot PM:', error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Failed to update Chatbot PM. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};