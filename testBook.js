import playwright from 'playwright';
import { Resend } from 'resend';

// CONF RESEND
const resend = new Resend(process.env.RESEND_API_KEY);
//CONF CHROMIUM
const browserType = 'chromium'; // chrome

export const runBookAsync = async (username, password, hour = '20:00') => {
  try {
    console.log(`START TEST ${username} at ${new Date().toISOString()}...`);
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
    const date = new Date();
    date.setDate(date.getDate() + 3);
    // // convert the updated Date object to a localized date string if needed
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    // // Convert the updated Date object to a localized date string if needed
    const dateSelector = `[data-day="${formattedDate}"]`
    // //search today date format date DD/MM/YYYY
    await page.waitForSelector(dateSelector);
    await page.click(dateSelector)
    await page.waitForSelector('.hour-collapse')
    // const buttonClick = await page.waitForSelector(`[data-content="${hour}"]`)
    // await buttonClick.innerHTML()
   
    // await page.click(`[data-content="${hour}"]`)
    // await page.waitForSelector("#btnReserva")
    // await page.click("#btnReserva")
    // await page.waitForSelector("#btnConfirmar")
    // await page.click("#btnConfirmar")
    console.log('booking made successfully before midnight')
    // console.log(`reserva enviada ${username} :` + formattedDate + " a las " + hour)
    // await page.waitForSelector(".swal-icon--success")
    // console.log(`reserva confirmada ${username} :` + formattedDate + " a las " + hour)
    await browser.close();
    //SEND EMAIL
    await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: [process.env.USERNAME_P, process.env.USERNAME_T, process.env.USERNAME_J],
      subject: 'YOUS A BITCH! TEST FUNCIONAL CONFIRMADO',
      text: `YOUS A BITCH! TEST FUNCIONAL CONFIRMADO`,
    });
  } catch (error) {
    console.log('HA FALLADO EL TEST:' + error)
    await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: [process.env.USERNAME_P, process.env.USERNAME_T, process.env.USERNAME_J],
      subject: 'YOUS A BITCH! EL TEST HA FALLADO',
      text: `YOUS A BITCH! EL TEST HA FALLADO. Pablo cómeme los huevos`,
    });
  } finally {
    console.log(`TEST CLOSED`)
  }
};

runBookAsync(process.env.USERNAME_J, process.env.PASSWORD_J)
