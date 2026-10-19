import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { useShop } from '../../shop/ShopContext.jsx';
import ShopIcon from '../../shop/ShopIcon.jsx';
import { FavoritesPage } from '../../components/favorites/favorites.jsx';
import { CartPage } from '../../components/cart/cart.jsx';
import Orders from '../../checkout/Orders.jsx';
import Loader from '../components/Loader.jsx';
import './profile-shop.css';

const formatDate = (date, locale = 'hy-AM') => date ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date)) : '—';

export default function Profile({ section = 'account' }) {
  const { t, language } = useLanguage();
  const { user, loading, signOut, setUser } = useAuth();
  const { favorites, cart } = useShop();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  useEffect(() => { if (user) { setName(user.name); setBio(user.bio || ''); } }, [user]);
  useEffect(() => {
    if (!loading && !user) navigate(`/auth?mode=login&next=${encodeURIComponent(`/profile${section === 'account' ? '' : `/${section}`}`)}`, { replace: true });
  }, [loading, user, navigate, section]);

  if (loading || !user) return <Loader label={t("Բացում ենք քո էջը...")} />;

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try { const result = await api('/api/profile', { method: 'PATCH', body: { name, bio } }); setUser(result.user); setMessage(t("Փոփոխությունները պահպանվել են։")); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  const logout = async () => {
    setLoggingOut(true); setError('');
    try { await signOut(); navigate('/', { replace: true }); }
    catch (err) { setError(err.message); setLoggingOut(false); }
  };

  return <main className="account-page"><div className="shop-container">
    <nav className="account-crumb" aria-label={t("Էջի տեղադրությունը")}><Link to="/">{t("Գլխավոր")}</Link><ShopIcon name="arrowRight" size={14}/><strong>{t("Իմ էջը")}</strong></nav>
    <div className="account-welcome"><div className="account-welcome-copy"><span className="shop-eyebrow"><ShopIcon name="sparkle" size={15}/> {t("ԱՆՁՆԱԿԱՆ ՏԱՐԱԾՔ")}</span><h1>{t("Բարի վերադարձ,")} <span>{user.name.split(' ')[0]}</span><span className="account-welcome-dot">.</span></h1><p>{t("Քո գնումները, նախընտրածներն ու անձնական տվյալները՝ մեկ հարմար վայրում։")}</p><Link to="/#products" className="shop-btn-soft">{t("Դիտել ապրանքները")} <ShopIcon name="arrowRight" size={17}/></Link></div><div className="account-welcome-art" aria-hidden="true"><span className="account-orbit account-orbit-one"/><span className="account-orbit account-orbit-two"/><span className="account-orbit-core"><ShopIcon name="sparkle" size={43}/></span><span className="account-orbit-point"/></div></div>
    <div className="account-stat-row"><Link to="/profile/favorites" className="account-stat-card"><span className="account-stat-icon account-stat-heart"><ShopIcon name="heart" size={22}/></span><div><strong>{favorites.length}</strong><span>{t("Նախընտրած ապրանք")}</span></div><ShopIcon name="arrowRight" size={18}/></Link><Link to="/profile/cart" className="account-stat-card"><span className="account-stat-icon account-stat-bag"><ShopIcon name="bag" size={22}/></span><div><strong>{cartCount}</strong><span>{t("Զամբյուղում")}</span></div><ShopIcon name="arrowRight" size={18}/></Link><Link to="/profile/orders" className="account-stat-card"><span className="account-stat-icon account-stat-check"><ShopIcon name="shield" size={22}/></span><div><strong>{t("Պատվերներ")}</strong><span>{t("Գնումների պատմություն")}</span></div><ShopIcon name="arrowRight" size={18}/></Link></div>

    <div className="account-layout"><aside className="account-sidebar">
      <div className="account-sidebar-identity"><span className="account-avatar">{user.name?.trim()?.[0]?.toLocaleUpperCase('hy-AM') || 'U'}</span><h2>{user.name}</h2><p>{user.email}</p><span className="account-verified"><ShopIcon name="check" size={13}/> {t("Email-ը հաստատված է")}</span></div>
      <p className="account-nav-label">{t("ԻՄ ԷՋԸ")}</p>
      <nav className="account-nav" aria-label={t("Իմ հաշվի բաժիններ")}><NavLink end to="/profile" className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}><ShopIcon name="user" size={19}/> {t("Անձնական տվյալներ")} <ShopIcon name="arrowRight" size={16}/></NavLink><NavLink to="/profile/favorites" className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}><ShopIcon name="heart" size={19}/> {t("Նախընտրածներ")} <span>{favorites.length}</span></NavLink><NavLink to="/profile/cart" className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}><ShopIcon name="bag" size={19}/> {t("Զամբյուղ")} <span>{cartCount}</span></NavLink><NavLink to="/profile/orders" className={({isActive}) => `account-nav-link ${isActive ? 'active' : ''}`}><ShopIcon name="check" size={19}/>{t("Իմ պատվերները")}</NavLink></nav>
      <div className="account-sidebar-bottom"><div className="account-member-date"><ShopIcon name="clock" size={16}/> {t("Մեզ հետ ես՝")} {formatDate(user.createdAt, { hy: "hy-AM", ru: "ru-RU", en: "en-US" }[language])}</div><button type="button" disabled={loggingOut} className="account-logout" onClick={logout}><ShopIcon name="arrowLeft" size={18}/> {loggingOut ? t("Դուրս ենք գալիս...") : t("Դուրս գալ հաշվից")}</button></div>
    </aside>
    <div className="account-content">
      {section === 'favorites' ? <FavoritesPage /> : section === 'cart' ? <CartPage /> : section === 'orders' ? <Orders /> : <section className="account-settings" aria-labelledby="account-settings-title"><div className="account-settings-heading"><span className="account-settings-icon"><ShopIcon name="user" size={21}/></span><div><span className="shop-eyebrow">{t("ՀԱՇՎԻ ԿԱՐԳԱՎՈՐՈՒՄՆԵՐ")}</span><h2 id="account-settings-title">{t("Անձնական տվյալներ")}</h2><p>{t("Կառավարիր քո պրոֆիլի հիմնական տեղեկությունները։")}</p></div></div><form onSubmit={saveProfile} className="account-settings-form"><label><span>{t("Քո անունը")}</span><input type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={60} required placeholder={t("Անուն")}/></label><label><span>{t("Էլեկտրոնային հասցե")} <small>{t("Հաստատված")}</small></span><input type="email" readOnly value={user.email} aria-readonly="true"/></label><label><span>{t("Իմ մասին")} <small>{t("Ընտրովի")}</small></span><textarea value={bio} maxLength={160} rows={4} onChange={(event) => setBio(event.target.value)} placeholder={t("Մի փոքր պատմիր քո մասին...")}/><small className="account-char-count">{bio.length}/160</small></label>{error && <div className="account-shop-error" role="alert">{t(error)}</div>}{message && <div className="account-shop-notice" role="status">{t(message)}</div>}<div className="account-settings-footer"><span><ShopIcon name="shield" size={17}/> {t("Տվյալներդ պաշտպանված են")}</span><button type="submit" className="shop-btn-primary" disabled={saving}>{saving ? t("Պահպանվում է...") : t("Պահպանել փոփոխությունները")} <ShopIcon name="check" size={18}/></button></div></form></section>}
    </div></div>
    {error && section !== 'account' && <p className="account-shop-error" role="alert">{t(error)}</p>}
  </div></main>;
}
