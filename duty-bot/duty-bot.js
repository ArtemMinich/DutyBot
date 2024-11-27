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
            [{ text: 'Дати людей на єбашку', callback_data: '/giveebashka' }],
            [{ text: 'Список кількості робіт', callback_data: '/allebashka' }],
            [{ text: 'Добавляє кількість єбашок для когось', callback_data: '/addebashka' }],
            [{ text: 'Видаляє єбашку для когось', callback_data: '/removeebashka' }],
            [{ text: 'Звільніє людину від єбашкі', callback_data: '/freeebashka' }],
            [{ text: 'Ставить людині єбашку', callback_data: '/setebashka' }],
        ],
    },
};

const cadetMenu = (command,cadetsFree) => ({
    reply_markup: {
        inline_keyboard: Array.from({ length: cadetsFree.numFreeCadets }, (_, i) => [
            { text: `${cadetsFree.idsFreeCadets[i]}`, callback_data: `${command}_${cadetsFree.idsFreeCadets[i]}` },
        ]),
    },
});

const sendRequest = async (chatId,command,args)=>{
    try {
        const response = await axios.post(`${API_URL}/command`, {
            command: command,
            args: args
        });
        console.log(`${chatId} send command: ${command} with args: ${args} status: ${response.status}`);
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

const getFreeCadets = async ()=>{
    try {
        const response = await axios.get(`${API_URL}/free-cadets`);
        return response.data
    } catch (error) {
        console.error('Помилка запиту:', error.message);
        bot.sendMessage(chatId, 'Помилка виконання команди.');
    }
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Оберіть дію:', mainMenu);
});



bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    console.log(`${chatId} - ${data}`)

    if (data.startsWith('/') && ALLOWED_IDS.includes(chatId.toString()) && data.indexOf('_') == -1) {
        if(data == '/allebashka'){
            sendRequest(chatId, data,"");
        } else if(data == '/giveebashka'){
            const command = data;
            sendRequest(chatId, '/allebashka',"");
            bot.sendMessage(chatId, `Оберіть кількість людей:`, cadetMenu(command, getFreeCadets()));     
        }else{
            const command = data;
            sendRequest(chatId, '/allebashka',"");
            bot.sendMessage(chatId, `Оберіть номер курсанта:`, cadetMenu(command, getFreeCadets()));     
        }
        
    }

    if (data.indexOf('_') != -1) {
        const [command, args] = data.split('_');
        sendRequest(chatId, command,args)
    }
});

bot.on('polling_error', (error) => console.error('Polling Error:', error));



