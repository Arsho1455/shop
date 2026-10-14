import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../auth/lib/api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import ShopIcon from '../shop/ShopIcon.jsx';
import './admin-login.css';

const translations = {
  hy: {
    badge: 'ՊԱՇՏՊԱՆՎԱԾ ՄՈՒՏՔ', heroTitle: 'Կառավարիր խանութը վստահությամբ։',
    heroDescription: 'Մի վայրում վերահսկիր ապրանքները, օգտատերերին և խանութի վիճակագրությունը։',
    point1: 'Ապրանքների կառավարում', point2: 'Օգտատերերի վերահսկում', point3: 'Վիճակագրություն',
    eyebrow: 'PHONESHOP / ADMIN', welcome: 'Բարի վերադարձ', subtitle: 'Մուտք գործիր կառավարման վահանակ՝ օգտագործելով ադմինի լոգինն ու գաղտնաբառը։',
    login: 'Լոգին (էլ․ հասցե)', loginPlaceholder: 'admin@example.com', password: 'Գաղտնաբառ',
    show: 'Ցույց տալ', hide: 'Թաքցնել', submit: 'Մուտք գործել', submitting: 'Ստուգվում է...',
    note: 'Ադմինի հաշիվը ստեղծվում է առանձին և չի պահանջում խանութում գրանցվել', store: 'Վերադառնալ խանութ',
    footer: 'Պաշտպանված ադմինիստրատորի մուտք',
  },
  ru: {
    badge: 'ЗАЩИЩЁННЫЙ ДОСТУП', heroTitle: 'Управляйте магазином уверенно.',
    heroDescription: 'Товары, пользователи и статистика — в одной панели управления.',
    point1: 'Управление товарами', point2: 'Контроль пользователей', point3: 'Статистика',
    eyebrow: 'PHONESHOP / ADMIN', welcome: 'С возвращением', subtitle: 'Войдите в панель администратора с логином и паролем.',
    login: 'Логин (эл. почта)', loginPlaceholder: 'admin@example.com', password: 'Пароль',
    show: 'Показать', hide: 'Скрыть', submit: 'Войти', submitting: 'Проверка...',
    note: 'Отдельный аккаунт администратора, не связанный с регистрацией в магазине', store: 'Вернуться в магазин',
    footer: 'Защищённый вход администратора',
  },
  en: {
    badge: 'SECURE ACCESS', heroTitle: 'Run your store with confidence.',
    heroDescription: 'Products, customers, and insights together in one workspace.',
    point1: 'Product management', point2: 'Customer oversight', point3: 'Store analytics',
    eyebrow: 'PHONESHOP / ADMIN', welcome: 'Welcome back', subtitle: 'Sign in to the admin dashboard with your login and password.',
    login: 'Login (email)', loginPlaceholder: 'admin@example.com', password: 'Password',
    show: 'Show', hide: 'Hide', submit: 'Sign in', submitting: 'Signing in...',
    note: 'Separate admin account — no shop registration needed', store: 'Back to store',
    footer: 'Secure administrator sign-in',
  },
};

export default function AdminLogin({ onSignedIn }) {
  const { language, setLanguage } = useLanguage();
  const w = translations[language] || translations.hy;
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await api('/api/admin/auth/login', {
        method: 'POST',
        body: { login: login.trim(), password },
      });
      setPassword('');
      onSignedIn(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="adm-login-screen">
    <div className="adm-login-layout">
      <section className="adm-login-story" aria-label="PhoneShop admin">
        <div className="adm-login-logo"><span className="adm-login-logo-icon"><ShopIcon name="bolt" fill="white" size={25}/></span><span>phone<strong>shop</strong><small>MANAGEMENT PLATFORM</small></span></div>
        <div className="adm-login-story-center">
          <span className="adm-login-story-badge"><ShopIcon name="shield" size={17}/>{w.badge}</span>
          <h1>{w.heroTitle}</h1><p>{w.heroDescription}</p>
          <ul>
            {[[w.point1,'bag'],[w.point2,'user'],[w.point3,'filter']].map(([label,icon]) => <li key={icon}><span><ShopIcon name={icon} size={19}/></span>{label}<ShopIcon name="check" size={17}/></li>)}
          </ul>
        </div>
        <span className="adm-login-story-foot">© PhoneShop <span className="adm-login-story-asterisk">✦</span> CONTROL CENTER</span>
        <span className="adm-login-orb orb-one"/><span className="adm-login-orb orb-two"/>
      </section>
      <section className="adm-login-form-panel">
        <div className="adm-login-languages" aria-label="Language">
          {[['hy','Հայ'],['ru','Рус'],['en','Eng']].map(([code,label]) => <button type="button" key={code} aria-pressed={language === code} onClick={() => setLanguage(code)}>{label}</button>)}
        </div>
        <div className="adm-login-form-wrap">
          <div className="adm-login-symbol"><ShopIcon name="shield" size={30}/></div>
          <span className="adm-login-eyebrow">{w.eyebrow}</span>
          <h2>{w.welcome}<span className="adm-login-dot">.</span></h2>
          <p className="adm-login-description">{w.subtitle}</p>
          <form onSubmit={handleSubmit} className="adm-login-form">
            <label htmlFor="adm-login-email">{w.login}</label>
            <div className="adm-login-input-frame"><ShopIcon name="user" size={19}/><input id="adm-login-email" type="email" name="username" autoComplete="username" inputMode="email" placeholder={w.loginPlaceholder} value={login} onChange={(event) => setLogin(event.target.value)} required maxLength={254} disabled={submitting}/></div>
            <label htmlFor="adm-login-password">{w.password}</label>
            <div className="adm-login-input-frame"><ShopIcon name="shield" size={19}/><input id="adm-login-password" type={visible ? 'text' : 'password'} name="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={submitting}/><button type="button" className="adm-password-toggle" onClick={() => setVisible((v)=>!v)} aria-label={visible ? w.hide : w.show}>{visible ? w.hide : w.show}</button></div>
            {error && <div className="adm-login-error" role="alert">{error}</div>}
            <button className="adm-login-submit" type="submit" disabled={submitting}>{submitting ? w.submitting : w.submit}<ShopIcon name="arrowRight" size={19}/></button>
          </form>
          <div className="adm-login-guard"><ShopIcon name="shield" size={18}/><span>{w.note}</span></div>
          <Link to="/" className="adm-login-back"><ShopIcon name="arrowLeft" size={18}/>{w.store}</Link>
        </div>
        <div className="adm-login-panel-foot"><span className="adm-login-panel-safe"><ShopIcon name="shield" size={15}/>{w.footer}</span><span>© {new Date().getFullYear()} PhoneShop</span></div>
      </section>
    </div>
  </main>;
}
