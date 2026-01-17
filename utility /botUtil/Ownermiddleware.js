const Ownermiddleware = async (context, next) => {
    const { m, Owner } = context;

    if (!Owner) {
        return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈
┋❒ This command is for the user only.
╰┈┈┈┈━━━━━━┈┈┈┈◈
> ©🄿🄾🅆🄴🅁🄴🄳 🄱🅈 🄴🄻🄾🄽-🄼🄳 `);
    }

    await next();
};

module.exports = Ownermiddleware;