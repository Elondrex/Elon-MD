const axios = require("axios");

module.exports = {
  name: 'tempinbox',
  aliases: ['checkinbox', 'tempmailinbox', 'tempcheck'],
  description: 'Check your temporary email inbox',
  run: async (context) => {
    const { client, m, prefix } = context;

    const args = m.body?.split(" ") || [];
    const sessionId = args[1];

    if (!sessionId) {
      return client.sendMessage(m.chat, {
        text: `◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
│❒ Please provide your session ID to check the temp inbox. 📨
│❒ Usage: ${prefix}tempinbox YOUR_SESSION_ID
│❒ Example: ${prefix}tempinbox U2Vzc2lvbjoc5LI1OhFHh4tv21skV965
◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`
      }, { quoted: m });
    }

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

    try {
      const response = await axios.get(`https://api.nekolabs.web.id/tools/tempmail/v3/inbox?id=${sessionId}`, {
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error('Invalid session ID or inbox expired');
      }

      const { totalEmails, emails } = response.data.result;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      if (totalEmails === 0) {
        return client.sendMessage(m.chat, {
          text: `◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
│❒ Your inbox is currently empty. 📭
│❒ Use your temp email and check again shortly.
│❒ Total Emails: 0
◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`
        }, { quoted: m });
      }

      let inboxText = `◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
│❒ 📬 Inbox: ${totalEmails} email${totalEmails > 1 ? 's' : ''} found\n`;

      emails.forEach((email, index) => {
        inboxText += `│\n│ 📨 Email ${index + 1}:
│ From: ${email.from || 'Unknown'}
│ Subject: ${email.subject || 'No Subject'}\n`;

        if (email.text && email.text.trim()) {
          const cleanText = email.text.replace(/\r\n/g, '\n').trim();
          inboxText += `│ Content: ${cleanText.substring(0, 50)}${cleanText.length > 50 ? '...' : ''}\n`;
        }

        if (email.downloadUrl) {
          inboxText += `│ 📎 Attachment available\n`;
        }
      });

      inboxText += `◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`;

      if (inboxText.length > 4000) {
        const firstPart = inboxText.substring(0, 4000);
        const secondPart = inboxText.substring(4000);

        await client.sendMessage(m.chat, { text: firstPart }, { quoted: m });
        await client.sendMessage(m.chat, { text: secondPart });
      } else {
        await client.sendMessage(m.chat, { text: inboxText }, { quoted: m });
      }

    } catch (error) {
      console.error('TempInbox error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      let errorMessage = "Failed to check inbox. ";
      if (error.message.includes('Invalid session') || error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage += "Session expired or invalid. Please create a new temp email. 🔄";
      } else if (error.message.includes('timeout')) {
        errorMessage += "API timeout. Please try again. ⏱️";
      } else if (error.message.includes('Network Error')) {
        errorMessage += "Network issue. Check your connection. 📶";
      } else {
        errorMessage += `Error: ${error.message}`;
      }

      await client.sendMessage(m.chat, {
        text: `◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
│❒ ${errorMessage}
◈━┈┈┈┈┈┈┈┈┈┈┈┈━◈
> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`
      }, { quoted: m });
    }
  },
};