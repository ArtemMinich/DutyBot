require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

const sessionFile = './session.txt';

const API_ID = parseInt(process.env.TELEGRAM_API_ID, 10);
const API_HASH = process.env.TELEGRAM_API_HASH;
const API_URL = process.env.API_URL;
const QUEUE_NUMBER = process.env.QUEUE_NUMBER || '3';
const SEMIQUEUE_NUMBER = process.env.SEMIQUEUE_NUMBER || 'II';
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;

let lastSavedMessage = '';
const sessionData = fs.existsSync(sessionFile) ? fs.readFileSync(sessionFile, 'utf-8') : '';
const stringSession = new StringSession(sessionData);
const lightOffs = [];
const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
});

const queueRegex = new RegExp(
    `■ ${QUEUE_NUMBER} черга \\(${SEMIQUEUE_NUMBER} підчерга\\) ([\\d:,\-\\s]+)`,
    'g'
);

const dateRegex = new RegExp('\\d{1,2} [а-яіїєґ]+', 'gi')
 

const fetchLastMessage = async () => {
    try {
        const messages = await client.getMessages(CHANNEL_USERNAME, { limit: 1 });
        const lastMessage = messages[0]?.message || '';

        if (lastMessage !== lastSavedMessage) {
            lastSavedMessage = lastMessage;
            console.log(`[${new Date().toLocaleTimeString()}] Оновлене повідомлення: ${lastSavedMessage}`);
            const matches = [...lastMessage.matchAll(queueRegex)];
            const date = lastMessage.match(dateRegex)[0];
            if (matches.length > 0) {
                const lightOffs = matches.map(match => match[1]);
                const splitHours = lightOffs.flatMap(hours => hours.split(',').map(hour => hour.trim()));
                console.log(`Знайдені години для "${QUEUE_NUMBER} черги ${SEMIQUEUE_NUMBER} підчерги (${date}):`, splitHours);
                return  {
                    date: date,
                    hours: splitHours
                }
            }
            else {
                console.log(`Для "${QUEUE_NUMBER} черги ${SEMIQUEUE_NUMBER} підчерги" немає даних.`);
            }
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] Повідомлення не змінилося.`);
        }
    } catch (err) {
        console.error('Помилка при отриманні повідомлення:', err.message);
    }
};

(async () => {
    console.log('Авторизація...');
    await client.start({
        phoneNumber: async () => {
            if (!sessionData) {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                return new Promise(resolve => rl.question('Введіть свій номер телефону: ', resolve));
            }
        },
        password: async () => {
            if (!sessionData) {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                return new Promise(resolve => rl.question('Введіть пароль (якщо є): ', resolve));
            }
        },
        phoneCode: async () => {
            if (!sessionData) {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                return new Promise(resolve => rl.question('Введіть код підтвердження: ', resolve));
            }
        },
        onError: (err) => console.log(err),
    });


    console.log('Авторизація завершена.');
    if (!sessionData) {
        fs.writeFileSync(sessionFile, client.session.save(), 'utf-8');
        console.log('Сесія збережена.');
    }

})();

module.exports = fetchLastMessage;