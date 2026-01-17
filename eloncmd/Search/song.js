module.exports = async (context) => {
  const { client, m, text } = context;
  const yts = require("yt-search");

  const formatStylishReply = (message) => {
    return `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n┋❒ ${message}\n╰┈┈┈┈━━━━━━┈┈┈┈◈◈`;
  };

  if (!text) {
    return m.reply(formatStylishReply("Please provide a song name to search for. 🎵 Example: .ytsearch Alan Walker Faded"));
  }

  if (text.length > 100) {
    return m.reply(formatStylishReply("The song name is too long. Please keep it under 100 characters."));
  }

  const { videos } = await yts(text);
  if (!videos || videos.length === 0) {
    return m.reply(formatStylishReply("No songs found for your query. Please try a different title."));
  }

  const song = videos[0];
  const title = song.title;
  const artist = song.author?.name || "Unknown Artist";
  const views = song.views?.toLocaleString() || "Unknown";
  const duration = song.duration?.toString() || "Unknown";
  const uploaded = song.ago || "Unknown";
  const thumbnail = song.thumbnail || "";
  const videoUrl = song.url;

  const response = `╭┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
                  `│❒ *${title}* found for ${m.pushName} 🎶\n` +
                  `│🎤 *Artist*: ${artist}\n` +
                  `│👀 *Views*: ${views}\n` +
                  `│⏱ *Duration*: ${duration}\n` +
                  `│📅 *Uploaded*: ${uploaded}\n` +
                  (thumbnail ? `│🖼 *Thumbnail*: ${thumbnail}\n` : '') +
                  `│🔗 *Video*: ${videoUrl}\n` +
                  `╰┈┈┈┈━━━━━━┈┈┈┈◈◈\n` +
                  `©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳`;

  await m.reply(formatStylishReply(response));
};