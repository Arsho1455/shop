import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { sendContactEmail } from '../utils/mail.js';
import { parseContactMessage } from '../utils/contact.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Շատ հաղորդագրություններ են ուղարկվել։ Փորձիր մեկ ժամից։' },
});

// Public contact form: no account required. Rate limit + hidden honeypot field.
router.post('/', contactLimiter, async (req, res) => {
  const data = parseContactMessage(req.body);
  if (data.error) return res.status(400).json({ message: data.error });

  // Ignore automated spam without exposing honeypot detection to spambots.
  if (data.website) return res.json({ message: 'Հաղորդագրությունն ընդունված է։' });

  try {
    await sendContactEmail(data);
    return res.json({ message: 'Հաղորդագրությունը հաջողությամբ ուղարկվեց։ Շուտով կպատասխանենք։' });
  } catch (error) {
    console.error('Contact email send failed:', error.message);
    return res.status(502).json({ message: 'Նամակը չհաջողվեց ուղարկել։ Փորձիր մի փոքր ուշ։' });
  }
});

export default router;
