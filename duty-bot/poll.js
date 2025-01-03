require('dotenv').config();

const GROUP_ID = process.env.GROUP_ID;
const POLL_HOUR = process.env.POLL_HOUR || 16;
const POLL_MINUTES = process.env.POLL_MINUTES || 0;
const POLL_COLLECT_HOUR = process.env.POLL_COLLECT_HOUR;
const POLL_COLLECT_MINUTES = process.env.POLL_COLLECT_MINUTES;
const DAYS_OF_WEEK = process.env.DAYS_OF_WEEK || 10
    ? process.env.DAYS_OF_WEEK.split(',').map(day => parseInt(day))
    : [];

const questions = ['Как жизнь бродяга?'];
const options = ["Магазин", "Пошта", "Парк", "Бігати"];

let pollData = {
    pollId: null,
    votes: [
        {option: 'Магазин', userIds: [] },
        {option: 'Пошта', userIds: [] },
        {option: 'Парк', userIds: [] },
        {option: 'Бігати', userIds: [] }
    ]
};

function setPollId(pollId){
    pollData.pollId = pollId;
}

function addVote(answer) {
    pollData.votes[answer.choice].userIds.push(answer.userId);
}

function clearPoll() {
    pollData = {
        pollId: null,
        votes: [
            {option: 'Магазин', userIds: [] },
            {option: 'Пошта', userIds: [] },
            {option: 'Парк', userIds: [] },
            {option: 'Бігати', userIds: [] }
        ]
    };
}

function isActive(){
    return !!pollData.pollId;
}

module.exports = {
    GROUP_ID,
    POLL_HOUR,
    POLL_MINUTES,
    POLL_COLLECT_HOUR,
    POLL_COLLECT_MINUTES,
    DAYS_OF_WEEK,
    questions,
    options,
    pollData,
    addVote,
    clearPoll,
    setPollId,
    isActive
}