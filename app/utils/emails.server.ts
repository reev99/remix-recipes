import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

export async function sendEmail(
  fromDomain: string,
  fromName: string,
  toEmail: string,
  toName: string,
  subject: string,
  html: string,
) {
  const sentFrom = new Sender(fromDomain, fromName);
  const recipients = [new Recipient(toEmail, toName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setHtml(html);

  return await mailerSend.email.send(emailParams);
}
