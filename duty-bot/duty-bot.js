require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const API_URL = process.env.API_URL;
const GROUP_ID = process.env.GROUP_ID;

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if(chatId=`${GROUP_ID}`){
        // bot.sendMessage(chatId, 'Чуєш блять. Куда ми пишем нахуй.');
        return;
    }
    if (text!=undefined && text.startsWith('/')) {
        const command = text.split(' ')[0].toLowerCase();
        const args = text.split(' ').slice(1).join(' ');
        
        try {
            const response = await axios.post(`${API_URL}/command`, {
                command: command,
                args: args,
            });
            console.log(`Sending command: ${command} with args: ${args} from ${chatId} status: ${response.status}`);
            bot.sendMessage(chatId, `${response.data.content}`);
        } catch (error) {
            console.error('Помилка запиту:', error.message);
            bot.sendMessage(chatId, 'Помилка виконання команди.');
        }
    } else {
        bot.sendMessage(chatId, 'Надішліть команду у форматі: /команда аргументи');
    }
});
