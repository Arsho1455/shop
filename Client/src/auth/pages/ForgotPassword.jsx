import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import Icon from '../components/Icons.jsx';
import { api } from '../lib/api.js';

export default function ForgotPassword() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await api('/api/auth/forgot-password', {
        method: 'POST', body: { email, language },
      });
      setMessage(result.message);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <main className="simple-page password-reset-page"><div className="simple-card">
    <div className="large-icon success-icon"><Icon name="mail" size={31}/></div>
    <div className="eyebrow small">{t('ՀԱՇՎԻ ՎԵՐԱԿԱՆԳՆՈՒՄ')}</div>
    <h1>{t('Մոռացե՞լ ես գաղտնաբառը')}</h1>
    <p>{t('Մուտքագրիր գրանցված էլ. հասցեն՝ գաղտնաբառի վերականգնման հղում ստանալու համար։')}</p>
    <form className="auth-form" onSubmit={submit}>
      <label className="field"><span>{t('Էլ. հասցե')}</span><div className="input-wrap">
        <Icon name="mail" size={19}/><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required/>
      </div></label>
      {error && <div className="alert error" role="alert">{t(error)}</div>}
      {message && <div className="alert success" role="status">{t(message)}</div>}
      <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? t('Ուղարկվում է...') : t('Ուղարկել վերականգնման հղումը')} <Icon name="arrow" size={18}/></button>
    </form>
    <Link className="text-button back-button" to="/auth?mode=login"><Icon name="back" size={17}/> {t('Վերադառնալ մուտքին')}</Link>
  </div></main>;
}
