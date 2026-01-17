const acrcloud = require("acrcloud");

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const acr = new acrcloud({
            host: 'identify-ap-southeast-1.acrcloud.com',
            access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
            access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
        });

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        if (!m.quoted) return m.reply("Please quote an audio or video message.");

        const p = m.quoted ? m.quoted : m;
        const buffer = await p.download();

        const { status, metadata } = await acr.identify(buffer);
        if (status.code !== 0) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("Song could not be recognized. Please try a clearer audio.");
        }

        const { title, artists, album, genres, release_date } = metadata.music[0];
        let txt = `*🎵 SONG IDENTIFIED*\n\n`;
        txt += `*Title:* ${title}\n`;
        if (artists) txt += `*Artists:* ${artists.map(v => v.name).join(', ')}\n`;
        if (album) txt += `*Album:* ${album.name}\n`;
        if (genres) txt += `*Genres:* ${genres.map(v => v.name).join(', ')}\n`;
        if (release_date) txt += `*Release:* ${release_date}\n`;

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        await m.reply(txt + `\n—\n🄴🄻🄾🄽-🄼🄳`);

    } catch (error) {
        console.error('Music recognition error:', error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`Music recognition failed. Please try again later.\nError: ${error.message}`);
    }
};