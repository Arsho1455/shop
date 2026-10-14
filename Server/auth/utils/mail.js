import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { escapeContactHtml } from './contact.js';

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: { user: config.smtpUser, pass: config.smtpPass },
  connectionTimeout: 15000,
  socketTimeout: 20000,
});

// Verification emails match the language selected during registration/resend.
const verificationCopy = {
  hy: {
    subject: 'Հաստատիր քո էլ. հասցեն • PhoneShop',
    title: 'Հաստատիր քո էլ. հասցեն',
    intro: 'Գրանցումն ավարտելու համար սեղմիր ներքևի կոճակը։ Հղումը գործում է 24 ժամ։',
    button: 'Հաստատել էլ. հասցեն →',
    ignore: 'Եթե սա դու չես արել, պարզապես անտեսիր այս նամակը։',
  },
  ru: {
    subject: 'Подтверди свой email • PhoneShop',
    title: 'Подтверди свой email',
    intro: 'Чтобы завершить регистрацию, нажми кнопку ниже. Ссылка действует 24 часа.',
    button: 'Подтвердить email →',
    ignore: 'Если ты не регистрировался, просто проигнорируй это письмо.',
  },
  en: {
    subject: 'Verify your email • PhoneShop',
    title: 'Verify your email address',
    intro: 'Click the button below to complete registration. This link is valid for 24 hours.',
    button: 'Verify email →',
    ignore: 'If you did not register, simply ignore this email.',
  },
};

export async function sendVerificationEmail(email, token, language = 'hy') {
  if (!config.smtpUser || !config.smtpPass) {
    throw new Error('SMTP_USER/SMTP_PASS կամ send_mail/send_mail_password բացակայում են Server/.env-ում։');
  }
  const lang = Object.hasOwn(verificationCopy, language) ? language : 'hy';
  const copy = verificationCopy[lang];
  // Verification token remains in URL fragment, not in request URL or server logs.
  const verificationUrl = `${config.frontendUrl}/verify-email?lang=${lang}#token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: config.smtpFrom,
    to: email,
    subject: copy.subject,
    text: `${copy.title}\n\n${copy.intro}\n\n${verificationUrl}\n\n${copy.ignore}`,
    html: `
      <div lang="${lang}" style="background:#090e1b;padding:42px 20px;font-family:Arial,sans-serif;color:#ecf1ff">
        <div style="max-width:490px;margin:auto;padding:36px;border:1px solid #303a55;border-radius:22px;background:#121a2c">
          <div style="font-size:22px;font-weight:800;margin-bottom:24px">✦ PhoneShop</div>
          <h1 style="font-size:26px;line-height:1.3">${copy.title}</h1>
          <p style="color:#aebbd3;line-height:1.7">${copy.intro}</p>
          <a href="${verificationUrl}" style="display:inline-block;background:#8365f5;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin:16px 0">${copy.button}</a>
          <p style="color:#8491aa;font-size:12px;line-height:1.6">${copy.ignore}</p>
        </div>
      </div>`,
  });
}

// Always send FROM our authenticated mailbox. Customer's address is only Reply-To;
// using the customer's address as From would break SPF/DMARC checks.
export async function sendContactEmail({ name, email, message }) {
  if (!config.smtpUser || !config.smtpPass || !config.contactToEmail) {
    throw new Error('Contact SMTP / recipient are not configured in Server/.env');
  }

  const safeName = escapeContactHtml(name);
  const safeEmail = escapeContactHtml(email);
  const safeMessage = escapeContactHtml(message).replace(/\r?\n/g, '<br/>');

  await transporter.sendMail({
    from: config.smtpFrom,
    to: config.contactToEmail,
    replyTo: { name, address: email },
    subject: 'Նոր հաղորդագրություն • PhoneShop կայքից',
    text: `Նոր հաղորդագրություն PhoneShop-ից\n\nԱնուն՝ ${name}\nEmail՝ ${email}\n\nՀաղորդագրություն՝\n${message}`,
    html: `
      <div style="padding:32px 18px;background:#f6f7fd;font-family:Arial,sans-serif;color:#242641">
        <div style="max-width:580px;margin:auto;padding:28px;border-radius:20px;background:#fff;border:1px solid #e9e8f1">
          <h2 style="color:#6255e8;margin-top:0">Նոր հաղորդագրություն PhoneShop-ից</h2>
          <p><b>Անուն՝</b> ${safeName}</p>
          <p><b>Email՝</b> ${safeEmail}</p>
          <div style="border-top:1px solid #e9e8f1;padding-top:14px;margin-top:20px;white-space:normal;line-height:1.8;overflow-wrap:anywhere">${safeMessage}</div>
        </div>
      </div>`,
  });
}
