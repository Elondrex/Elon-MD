module.exports = async (context) => {
  const { client, m, text, botname, prefix = '' } = context;

  const toFancyFont = (text, isUpperCase = false) => {
    const fonts = {
      'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈',
      'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
      'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢',
      'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
    };
    return (isUpperCase ? text.toUpperCase() : text.toLowerCase())
      .split('')
      .map(char => fonts[char] || char)
      .join('');
  };

  if (text) {
    return client.sendMessage(m.chat, {
      text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Hey ${m.pushName}, you can use the command directly by typing !repo.`
    }, { quoted: m });
  }

  try {
    const repoUrl = 'https://api.github.com/repos/elondrex/Elon-MD';
    const response = await fetch(repoUrl);
    if (!response.ok) throw new Error('Failed to fetch repository data');
    const repoData = await response.json();

    const repoInfo = {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      lastUpdate: repoData.updated_at,
      owner: repoData.owner.login,
      createdAt: repoData.created_at,
      htmlUrl: repoData.html_url
    };

    const createdDate = new Date(repoInfo.createdAt).toLocaleDateString('en-GB');
    const lastUpdateDate = new Date(repoInfo.lastUpdate).toLocaleDateString('en-GB');

    const replyText = `◈━━━━━━━━━━━━━━━━◈
│❒ *${botname} Repo*

🌟 *Stars*: ${repoInfo.stars} ?
🔗 *Forks*: ${repoInfo.forks} ?
📅 *Created*: ${createdDate}
🕒 *Last Update*: ${lastUpdateDate}
👤 *Owner*: ${repoInfo.owner}
🔍 *Repo Link*: ${repoInfo.htmlUrl}

│❒ Check out the button below to see the developer info!`;

    await client.sendMessage(m.chat, {
      text: replyText,
      footer: `? ${botname}`,
      buttons: [
        { buttonId: `${prefix}dev`, buttonText: { displayText: `👤 ${toFancyFont('DEV')}` }, type: 1 }
      ],
      headerType: 1,
      viewOnce: true,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: false,
          title: `${botname}`,
          body: `Check out the repo safely.`,
          sourceUrl: `https://github.com/elondrex/Elon-MD`,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Error in repo command:', error);
    await client.sendMessage(m.chat, {
      text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Could not fetch repository info. You can check it manually here: https://github.com/elondrex/Elon-MD`
    }, { quoted: m });
  }
};