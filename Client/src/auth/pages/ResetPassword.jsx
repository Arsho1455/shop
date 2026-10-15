import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import Icon from '../components/Icons.jsx';
import { api } from '../lib/api.js';

export default function ResetPassword() {
  const { t } = useLanguage();
  const [token, setToken] = useState(null);
  const parsed = useRef(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (parsed.current) return;
    parsed.current = true;
    const value = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token') || '';
    // Erase the secret from the browser's visible URL/history immediately.
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    setToken(value);
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirm) { setError('Գաղտնաբառերը չեն համընկնում։'); return; }
    setBusy(true);
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: { token, password } });
      setDone(true);
      setToken(''); setPassword(''); setConfirm('');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <main className="simple-page password-reset-page"><div className="simple-card">
    <div className="large-icon success-icon"><Icon name={done ? 'check' : 'lock'} size={31}/></div>
    <div className="eyebrow small">{t('ՀԱՇՎԻ ՎԵՐԱԿԱՆԳՆՈՒՄ')}</div>
    <h1>{done ? t('Գաղտնաբառը փոխված է') : t('Սահմանել նոր գաղտնաբառ')}</h1>
    {done ? <>
      <p>{t('Գաղտնաբառը հաջողությամբ փոխվել է։ Այժմ մուտք գործիր նոր գաղտնաբառով։')}</p>
      <Link className="btn btn-primary btn-block" to="/auth?mode=login">{t('Գնալ մուտքի էջ')} <Icon name="arrow" size={18}/></Link>
    </> : !token && token !== null ? <>
      <div className="alert error" role="alert">{t('Վերականգնման հղումը բացակայում է։ Պահանջիր նոր հղում։')}</div>
      <Link className="btn btn-primary btn-block" to="/forgot-password">{t('Ստանալ նոր հղում')}</Link>
    </> : <>
      <p>{t('Նոր գաղտնաբառը պետք է պարունակի առնվազն 8 նիշ։')}</p>
      <form className="auth-form" onSubmit={submit}>
        <label className="field"><span>{t('Նոր գաղտնաբառ')}</span><div className="input-wrap">
          <Icon name="lock" size={19}/><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('Թաքցնել գաղտնաբառը') : t('Ցույց տալ գաղտնաբառը')}><Icon name={showPassword ? 'eyeOff' : 'eye'} size={18}/></button>
        </div></label>
        <label className="field"><span>{t('Կրկնիր գաղտնաբառը')}</span><div className="input-wrap">
          <Icon name="lock" size={19}/><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div></label>
        {error && <div className="alert error" role="alert">{t(error)}</div>}
        <button className="btn btn-primary btn-block" type="submit" disabled={busy || token === null}>{busy ? t('Պահպանվում է...') : t('Փոխել գաղտնաբառը')} <Icon name="arrow" size={18}/></button>
      </form>
      <Link className="text-button back-button" to="/forgot-password"><Icon name="back" size={17}/> {t('Ստանալ նոր հղում')}</Link>
    </>}
  </div></main>;
}
