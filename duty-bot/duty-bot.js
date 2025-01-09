require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const schedule = require('node-schedule');
const checkLightOffs = require('./light.js');
const pollApi = require('./poll');
const {isActive} = require("./poll");

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, {polling: true});

const API_URL = process.env.API_URL;
const ALLOWED_IDS = process.env.ALLOWED_IDS ? process.env.ALLOWED_IDS.split(',') : [];

const getCadet = async (cadetId) => {
    try {
        const response = await axios.get(`${API_URL}/cadets/${cadetId}`);
        return response.data;
    } catch (error) {
        console.error('Помилка запиту:', error.message);
    }
}

// Єбашкі ////////////////////////////////////////

const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Дати людей на єбашку 🤤', callback_data: '/giveebashka'}],
            [{text: 'Список кількості єбашок 📋', callback_data: '/allebashka'}],
            [{text: 'Добавляє 1 єбашку ➕', callback_data: '/addebashka'}],
            [{text: 'Видаляє 1 єбашку ➖', callback_data: '/removeebashka'}],
            [{text: 'Звільняє від єбашкі ✅', callback_data: '/freeebashka'}],
            [{text: 'Ставить на єбашку ⛔️', callback_data: '/setebashka'}],
        ],
    },
};

const cadetMenu = (command, cadetIds) => ({
    reply_markup: {
        inline_keyboard: Array.from({length: cadetIds.size}, (_, i) => [
            {text: `${cadetIds.lastnames[i]}`, callback_data: `${command}_${cadetIds.ids[i]}`},
        ]),
    },
});

const countMenu = (command, numOfCadets) => ({
    reply_markup: {
        inline_keyboard: Array.from({length: numOfCadets}, (_, i) => [
            {text: `${i + 1}`, callback_data: `${command}_${i + 1}`},
        ]),
    },
});

const doCommand = async (chatId, userId, command, args) => {
    try {
        const response = await axios.post(`${API_URL}/command`, {
            command: command,
            args: args
        });
        if (chatId == pollApi.GROUP_ID) {
            const cadet = await getCadet(userId);
            console.log(`᛭ Затянуті-Привиди 222 ᛭(${cadet.lastName}) send command: ${command} with args: ${args}`);
        } else {
            const cadet = await getCadet(chatId);
            console.log(`${cadet.lastName} send command: ${command} with args: ${args}`);
        }

        const content = response.data.content
        if (content && content.trim() !== '') {
            bot.sendMessage(chatId, `${content}`);
        } else {
            bot.sendMessage(chatId, `Немає даних`);
        }
    } catch (error) {
        console.error('Помилка запиту:', error.message);
        bot.sendMessage(chatId, 'Помилка виконання команди.');
    }
}


const getCadets = async (status) => {
    try {
        if (status !== undefined) {
            const response = await axios.get(`${API_URL}/cadets?status=${status}`);
            return response.data;
        } else {
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

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const userId = query.from.id;
    if (data.startsWith('/') && ALLOWED_IDS.includes(chatId.toString()) && ALLOWED_IDS.includes(userId.toString()) && data.indexOf('_') == -1) {
        if (data == '/giveebashka') {
            doCommand(chatId, userId, '/allebashka', "");
            const cadets = await getCadets(false)
            bot.sendMessage(chatId, `Оберіть кількість людей:`, countMenu(data, cadets.size));
        } else if (data == '/freeebashka') {
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data, await getCadets(true)));
        } else if (data == '/setebashka') {
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data, await getCadets(false)));
        } else if (data != '/allebashka') {
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data, await getCadets()));
        }
    }
    if (data.startsWith('/allebashka') && ALLOWED_IDS.includes(chatId.toString()) && data.indexOf('_') == -1) {
        doCommand(chatId, userId, data, "");
    }
    if (data.indexOf('_') != -1 && ALLOWED_IDS.includes(chatId.toString()) && ALLOWED_IDS.includes(userId.toString())) {
        const [command, args] = data.split('_');
        doCommand(chatId, userId, command, args)
    }
});


// Голосування ////////////////////////////////////////

isActive().then((status) => console.log(status?'Завантажено голосування':'Немає активного голосування'));

const collect = schedule.scheduleJob({
    hour: pollApi.POLL_COLLECT_HOUR,
    minute: pollApi.POLL_COLLECT_MINUTES,
    dayOfWeek: pollApi.DAYS_OF_WEEK
}, async () => {
    pollApi.isActive()
        .then(async (status) => {
            if (!(status)) {
                return bot.sendMessage(pollApi.GROUP_ID, "Немає активного голосування для збору даних.");
            }
            let message = '';
            const results = pollApi.getPoll().votes;
            for (let i = 0; i < results.length; i++) {
                if (results[i].userIds.length > 0) {
                    if( i === 0) message += 'Дозвольте:\n';
                    message += `${results[i].option}:\n`;
                    for (let j = 0; j < results[i].userIds.length; j++) {
                        await getCadet(results[i].userIds[j])
                            .then(cadet => message += `${cadet.lastName}\n`)
                    }
                    await bot.sendMessage(pollApi.GROUP_ID, message);
                    message = '';
                }
            }
            await pollApi.stopPoll();
        })
});

const createPoll = schedule.scheduleJob({
    hour: pollApi.POLL_HOUR,
    minute: pollApi.POLL_MINUTES,
    dayOfWeek: pollApi.DAYS_OF_WEEK
}, () => {
    const question = pollApi.questions[Math.floor(Math.random() * pollApi.questions.length)];

    bot.sendPoll(pollApi.GROUP_ID, question, pollApi.options, {
        is_anonymous: false,
    }).then(async (poll) => {
        await pollApi.createPoll(poll.poll.id);
        console.log("Голосування створено:", poll.poll.id);
    }).catch((error) => console.error("Помилка надсилання голосування:", error.message));
});

bot.on('poll_answer', async (pollAnswer) => {
    const {user, option_ids} = pollAnswer;
    if (await pollApi.isActive()) {
        await pollApi.addVote({
            choice: option_ids,
            userId: user.id
        })
        const cadet = await getCadet(user.id);
        console.log(`Користувач ${cadet.lastName} проголосував за: ${option_ids}`);
    }
});

// Перевірка світла ////////////////////////////////////////

const LIGHT_CHECK = process.env.LIGHT_CHECK || 1800
console.log(`Інтервал оновлення даних про світло: ${LIGHT_CHECK} секунд`);

async function sendLightsOffsMessage() {
    await checkLightOffs()
        .then((data) => {
            if (data) bot.sendMessage(pollApi.GROUP_ID, `Години відключень на ${data.date}:\n${data.hours.join('\n')}`)
        })
        .catch((err) => console.error(err));
}

setInterval(sendLightsOffsMessage, LIGHT_CHECK * 1000);

bot.on('polling_error', (error) => console.error('Polling Error:', error));
