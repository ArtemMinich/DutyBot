require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const API_URL = process.env.API_URL;
const ALLOWED_IDS = process.env.ALLOWED_IDS ? process.env.ALLOWED_IDS.split(',') : [];

// Єбашкі ////////////////////////////////////////

const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: 'Дати людей на єбашку 🤤', callback_data: '/giveebashka' }],
            [{ text: 'Список кількості єбашок 📋', callback_data: '/allebashka' }],
            [{ text: 'Добавляє 1 єбашку ➕', callback_data: '/addebashka' }],
            [{ text: 'Видаляє 1 єбашку ➖', callback_data: '/removeebashka' }],
            [{ text: 'Звільняє від єбашкі ✅', callback_data: '/freeebashka' }],
            [{ text: 'Ставить на єбашку ⛔️', callback_data: '/setebashka' }],
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
        if(data == '/giveebashka'){  
            doCommand(chatId, '/allebashka',"");
            const cadets = await getCadets(false)
            bot.sendMessage(chatId, `Оберіть кількість людей:`, countMenu(data,cadets.size));     
        }else if(data == '/freeebashka'){
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data,await getCadets(true)));     
        }else if(data == '/setebashka'){
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data,await getCadets(false)));     
        }else if (data != '/allebashka'){
            bot.sendMessage(chatId, `Оберіть курсанта:`, cadetMenu(data,await getCadets()));     
        }
    }
    if(data.startsWith('/allebashka') && ALLOWED_IDS.includes(chatId.toString())  && data.indexOf('_') == -1){
        doCommand(chatId, data,"");
    }
    if (data.indexOf('_') != -1) {
        const [command, args] = data.split('_');
        doCommand(chatId, command,args)
    }
});

// Голосування ////////////////////////////////////////

const GROUP_ID = process.env.GROUP_ID

const questions = ['Как жизнь бродяга?'];

const question = questions[Math.floor(Math.random() * questions.length)];
const options = ["Магазин", "Пошта", "Парк", "Бігати"];

// Змінна для збереження даних голосування
let pollData = {
  pollId: null,
  votes: {}, // {userId: [вибрані_варіанти]}
};

// Функція для обробки голосів і створення мапи
const collectPollData = async () => {
  if (!pollData.pollId) {
    bot.sendMessage(GROUP_ID, "Немає активного голосування для збору даних.");
    return;
  }

  // Генерація мапи з результатами
  const resultsMap = new Map();

  options.forEach((option, index) => {
    resultsMap.set(option, []); // Ініціалізація пустого масиву для кожного варіанта
  });

  Object.entries(pollData.votes).forEach(([userId, userChoices]) => {
    userChoices.forEach((choiceIndex) => {
      const option = options[choiceIndex];
      resultsMap.get(option).push(userId); // Додаємо ID користувача до відповідного варіанта
    });
  });

  // Форматування результатів для API
  const resultsObj = {};
  resultsMap.forEach((userIds, option) => {
    resultsObj[option] = userIds;  // Створюємо об'єкт для передачі
  });

  // Відправка результатів на сервер через API
  try {
    const response = await axios.post(`${API_URL}/poll`, resultsObj);
    bot.sendMessage(GROUP_ID,response);
    console.log("Результати успішно відправлено на API:", response.data);
  } catch (error) {
    console.error("Помилка при відправці результатів на API:", error.message);
  }

  // Очищення даних голосування
  pollData = { pollId: null, votes: {} };
};

// Розклад: щодня о 16:30, крім неділі
const job = schedule.scheduleJob({ hour: 16, minute: 30, dayOfWeek: [1, 2, 3, 4, 5, 6] }, () => {
  bot.sendPoll(chatId, question, options, {
    is_anonymous: false, // Вимикаємо анонімність, щоб отримувати ID користувачів
  }).then((poll) => {
    pollData.pollId = poll.poll.id; // Зберігаємо ID голосування
    pollData.votes = {}; // Скидаємо попередні результати

    console.log("Голосування створено:", poll.poll.id);

    // Запускаємо таймер на 10 хвилин для збору даних
    setTimeout(() => {
      collectPollData();
    }, 10 * 60 * 1000); // 10 хвилин
  }).catch((error) => {
    console.error("Помилка надсилання голосування:", error.message);
  });
});

// Відстеження голосів
bot.on('poll_answer', (pollAnswer) => {
  const { user, option_ids } = pollAnswer;

  // Зберігаємо голоси користувача
  pollData.votes[user.id] = option_ids;
  console.log(`Користувач ${user.id} проголосував за: ${option_ids}`);
});


bot.on('polling_error', (error) => console.error('Polling Error:', error));



