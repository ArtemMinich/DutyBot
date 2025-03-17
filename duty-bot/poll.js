const axios = require("axios");
require('dotenv').config();

const API_URL = process.env.API_URL;
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

function toDto(){
    return {
        pollId: pollData.pollId,
        votes: JSON.stringify(pollData.votes)
    }
}

function getPoll() {
    return pollData;
}

function setPollId(pollId){
    pollData.pollId = pollId;
}

async function createPoll(pollId){
    setPollId(pollId);
    const response = await axios.post(`${API_URL}/poll`,toDto());
    return response.data;
}

async function addVote(answer) {
    pollData.votes[answer.choice[0]].userIds.push(answer.userId);
    const response = await axios.patch(`${API_URL}/poll`,toDto());
    return response.data;
}

async function removeVote(userId) {
    pollData.votes.forEach(vote => {
    vote.userIds = vote.userIds.filter(id => id !== userId);
    });
    const response = await axios.patch(`${API_URL}/poll`,toDto());
    return response.data;
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

async function stopPoll() {
    clearPoll();
    await axios.delete(`${API_URL}/poll`);

}

async function isActive(){
    const response = await axios.get(`${API_URL}/poll`);
    if(response.data === '') return false;
    pollData = {
        pollId: response.data.pollId,
        votes: JSON.parse(response.data.votes)
    };
    return true;
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
    getPoll,
    addVote,
    removeVote,
    stopPoll,
    createPoll,
    isActive
}