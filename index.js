const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const { getGFGPOTD, getLeetCodePOTD } = require('./potdFetcher');
require('dotenv').config();
const mongoose = require('mongoose');





mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Connected to MongoDB");
}).catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
});

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('📲 Scan this QR code to connect:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ WhatsApp connected.');

    cron.schedule('45 10 * * *', async () => {
        console.log('🕘 9 AM - Running scheduled POTD task...');
        await sendPOTD();
    });
});

async function sendPOTD() {
    const gfgLink = await getGFGPOTD();
    const leetcodeLink = await getLeetCodePOTD();

    const msg = `🚀 *Daily Coding Challenge* 🚀

*GeeksforGeeks POTD:* ${gfgLink}
*LeetCode POTD:* ${leetcodeLink}

💡 Sharpen your skills, one problem at a time!
✨ Happy Coding! 💻🔥`;

    try {
        const chats = await client.getChats();
        const group = chats.find(chat => chat.name === "Room F02");

        if (group) {
            await client.sendMessage(group.id._serialized, msg);
            console.log("✅ POTD sent to group.");
        } else {
            console.log(" Group not found. Please check the group name.");
        }
    } catch (err) {
        console.error(" Error sending message:", err.message);
    }
}

client.initialize();
