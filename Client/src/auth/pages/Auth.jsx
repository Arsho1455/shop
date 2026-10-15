import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

const initialFields = { name: '', email: '', password: '', confirm: '' };

export default function Auth() {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'login' ? 'login' : 'register';
  const requestedNext = searchParams.get('next') || '';
  const safeNext = requestedNext.startsWith('/') && !requestedNext.startsWith('//') && !requestedNext.includes('\\') ? requestedNext : '/profile';
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState(initialFields);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('form');
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => { setError(''); setMessage(''); setStep('form'); setNeedsVerification(false); }, [mode]);

  if (loading) return <Loader />;
  if (user) return <Navigate to={safeNext} replace />;

  function switchMode(next) {
    setSearchParams({ mode: next, ...(requestedNext ? { next: requestedNext } : {}) });
    setFields(initialFields);
  }
  function onChange(e) { setFields((prev) => ({ ...prev, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError(''); setMessage(''); setNeedsVerification(false);
    if (mode === 'register' && fields.password !== fields.confirm) {
      setError(t("Գաղտնաբառերը չեն համընկնում։")); return;
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        const result = await api('/api/auth/register', {
          method: 'POST', body: { name: fields.name, email: fields.email, password: fields.password, language },
        });
        setMessage(result.message);
        setStep('check-email');
      } else {
        await signIn(fields.email, fields.password);
        navigate(safeNext, { replace: true });
      }
    } catch (err) {
      if (err.code === 'MAIL_FAILED') {
        setStep('check-email');
        setError(err.message);
      } else {
        setError(err.message);
        setNeedsVerification(err.code === 'EMAIL_NOT_VERIFIED');
      }
    } finally { setBusy(false); }
  }

  async function resend() {
    setBusy(true); setError(''); setMessage('');
    try {
      const data = await api('/api/auth/resend-verification', {
        method: 'POST', body: { email: fields.email, language },
      });
      setMessage(data.message);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-main">
    <div className="auth-blur one"/><div className="auth-blur two"/>
    <div className="container auth-layout">
      <section className="auth-aside">
        <div className="eyebrow"><span className="live-dot"/> {t("ՔՈ ԱՆՁՆԱԿԱՆ ՏԱՐԱԾՔԸ")}</div>
        <h1>{t("Մեկ քայլ դեպի")}<br/><span className="gradient-text">{t("քո նոր սկիզբը։")}</span></h1>
        <p>{t("Մնա կապի մեջ, կառավարիր քո տվյալները և օգտվիր անվտանգ անձնական տարածքից։")}</p>
        <div className="aside-points">
          <div><span><Icon name="shield" size={20}/></span><div><strong>{t("Անվտանգություն՝ առաջին տեղում")}</strong><small>{t("Գաղտնաբառերն ապահով հեշավորվում են։")}</small></div></div>
          <div><span><Icon name="mail" size={20}/></span><div><strong>{t("Հաստատված էլ. հասցե")}</strong><small>{t("Միայն քո էլ. փոստով հասանելի հաշիվ։")}</small></div></div>
          <div><span><Icon name="user" size={20}/></span><div><strong>{t("Քո սեփական պրոֆիլը")}</strong><small>{t("Թարմացրու անունն ու նկարագրությունը։")}</small></div></div>
        </div>
        <div className="aside-bottom"><span className="aside-orb">✦</span> {t("Պարզ։ Արագ։ Վստահելի։")}</div>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        {searchParams.get('reason') === 'shop' && <p className="shop-auth-required-note">{t("Մուտք գործիր՝ ապրանքը զամբյուղ կամ նախընտրածներ ավելացնելու համար։")}</p>}
        {step === 'check-email' ? <div className="email-step">
          <div className="large-icon success-icon"><Icon name="mail" size={31}/></div>
          <div className="eyebrow small">{t("ԳՐԱՆՑՄԱՆ ՎԵՐՋԻՆ ՔԱՅԼԸ")}</div>
          <h2 id="auth-title">{t("Ստուգիր էլ. փոստդ")}</h2>
          <p>{t("Հաստատման հղումն ուղարկել ենք այս հասցեին՝")}</p>
          <div className="email-pill">{fields.email.trim()}</div>
          <p className="muted-copy">{t("Բացիր նամակը և սեղմիր հաստատման կոճակը։ Հղումը գործում է 24 ժամ։")}</p>
          {error && <div className="alert error" role="alert">{t(error)}</div>}
          {message && <div className="alert success" role="status">{t(message)}</div>}
          <button className="btn btn-primary btn-block" onClick={resend} disabled={busy} type="button">{busy ? <span className="spinner small-spinner"/> : <Icon name="refresh" size={18}/>} {t("Կրկին ուղարկել նամակը")}</button>
          <button className="text-button back-button" onClick={() => switchMode('login')} type="button"><Icon name="back" size={17}/> {t("Վերադառնալ մուտքին")}</button>
        </div> : <>
          <div className="card-heading"><div className="card-ornament"><Icon name="spark" size={23}/></div><span className="card-top-label">{t("ԲԱՐԻ ԳԱԼՈՒՍՏ PHONESHOP")}</span></div>
          <h2 id="auth-title">{mode === 'register' ? t("Ստեղծիր քո հաշիվը") : t("Բարի վերադարձ")}</h2>
          <p className="auth-description">{mode === 'register' ? t("Մի քանի դաշտ, և դու պատրաստ ես։") : t("Մուտք գործիր՝ շարունակելու համար։")}</p>
          <div className="auth-tabs" role="group" aria-label={t("Հաշվի գործողություն")}>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>{t("Գրանցվել")}</button>
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>{t("Մուտք գործել")}</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && <label className="field"><span>{t("Անուն")}</span><div className="input-wrap"><Icon name="user" size={19}/><input name="name" autoComplete="name" placeholder={t("Քո անունը")} minLength={2} maxLength={60} value={fields.name} onChange={onChange} required/></div></label>}
            <label className="field"><span>{t("Էլ. հասցե")}</span><div className="input-wrap"><Icon name="mail" size={19}/><input name="email" autoComplete="email" type="email" placeholder="you@example.com" value={fields.email} onChange={onChange} required/></div></label>
            <label className="field"><span>{t("Գաղտնաբառ")}</span><div className="input-wrap"><Icon name="lock" size={19}/><input name="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'} placeholder={mode === 'register' ? t("Առնվազն 8 նիշ") : t("Քո գաղտնաբառը")} minLength={mode === 'register' ? 8 : undefined} value={fields.password} onChange={onChange} required/><button type="button" className="password-toggle" aria-label={showPassword ? t("Թաքցնել գաղտնաբառը") : t("Ցույց տալ գաղտնաբառը")} onClick={() => setShowPassword((v) => !v)}><Icon name={showPassword ? 'eyeOff' : 'eye'} size={18}/></button></div></label>
            {mode === 'login' && <div className="forgot-link-row"><Link className="text-button" to="/forgot-password">{t("Մոռացե՞լ ես գաղտնաբառը")}</Link></div>}
            {mode === 'register' && <label className="field"><span>{t("Կրկնիր գաղտնաբառը")}</span><div className="input-wrap"><Icon name="lock" size={19}/><input name="confirm" autoComplete="new-password" type={showPassword ? 'text' : 'password'} placeholder={t("Կրկնիր գաղտնաբառը")} minLength={8} value={fields.confirm} onChange={onChange} required/></div></label>}
            {error && <div className="alert error" role="alert">{t(error)}</div>}
            {message && <div className="alert success" role="status">{t(message)}</div>}
            {needsVerification && <button className="text-button resend-inline" type="button" onClick={resend} disabled={busy}>{t("Կրկին ուղարկել հաստատման նամակը")} <Icon name="arrow" size={15}/></button>}
            <button className="btn btn-primary btn-block submit-button" type="submit" disabled={busy}>{busy ? <span className="spinner small-spinner"/> : <>{mode === 'register' ? t("Ստեղծել հաշիվ") : t("Մուտք գործել")} <Icon name="arrow" size={18}/></>}</button>
          </form>
          <div className="auth-footer-note"><Icon name="shield" size={16}/> {t("Քո տվյալները պաշտպանված են")}</div>
        </>}
      </section>
    </div>
    <Link className="back-home" to="/"><Icon name="back" size={16}/> {t("Վերադառնալ գլխավոր էջ")}</Link>
  </main>;
}
