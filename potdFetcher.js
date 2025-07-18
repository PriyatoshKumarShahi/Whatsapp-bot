const axios = require('axios');
const cheerio = require('cheerio');
const MessageLog = require('./models/messageLog');
const moment = require('moment'); 

async function getGFGPOTD() {
    try {
        const response = await axios.get('https://practice.geeksforgeeks.org/problem-of-the-day', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const $ = cheerio.load(response.data);
        const potdLink = $('div.potd_widget a[href^="/problem-of-the-day"]').attr('href') ||
                         $('a.text-dark[href^="/problem-of-the-day"]').attr('href') ||
                         $('a[href*="problem-of-the-day"]').attr('href');

        const fullLink = potdLink ? 'https://practice.geeksforgeeks.org' + potdLink : null;

        return fullLink || 'GFG POTD link not found';
    } catch (error) {
        console.error('Error fetching GFG POTD:', error.message);
        return 'GFG POTD not available';
    }
}

async function getLeetCodePOTD() {
    try {
        const res = await axios.post('https://leetcode.com/graphql/', {
            query: `
                query questionOfToday {
                    activeDailyCodingChallengeQuestion {
                        question {
                            titleSlug
                        }
                    }
                }
            `
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com/problemset/all/',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const slug = res.data?.data?.activeDailyCodingChallengeQuestion?.question?.titleSlug;
        return slug ? `https://leetcode.com/problems/${slug}/` : 'LeetCode POTD link not found';
    } catch (error) {
        console.error('Error fetching LeetCode POTD:', error.message);
        return 'LeetCode POTD not available';
    }
}

async function fetchAndLogPOTD(groupName = 'Default Group') {
    const today = moment().format('YYYY-MM-DD');

    const alreadyLogged = await MessageLog.findOne({ date: today, groupName });
    if (alreadyLogged) {
        console.log(`⚠️ POTD already sent to '${groupName}' on ${today}. Skipping.`);
        return alreadyLogged;
    }

    const gfgLink = await getGFGPOTD();
    const leetcodeLink = await getLeetCodePOTD();

    const newLog = await MessageLog.create({
        date: today,
        time: moment().format('HH:mm:ss'),
        groupName,
        gfgLink,
        leetcodeLink
    });

    console.log('✅ POTD fetched and logged successfully.');
    return newLog;
}

module.exports = {
    getGFGPOTD,
    getLeetCodePOTD,
    fetchAndLogPOTD
};
