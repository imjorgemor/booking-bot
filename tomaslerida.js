import cron from 'node-cron';
import { WEEKDAYS } from "./config.js";
import { runBookAsync } from "./runbook.js";

let currentCronJobs = [];

const { USERNAME_T, PASSWORD_T } = process.env;

const updateCronSchedule = async () => {
    try {
        //get data
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRA3XJDvMjOlJle2aIsxIBxfvxs8kYDx3ZMNzLzvETZnK06EHFZ4HC-d153Ks5JqQZIB49sI_lH568A/pub?gid=0&single=true&output=csv');
        const data = await response.text();
        const row = data.split('\n')[2].split('\r')[0].split(',');
        const row2 = data.split('\n')[6].split('\r')[0].split(',');
        const [, day, hour] = row
        const [, day1, hour1] = row2;
        // Stop all current cron jobs
        currentCronJobs.forEach(job => job.stop());
        currentCronJobs = []; // Reset jobs array
        // Create new cron jobs
        const schedules = [{ day: day, hour: hour }, { day: day1, hour: hour1 }];
        schedules.forEach((schedule, index) => {
            const cronExpression = WEEKDAYS[schedule.day]
            const job = cron.schedule(cronExpression, () => {
                console.log(`Running booking TOMAS #${index + 1} at ${new Date().toISOString()}...`);
                runBookAsync(USERNAME_T, PASSWORD_T, schedule.hour);
            });
            currentCronJobs.push(job);
            console.log(`Scheduling booking #${index + 1} for #TOMAS on ${schedule.day} at ${schedule.hour} with cron: ${cronExpression}`);
        })
    } catch (error) {
        console.error('Failed to update cron schedule TOMAS:', error);
    }
};

cron.schedule('0 23 * * *', () => {
    console.log(`Updating cron schedules at ${new Date().toISOString()}`);
    updateCronSchedule();
}, {
    timezone: 'Europe/Madrid'
});

updateCronSchedule();