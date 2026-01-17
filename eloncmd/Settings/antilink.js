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
          { text: formatStylishReply("No settings found in the database. Please check and try again.") },
          { quoted: m, ad: true }
        );
      }

      // Normalize the value
      const value = args.join(" ").toLowerCase();
      const validModes = ["off", "delete", "remove"];

      // Update mode if argument is provided
      if (validModes.includes(value)) {
        const currentMode = String(settings.antilink || "off").toLowerCase();
        if (currentMode === value) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Antilink is already set to '${value.toUpperCase()}'. No changes needed.`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('antilink', value);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Antilink mode has been updated to '${value.toUpperCase()}'. ✅`) },
          { quoted: m, ad: true }
        );
      }

      // Ensure currentStatus is always a string
      const currentStatus = String(settings.antilink || "off").toLowerCase();

      const buttons = [
        { buttonId: `${prefix}antilink delete`, buttonText: { displayText: "DELETE 🗑️" }, type: 1 },
        { buttonId: `${prefix}antilink remove`, buttonText: { displayText: "REMOVE 🚫" }, type: 1 },
        { buttonId: `${prefix}antilink off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      // Choose emoji based on current mode
      const emoji =
        currentStatus === "delete" ? "🗑️" :
        currentStatus === "remove" ? "🚫" :
        "😴";

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`Current Antilink Mode: ${currentStatus.toUpperCase()} ${emoji}\nPlease choose an option from below.`),
          footer: "> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error("Error in Antilink command:", error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("An error occurred while updating antilink. Please try again later.") },
        { quoted: m, ad: true }
      );
    }
  });
};