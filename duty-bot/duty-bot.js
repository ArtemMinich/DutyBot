require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const schedule = require('node-schedule');
// const { lightOffs } = require('./light.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const API_URL = process.env.API_URL;
const ALLOWED_IDS = process.env.ALLOWED_IDS ? process.env.ALLOWED_IDS.split(',') : [];

const getCadet = async (cadetId) =>{
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

const doCommand = async (chatId, userId,command,args)=>{
    try {
        const response = await axios.post(`${API_URL}/command`, {
            command: command,
            args: args
        });
        if(chatId==GROUP_ID){
          const cadet = await getCadet(userId);
          console.log(`᛭ Затянуті-Привиди 222 ᛭(${cadet.lastName}) send command: ${command} with args: ${args}`);
        }
        else{
          const cadet = await getCadet(chatId);
          console.log(`${cadet.lastName} send command: ${command} with args: ${args}`);
        }
        
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
            doCommand(chatId, userId, '/allebashka',"");
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
        doCommand(chatId, userId, data,"");
    }
    if (data.indexOf('_') != -1) {
        const [command, args] = data.split('_');
        doCommand(chatId, userId, command,args)
    }
});


// Голосування ////////////////////////////////////////

const GROUP_ID = process.env.GROUP_ID
const POLL_HOUR = process.env.POLL_HOUR || 16
const POLL_MINUTES = process.env.POLL_MINUTES || 0
const POLL_COLLECT_HOUR = process.env.POLL_COLLECT_HOUR
const POLL_COLLECT_MINUTES = process.env.POLL_COLLECT_MINUTES
const DAYS_OF_WEEK = process.env.DAYS_OF_WEEK || 10
  ? process.env.DAYS_OF_WEEK.split(',').map(day => parseInt(day))
  : [];

const questions = ['Как жизнь бродяга?'];
const options = ["Магазин", "Пошта", "Парк", "Бігати"];

let pollData = {
  pollId: null,
  votes: {}, 
};

const getActivePoll = async () => {
  try {
    const response = await axios.get(`${API_URL}/poll/active`);
    console.log(response.data.pollId);
    console.log(response.data.votes);
    pollData.pollId = response.data.pollId;
    pollData.votes = JSON.parse(response.data.votes);
  } catch (error) {
    console.error('Помилка запиту отримання активного голосування:', error.message);
  }
}
(async () => {
  await getActivePoll();
})();

const collect = schedule.scheduleJob({ hour: POLL_COLLECT_HOUR, minute: POLL_COLLECT_MINUTES, dayOfWeek: DAYS_OF_WEEK }, async () => {
  const response = await axios.get(`${API_URL}/poll/stop`);
  pollData.pollId = response.data.pollId;
  pollData.votes = JSON.parse(response.data.votes);
  if (!pollData.pollId) {
    bot.sendMessage(GROUP_ID, "Немає активного голосування для збору даних.");
    return;
  }

  try {
    
    const results = options.map((option, index) => {
      const userIds = Object.entries(pollData.votes)
        .filter(([_, optionIds]) => optionIds.includes(index))
        .map(([userId]) => userId);
      return { option, userIds };
    });

    const responses = await Promise.all(
      results.map(async (result) => {  
        const response = await axios.post(`${API_URL}/poll`, result);
        return { option: result.option, lastNames: response.data.lastNames };
      })
    );

    for (const response of responses) {
      if(response.lastNames.length > 0){
        let message = `${response.option}:\n` +
        response.lastNames.join('\n');
        if(response.option==='Магазин'){
          message = 'Дозвольте:\n' + message;
        }
        await bot.sendMessage(GROUP_ID, message);
      }
    }

  } catch (error) {
    console.error("Помилка під час обробки голосування:", error.message);
  } finally {
    
    pollData = { pollId: null, votes: {} };
  }
});

const createPoll = schedule.scheduleJob({ hour: POLL_HOUR, minute: POLL_MINUTES, dayOfWeek: DAYS_OF_WEEK }, () => {
  const question = questions[Math.floor(Math.random() * questions.length)];

  bot.sendPoll(GROUP_ID, question, options, {
    is_anonymous: false, 
  }).then(async (poll) => {
    pollData.pollId = poll.poll.id; 
    pollData.votes = {}; 

    console.log("Голосування створено:", poll.poll.id);
    const response = await axios.put(`${API_URL}/poll/update`, {
      pollId: poll.poll.id,
      votes: JSON.stringify(pollData.votes),
    });
    setTimeout(() => {
      collectPollData();
    }, POLL_EXPIRETIME * 1000); 
  }).catch((error) => {
    console.error("Помилка надсилання голосування:", error.message);
  });
});




bot.on('poll_answer', async (pollAnswer) => {
    const { user, option_ids } = pollAnswer;
    await getActivePoll();
    pollData.votes[user.id] = option_ids;
    if(pollData.pollId){
      const response = await axios.put(`${API_URL}/poll/update`, {
        pollId: pollData.pollId,
        votes: JSON.stringify(pollData.votes),
      });
    }
  const cadet = await getCadet(user.id);
  console.log(`Користувач ${cadet.lastName} проголосував за: ${option_ids}`);
});

// Перевірка світла ////////////////////////////////////////

// let lastOffTimes;
// const LIGHT_CHECK = process.env.LIGHT_CHECK || 1800
// console.log(`Інтервал оновлення даних про світло: ${LIGHT_CHECK} секунд`);
// const checkScheduleChanges = async () => {
//   console.log('Перевірка світла...');
//   const response = await axios.get(`${API_URL}/light`);
//   if(response.data || !(response.data.trim() === "")){
//     const currentOffTimes = JSON.parse(response.data.light) || [];
//     const date = response.data.date;
//     if (JSON.stringify(currentOffTimes) !== JSON.stringify(lastOffTimes)) {
//         bot.sendMessage(GROUP_ID, `Години відключень на ${date}:\n${currentOffTimes.join('\n')}`);
//         lastOffTimes = currentOffTimes;
//     }
//   }
// };
// setInterval(checkScheduleChanges, LIGHT_CHECK * 1000);

bot.on('polling_error', (error) => console.error('Polling Error:', error));
