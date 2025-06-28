import nodemailer from 'nodemailer';
import { htmlTemplate } from './template.js';

//CONF EMAIL
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.USERNAME_J,
    pass: process.env.GMAIL_PASS
  },
});

function sendEmail() {
  transporter.sendMail({
    from: process.env.USERNAME_J,
    to: [process.env.USERNAME_J, process.env.USERNAME_P, process.env.USERNAME_T], 
    subject: 'EMAIL DE PRUEBA. YOUS A BITCH! RESERVA CONFIRMADA. ',
    text: `YO PERRA! RESERVA CONFIRMADA a nombre de ${"my name"}: el dia ${"my date"} a las ${"my hour"} y en la pishta ${"PISTA"}! Tom cómeme los huevos`,
    html: htmlTemplate("pablito chupame los huevos", "PISTA PADEL 1", "cuando YO quiera", "12:00")
  });
}
sendEmail();