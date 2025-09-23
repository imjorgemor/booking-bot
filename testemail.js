import nodemailer from 'nodemailer';


const getTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.USERNAME_J,
    pass: process.env.GMAIL_PASS
  },
});

const transporter = getTransporter();
transporter.sendMail({
  from: process.env.USERNAME_J,
  to: [process.env.USERNAME_J],
  subject: 'YOUS A BITCH! RESERVA CONFIRMADA',
  text: `YO PERRA! RESERVA CONFIRMADA`,
});