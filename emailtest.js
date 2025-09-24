import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

(async function () {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_EMAIL,
    to: 'imjorgemor@gmail.com',
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();