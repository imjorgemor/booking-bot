import cron from 'node-cron';
import { DAY_DEFINITIONS } from './config.js';
import { runBookAsync } from './book.js';

// state
let currentCronJobs = [];
const username = process.env.USERNAME_P;
const password = process.env.PASSWORD_P;

const updateCronSchedule = async () => {
    try {
        //get data
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRA3XJDvMjOlJle2aIsxIBxfvxs8kYDx3ZMNzLzvETZnK06EHFZ4HC-d153Ks5JqQZIB49sI_lH568A/pub?gid=0&single=true&output=csv');
        const data = await response.text();
        const row = data.split('\n')[3].split('\r')[0].split(',');
        const row2 = data.split('\n')[7].split('\r')[0].split(',');
        const [, day, hour] = row
        const [, day1, hour1] = row2;
        // Stop all current cron jobs
        currentCronJobs.forEach(job => job.stop());
        currentCronJobs = []; // Reset jobs array
        // Create new cron jobs
        const schedules = [{ day: day, hour: hour }, { day: day1, hour: hour1 }];
        schedules.forEach((schedule, index) => {
            const cronExpression = DAY_DEFINITIONS[schedule.day]
            const job = cron.schedule(cronExpression, () => {
                console.log(`Running booking ${username} #${index + 1} at ${new Date().toISOString()}...`);
                runBookAsync(username, password, schedule.hour);
            });
            currentCronJobs.push(job);
            console.log(`Scheduling booking #${index + 1} for for ${username} on ${schedule.day} at ${schedule.hour} with cron: ${cronExpression}`);
        })
    } catch (error) {
        console.error('Failed to update cron schedule P:', error);
    }
};

cron.schedule('0 22 * * *', async () => {
    console.log(`Updating cron schedules for ${username} at ${new Date().toISOString()}`);
    await updateCronSchedule();
}, {
    timezone: 'Europe/Madrid'
});

updateCronSchedule();

