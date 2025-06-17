import playwright from 'playwright';
import nodemailer from 'nodemailer';
import { htmlTemplate } from './template.js';

//CONF EMAIL
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.USERNAME_J,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        accessToken: process.env.GOOGLE_ACCESS_TOKEN,
    },
});

function sendEmail(){
    transporter.sendMail({
        from: process.env.USERNAME_J,
        to: [process.env.USERNAME_J], 
        subject: 'EMAIL DE PRUEBA. YOUS A BITCH! RESERVA CONFIRMADA. ',
        text: `YO PERRA! RESERVA CONFIRMADA a nombre de ${"my name"}: el dia ${"my date"} a las ${"my hour"} y en la pishta ${"PISTA"}! Tom cómeme los huevos`,
        html: htmlTemplate("pablito chupame los huevos", "PISTA PADEL 1", "cuando YO quiera", "12:00")
    });
}
sendEmail();