import playwright from 'playwright';
import cron from 'node-cron';
// CONFIGURATION
//remember if bookings are at 23 utc, cron must start at 22:58 💾
// 58 21 summer time // 58 22 winter time
const WEEKDAYS = {
    SUNDAY: '58 21 * * 3', //sunday 23.59 => jueves
    MONDAY: '58 21 * * 4', //monday 23.59 => viernes
    TUESDAY: '58 21 * * 5', // tuesday 23.59 => sabado
    WEDNESDAY: '58 21 * * 6', // wednesday 23.59 => domingo
    THURSDAY: '58 21 * * 0', // thursday 23.59 => lunes
    FRIDAY: '58 21 * * 1', // friday 23.59 => martes
    SATURDAY: '58 21 * * 2' // saturday 23.59 => miercoles
}

const { USERNAME_J, USERNAME_P, USERNAME_T, PASSWORD_J, PASSWORD_P, PASSWORD_T } = process.env

const PROFILES = [
    { username: USERNAME_J, password: PASSWORD_J, dayOne: 1, dayTwo: 5 },
    { username: USERNAME_T, password: PASSWORD_T, dayOne: 2, dayTwo: 6 },
    { username: USERNAME_P, password: PASSWORD_P, dayOne: 3, dayTwo: 7 },
];

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRA3XJDvMjOlJle2aIsxIBxfvxs8kYDx3ZMNzLzvETZnK06EHFZ4HC-d153Ks5JqQZIB49sI_lH568A/pub?gid=0&single=true&output=csv';

const BROWSER_TYPE = 'chromium';

// GLOBAL STATE
let currentCronJobs = [];
let browser = null;

// BROWSER MANAGEMENT
async function getBrowser() {
    if (!browser) {
        browser = await playwright[BROWSER_TYPE].launch({
            headless: true,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-extensions'
            ]
        });
    }
    return browser;
}

async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}

// RUN BOOKING
const runBookAsync = async ({ username, password, hour = '12:00' }) => {
    try {
        console.log(`start booking ${user}2 at ${new Date().toISOString()}...`);
        const browser = await getBrowser();
        const context = await browser.newContext();
        const page = await context.newPage();
        // Navigate to the login page
        await page.goto('https://clubmetropolitan.com/socios/login?referer=%2Fsocios%2Fperfil%2F');
        // Perform login and redirect to book page
        await page.fill('#email', username); // Replace with actual selector
        await page.fill('#pwd', password); // Replace with actual selector
        await page.click('#wp-submit'); // Replace with actual selector
        await page.waitForSelector('.mkdf-st-title');
        console.log('login ok')
        await page.getByText('Accede para reservar tus clases y pistas').click();
        await page.waitForSelector('#dateAACC');
        await page.goto('https://clubmetropolitan.provis.es/Reservas/ActividadesLibresHorariosZonas?idActividadLibre=137&integration=False')
        console.log('redirect to booking page ok')
        // open date selector
        await page.waitForSelector('#dateAALL');
        await page.click('#dateAALL');

        // Create a Date object for today (remember server is one day before)
        const date = new Date();
        // Add [number] days to the current date remember reservation is made one day before
        // put 4 days because reservation is made in utc time 
        date.setDate(date.getDate() + 4);
        // convert the updated Date object to a localized date string if needed
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        // Convert the updated Date object to a localized date string if needed
        const dateSelector = `[data-day="${formattedDate}"]`
        //search today date format date DD/MM/YYYY
        await page.waitForSelector(dateSelector);
        await page.click(dateSelector)
        await page.waitForSelector('.hour-collapse')

        // Calculate buffer time to wait until midnight, new date return utc date
        const now = new Date();
        const midnightSpain = new Date();
        //Set time to midnight i 00-1 hour spain + 0.5 seconds in Spain's local time (UTC+1)
        midnightSpain.setUTCHours(23, 0, 0, 100); // 23:00:00.250 UTC, equivalent to 00:00:00.250 in Spain (UTC+1)
        // Adjust for the next day if it's already past midnight in Spain
        if (now.getTime() >= midnightSpain.getTime()) {
            midnightSpain.setUTCDate(midnightSpain.getUTCDate() + 1);
        }
        // Calculate the time difference
        const timeToWait = midnightSpain.getTime() - now.getTime();
        await new Promise(resolve => setTimeout(resolve, timeToWait));

        // make reservations exact hour[set the hour of reservation]
        await page.click(`[data-content="${hour}"]`)
        await page.waitForSelector("#btnReserva")
        await page.click("#btnReserva")
        await page.waitForSelector("#btnConfirmar")
        await page.click("#btnConfirmar")
        await page.waitForSelector(".swal-icon--success")
        console.log('reserva confirmada J:' + formattedDate + " a las " + hour)
        await closeBrowser();
    } catch (error) {
        console.log('no se ha completado la reserva error:' + error)
    }
};

// GET USER DATA
async function registerCronSchedules() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const data = await response.text();
        //get schedules
        const userSchedules = PROFILES.map(profile => {
            const row = data.split('\n')[profile.dayOne].split('\r')[0].split(',');
            const row2 = data.split('\n')[profile.dayTwo].split('\r')[0].split(',');
            const [, day, hour] = row;
            const [, day1, hour1] = row2;
            return {
                username: profile.username,
                password: profile.password,
                schedules: [{ day: day, hour: hour }, { day: day1, hour: hour1 }]
            };
        })
        //stop cron jobs
        currentCronJobs.forEach(job => job.stop());
        currentCronJobs = []; // Reset jobs array
        //schedule cron jobs
        userSchedules.forEach((schedule) => {
            const { username, password, schedules } = schedule;
            schedules.forEach((schedule, index) => {
                const cronExpression = WEEKDAYS[schedule.day];
                const job = cron.schedule(cronExpression, () => {
                    runBookAsync(username, password, schedule.hour);
                });
                currentCronJobs.push(job);
                console.log(`Scheduling booking #${index + 1} for ${username} on ${schedule.day} at ${schedule.hour} with cron: ${cronExpression}`);
            })
        })
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
}

cron.schedule('0 23 * * *', () => {
    console.log(`Updating cron schedules at ${new Date().toISOString()}`);
    registerCronSchedules();
}, {
    timezone: 'Europe/Madrid'
});

registerCronSchedules();
