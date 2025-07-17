const axios = require('axios');
const cheerio = require('cheerio');

async function getGFGPOTD() {
    try {
        const response = await axios.get('https://practice.geeksforgeeks.org/problem-of-the-day', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        const potdLink = $('div.potd_widget a[href^="/problem-of-the-day"]').attr('href') || 
                         $('a.text-dark[href^="/problem-of-the-day"]').attr('href') ||
                         $('a[href*="problem-of-the-day"]').attr('href');
        
        return potdLink ? 'https://practice.geeksforgeeks.org' + potdLink : ' GFG POTD link not found';
    } catch (error) {
        console.error(' Error fetching GFG POTD:', error.message);
        return ' GFG POTD not available';
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
        return slug ? `https://leetcode.com/problems/${slug}/` : ' LeetCode link not found';
    } catch (error) {
        console.error(' Error fetching LeetCode POTD:', error.message);
        return ' LeetCode POTD not available';
    }
}

module.exports = { getGFGPOTD, getLeetCodePOTD };