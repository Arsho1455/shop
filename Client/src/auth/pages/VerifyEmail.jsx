import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { api } from '../lib/api.js';

export default function VerifyEmail() {
  const { t } = useLanguage();
  const [state, setState] = useState({ type: 'loading', message: 'Հաստատում ենք էլ. հասցեն...' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token');
    // Հեռացնում ենք token-ը browser history-ից՝ մինչ API-ին ուղարկելը։
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    if (!token) {
      setState({ type: 'error', message: 'Հաստատման հղման մեջ token չկա։' });
      return;
    }
    api('/api/auth/verify-email', { method: 'POST', body: { token } })
      .then(({ message }) => setState({ type: 'success', message }))
      .catch((error) => setState({ type: 'error', message: error.message }));
  }, []);

  return <main className="simple-page"><div className="simple-card">
    <div className={`large-icon ${state.type === 'error' ? 'error-icon' : 'success-icon'}`}>
      {state.type === 'loading' ? <span className="spinner"/> : <Icon name={state.type === 'success' ? 'check' : 'mail'} size={34}/>}
    </div>
    <div className="eyebrow small">{t("ԷԼ. ՀԱՍՑԵԻ ՀԱՍՏԱՏՈՒՄ")}</div>
    <h1>{state.type === 'loading' ? t("Մի պահ...") : state.type === 'success' ? t("Հաջողված է 🎉") : t("Հղման խնդիր")}</h1>
    <p>{t(state.message)}</p>
    {state.type !== 'loading' && <Link className="btn btn-primary btn-block" to="/auth?mode=login">{state.type === 'success' ? t("Գնալ մուտքի էջ") : t("Վերադառնալ գրանցման էջ")} <Icon name="arrow" size={17}/></Link>}
  </div></main>;
}
