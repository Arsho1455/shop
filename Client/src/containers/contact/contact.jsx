import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { api } from '../../auth/lib/api.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './contact.css';

export const ContactPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((previous) => ({
        ...previous,
        name: previous.name || user.name || '',
        email: previous.email || user.email || '',
      }));
    }
  }, [user]);

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (notice) setNotice(null);
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setNotice(null);
    try {
      const response = await api('/api/contact', { method: 'POST', body: form });
      setNotice({ kind: 'success', text: response.message || t("Հաղորդագրությունն ուղարկված է։") });
      setForm((previous) => ({ ...previous, message: '', website: '' }));
    } catch (error) {
      setNotice({ kind: 'error', text: error.message || t("Չհաջողվեց ուղարկել հաղորդագրությունը։") });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="ph-contact-page"><div className="contact-page-atmosphere" aria-hidden="true"/><div className="shop-container">
      <div className="ph-contact-heading">
        <span className="shop-eyebrow"><ShopIcon name="sparkle" size={15} /> {t("ՄԻՇՏ ՔՈ ԿՈՂՔԻՆ")}</span>
        <h1>{t("Ունե՞ս հարց։")} <span>{t("Գրիր մեզ։")}</span></h1>
        <p>{t("Օգնության կարիք ունե՞ս հեռախոս ընտրելիս։ Մենք պատրաստ ենք օգնել։")}</p>
      </div>
      <div className="ph-contact-grid">
        <section className="ph-contact-highlight">
          <div className="contact-sculpture" data-tilt aria-hidden="true"><div className="contact-sculpture-orbit"/><div className="contact-message-object"><span className="contact-message-back"/><div className="contact-message-letter"><span>phoneShop<span>↗</span></span><i/><i/><i/><b>✦</b></div><div className="contact-envelope"><span/><i/></div><span className="contact-message-star">✳</span></div><span className="contact-art-coordinate">PH / ALWAYS CONNECTED</span></div>
          <span className="ph-contact-eyebrow">{t("ՄԵՆՔ ԿԱՊԻ ՄԵՋ ԵՆՔ")}</span>
          <h2>{t("Լավ ընտրությունը սկսվում է լավ խորհրդից։")}</h2>
          <p>{t("Պատմիր՝ ինչ հեռախոս ես փնտրում, և մենք կօգնենք կողմնորոշվել։")}</p>
          <div className="ph-contact-details">
            <div><span><ShopIcon name="location" size={19} /></span><div><b>{t("Գտնվելու վայրը")}</b><small>{t("Երևան, Հայաստան")}</small></div></div>
            <div><span><ShopIcon name="shield" size={19} /></span><div><b>{t("Հուսալի սպասարկում")}</b><small>{t("Անհատական մոտեցում յուրաքանչյուր հարցին")}</small></div></div>
          </div>
          <Link to="/#products" className="ph-contact-back">{t("Տեսնել ապրանքները")} <ShopIcon name="arrowRight" size={19} /></Link>
        </section>
        <section className="ph-contact-form-card">
          <span className="shop-eyebrow">{t("ԿԱՊ ՀԱՍՏԱՏԵԼ")}</span>
          <h2>{t("Ուղարկիր հաղորդագրություն")}</h2>
          <p>{t("Օգնության կարիք ունե՞ս հեռախոս ընտրելիս։ Մենք պատրաստ ենք օգնել։")}</p>
          <form onSubmit={sendMessage}>
            <label htmlFor="contact-name">{t("Քո անունը")}
              <input id="contact-name" autoComplete="name" name="name" value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={60} minLength={2} placeholder={t("Ինչպե՞ս դիմենք քեզ")} required />
            </label>
            <label htmlFor="contact-email">{t("Քո էլ. հասցեն")}
              <input id="contact-email" type="email" autoComplete="email" name="email" value={form.email} onChange={(event) => update('email', event.target.value)} maxLength={254} placeholder="example@gmail.com" required />
            </label>
            <label htmlFor="contact-message">{t("Հաղորդագրություն")}
              <textarea id="contact-message" name="message" value={form.message} onChange={(event) => update('message', event.target.value)} rows={6} placeholder={t("Ինչո՞վ կարող ենք օգնել")} minLength={5} maxLength={2000} required />
            </label>
            <div className="ph-contact-honeypot" aria-hidden="true">
              <label htmlFor="contact-website">{t("Կայք (դատարկ թողնել)")}
                <input id="contact-website" name="website" type="text" value={form.website} onChange={(event) => update('website', event.target.value)} autoComplete="off" tabIndex={-1} />
              </label>
            </div>
            {notice && <p className={`ph-contact-notice ph-contact-notice--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'} aria-live="polite">{t(notice.text)}</p>}
            <button type="submit" className="shop-btn-primary" disabled={sending}>
              <span>{sending ? t("Ուղարկվում է…") : t("Ուղարկել հաղորդագրությունը")}</span><i><ShopIcon name="arrowRight" size={19}/></i>
            </button>
          </form>
        </section>
      </div>
    </div></main>
  );
};
