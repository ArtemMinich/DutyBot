require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const API_URL = process.env.API_URL;
const ALLOWED_IDS = process.env.ALLOWED_IDS ? process.env.ALLOWED_IDS.split(',') : [];

const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: 'Дати людей на єбашку 🤤', callback_data: '/giveebashka' }],
            [{ text: 'Список кількості робіт 📋', callback_data: '/allebashka' }],
            [{ text: 'Добавляє 1 єбашку ➕', callback_data: '/addebashka' }],
            [{ text: 'Видаляє 1 єбашку ➖', callback_data: '/removeebashka' }],
            [{ text: 'Звільніє людину від єбашкі ✅', callback_data: '/freeebashka' }],
            [{ text: 'Ставить людину на єбашку ⛔️', callback_data: '/setebashka' }],
        ],
    },
};

const cadetMenu = (command,cadetIds) => ({
    reply_markup: {
        inline_keyboard: Array.from({ length: cadetIds.size }, (_, i) => [
            { text: `${cadetIds.lastnames[i]}`, callback_data: `${command}_${cadetIds.ids[i]}` },
        ]),
    },
});

const countMenu = (command,numOfCadets) => ({
    reply_markup: {
        inline_keyboard: Array.from({ length: numOfCadets }, (_, i) => [
            { text: `${i + 1}`, callback_data: `${command}_${i + 1}` },
        ]),
    },
});

const doCommand = async (chatId,command,args)=>{
    try {
        const response = await axios.post(`${API_URL}/command`, {
            command: command,
            args: args
        });
        console.log(`${chatId} send command: ${command} with args: ${args}`);
        const content = response.data.content
        if(content && content.trim() !== ''){
            bot.sendMessage(chatId, `${content}`);
        } else{
            bot.sendMessage(chatId, `Немає даних`);
        }
    } catch (error) {
        console.error('Помилка запиту:', error.message);
        bot.sendMessage(chatId, 'Помилка виконання команди.');
    }
}


const getCadets = async (status)=>{
    try {
        if(status!==undefined){
            const response = await axios.get(`${API_URL}/cadets?status=${status}`);
            return response.data;
        }
        else{
            const response = await axios.get(`${API_URL}/cadets`);
            return response.data;
        }
    } catch (error) {
        console.error('Помилка запиту:', error.message);
    }
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Оберіть дію:', mainMenu);
});

bot.on('callback_query', async (query) =>  {
    const chatId = query.message.chat.id;
    const data = query.data;
    const userId = query.from.id;
    if (data.startsWith('/') && ALLOWED_IDS.includes(chatId.toString()) && ALLOWED_IDS.includes(userId.toString()) && data.indexOf('_') == -1) {
        if(data == '/allebashka'){
            doCommand(chatId, data,"");
        } else if(data == '/giveebashka'){  
            doCommand(chatId, '/allebashka',"");
            const cadets = await getCadets(false)
            bot.sendMessage(chatId, `Оберіть кількість людей:`, countMenu(data,cadets.size));     
        }else if(data == '/freeebashka'){
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data,await getCadets(true)));     
        }else if(data == '/setebashka'){
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data,await getCadets(false)));     
        }else{
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data,await getCadets()));     
        }
    }

    if (data.indexOf('_') != -1) {
        const [command, args] = data.split('_');
        doCommand(chatId, command,args)
    }
});

bot.on('polling_error', (error) => console.error('Polling Error:', error));



