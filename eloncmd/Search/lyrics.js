const fetch = require('node-fetch');

module.exports = async (context) => {
  const { client, m, text } = context;

  if (!text) {
    return m.reply("Please provide a song name. Example: .lyrics Alan Walker Faded");
  }

  try {
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://api.elrayyxml.web.id/api/search/lyrics?q=${encodedText}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result || data.result.length === 0) {
      return m.reply(`No lyrics found for "${text}". Please check the song name and try again.`);
    }

    const song = data.result[0];
    
    if (!song.lyrics?.plainLyrics) {
      return m.reply(`Lyrics are not available for this song. Try another one.`);
    }

    const cleanLyrics = song.lyrics.plainLyrics;
    
    await m.reply(`*${song.title} - ${song.artist}*\n\n${cleanLyrics}\n\n> 🄴🄻🄾🄽-🄼🄳`);

  } catch (error) {
    console.error(`Lyrics API error: ${error.message}`);
    await m.reply(`Unable to fetch lyrics for "${text}". Please try again later.`);
  }
};