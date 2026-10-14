import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function Loader({ label = 'Բեռնվում է...' }) {
  const { t } = useLanguage();
  return <div className="loader-box" role="status"><span className="spinner"/><span>{t(label)}</span></div>;
}
