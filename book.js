import playwright from 'playwright';
const browserType = 'chromium'; // chrome

export const runBookAsync = async (username, password, hour = '12:00') => {
    try {
        console.log(`start booking ${username} at ${new Date().toISOString()}...`);
        const browser = await playwright[browserType].launch({
            headless: true,
            //new
        });
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
        //accept cookies banner
        await page.waitForSelector('#btnCookiesTodas');
        await page.click('#btnCookiesTodas');
        console.log('accept cookies ok')
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
        await page.waitForSelector(`[data-content="${hour}"]`)
        console.log('check hour available before midnight')
        // Calculate buffer time to wait until midnight, new date return utc date
        const now = new Date();
        const midnightSpain = new Date();
        //Set time to midnight i 00-1 hour spain + 0.5 seconds in Spain's local time (UTC+1)
        midnightSpain.setUTCHours(22, 0, 0, 100); // 23:00:00.250 UTC winter time// 22 utc summer time, equivalent to 00:00:00.100 in Spain (UTC+1)
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
        console.log(`reserva enviada ${username} :` + formattedDate + " a las " + hour)
        await page.waitForSelector(".swal-icon--success")
        console.log(`reserva confirmada ${username} :` + formattedDate + " a las " + hour)
        await browser.close();
    } catch (error) {
        console.log('no se ha completado la reserva error:' + error)
    }
};