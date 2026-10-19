import { useLanguage } from '../../i18n/LanguageContext.jsx';

export function AuthOrbit() {
  return <div className="auth-orbit-stage" aria-hidden="true"><span/><span/><span/><i/><i/></div>;
}

export default function Loader({ label = 'Բեռնվում է...' }) {
  const { t } = useLanguage();
  return <div className="simple-page auth-loading-page" role="status"><AuthOrbit/><div className="simple-card verify-card loader-content"><span className="spinner"/><span>{t(label)}</span></div></div>;
}
