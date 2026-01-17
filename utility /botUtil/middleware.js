const middleware = async (context, next) => {
    const { m, isBotAdmin, isAdmin } = context;

    if (!m.isGroup) {
        return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈
┋❒ This is an admin-only command 
╰┈┈┈┈━━━━━━┈┈┈┈◈`);
    }
    if (!isAdmin) {
        return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈
┋❒ Admin privileges are required
╰┈┈┈┈━━━━━━┈┈┈┈◈`);
    }
    if (!isBotAdmin) {
        return m.reply(`╭┈┈┈┈━━━━━━┈┈┈┈◈
┋❒ I need admin rights to obey
╰┈┈┈┈━━━━━━┈┈┈┈◈`);
    }

    await next(); // Proceed to the next function (main handler)
};

module.exports = middleware;
