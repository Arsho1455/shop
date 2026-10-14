import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './header.css';

export const MyHeader = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      setSearch(new URLSearchParams(location.search).get('q') || '');
    }
  }, [location.pathname, location.search]);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/?q=${encodeURIComponent(search.trim())}#products` : '/#products');
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="shop-topline">
        <div className="shop-container shop-topline-inner">
          <span><ShopIcon name="sparkle" size={14} /> {t("Գտիր քո հաջորդ սիրելի սմարթֆոնը")}</span>
          <span className="shop-topline-right"><ShopIcon name="truck" size={15} /> {t("Առաքում ամբողջ Հայաստանում")}</span>
        </div>
      </div>
      <div className="shop-main-header">
        <div className="shop-container shop-header-inner">
          <Link className="shop-logo" to="/" aria-label={t("PhoneShop — Գլխավոր էջ")}>
            <span className="shop-logo-symbol"><ShopIcon name="bolt" size={21} fill="white" /></span>
            <span>phone<span className="shop-logo-highlight">shop</span><span className="shop-logo-period">.</span></span>
          </Link>

          <nav className={`shop-nav ${menuOpen ? 'is-open' : ''}`} aria-label={t("Հիմնական բաժիններ")}>
            <NavLink to="/" end className={({isActive}) => `shop-nav-link ${isActive ? 'is-active' : ''}`}>{t("Գլխավոր")}</NavLink>
            <Link to="/#products" className="shop-nav-link">{t("Տեսականի")}</Link>
            <NavLink to="/contact" className={({isActive}) => `shop-nav-link ${isActive ? 'is-active' : ''}`}>{t("Կապ մեզ հետ")}</NavLink>
            <form className="shop-nav-search" role="search" onSubmit={submitSearch}><ShopIcon name="search" size={17}/><input aria-label={t("Փնտրել ապրանք")} placeholder={t("Որոնել հեռախոս...")} value={search} onChange={(event) => setSearch(event.target.value)}/><button type="submit" aria-label={t("Որոնել")}><ShopIcon name="arrowRight" size={16}/></button></form>
          </nav>

          <form className="shop-header-search" onSubmit={submitSearch} role="search">
            <ShopIcon name="search" size={19} />
            <input aria-label={t("Փնտրել ապրանք")} placeholder={t("Որոնել հեռախոս...")} value={search} onChange={(e) => setSearch(e.target.value)} />
            <button aria-label={t("Որոնել")} type="submit"><ShopIcon name="arrowRight" size={17}/></button>
          </form>

          <div className="shop-header-actions">
            <div className="shop-language-selector" role="group" aria-label={t('Լեզու')}>
              {[
                { code: 'hy', label: 'Հայերեն', short: 'ՀԱՅ' },
                { code: 'ru', label: 'Русский', short: 'РУС' },
                { code: 'en', label: 'English', short: 'ENG' },
              ].map(({ code, label, short }) => (
                <button key={code} type="button" lang={code} title={label}
                  aria-label={label} aria-pressed={language === code}
                  className={`shop-language-option ${language === code ? 'active' : ''}`}
                  onClick={() => setLanguage(code)}><span className="shop-lang-full">{label}</span><span className="shop-lang-short">{short}</span></button>
              ))}
            </div>
            {user?.role === 'admin' && <Link to="/admin" className="shop-account-btn" title={t('Ադմինիստրատոր')}>⚙ <span>{t('Ադմինիստրատոր')}</span></Link>}
            <Link to={user ? '/profile' : '/auth?mode=login'} className="shop-account-btn" aria-label={user ? t("Իմ էջը") : t("Մուտք / Գրանցում")}>
              <ShopIcon name="user" size={20} />
              <span>{user ? t("Իմ էջը") : t("Մուտք / Գրանցում")}</span>
            </Link>
            <button type="button" className="shop-mobile-menu" aria-label={menuOpen ? t("Փակել մենյուն") : t("Բացել մենյուն")} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <ShopIcon name={menuOpen ? 'close' : 'menu'} size={23}/>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
