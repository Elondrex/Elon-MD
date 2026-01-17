const fs = require('fs');
const path = require('path');
const { session } = require('../Env/settings');

async function authentication() {
    try {
        const credsPath = path.join(__dirname, '..', 'Session', 'creds.json');
        
        if (!fs.existsSync(credsPath)) {
            console.log("📡 connecting...");
            const decodedSession = Buffer.from(session, 'base64').toString();
            fs.writeFileSync(credsPath, decodedSession, "utf8");
        } else if (session !== "zokk") {
            const decodedSession = Buffer.from(session, 'base64').toString();
            fs.writeFileSync(credsPath, decodedSession, "utf8");
        }
    } catch (e) {
        console.log("Session is invalid: " + e);
    }
}

module.exports = authentication;
