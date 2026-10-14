import { countLabel, useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatPrice } from '../../shop/catalog.js';
import { useCatalog } from '../../shop/CatalogContext.jsx';
import { useShop } from '../../shop/ShopContext.jsx';
import { useLoginGate } from '../../shop/useLoginGate.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './home.css';

const allBrands = 'Բոլորը';

export const HomePage = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const { products } = useCatalog();
  const { isFavorite, toggleFavorite, addToCart, busy } = useShop();
  const requireLogin = useLoginGate();
  const [brand, setBrand] = useState('Բոլորը');
  const [toast, setToast] = useState('');
  const query = new URLSearchParams(location.search).get('q')?.trim().toLowerCase() || '';

  const categories = useMemo(() => [allBrands, ...new Set(products.map((p) => p.brand))], [products]);
  const visibleProducts = useMemo(() => products.filter((item) => {
    const matchesBrand = brand === 'Բոլորը' || item.brand === brand;
    const matchesQuery = !query || `${item.name} ${item.brand} ${item.storage}`.toLowerCase().includes(query);
    return matchesBrand && matchesQuery;
  }), [brand, query]);

  useEffect(() => {
    if (location.hash === '#products') {
      const timer = setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.search]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleCart = async (product) => {
    if (!requireLogin()) return;
    try { if (await addToCart(product)) setToast(`${product.name}${t(" — ավելացվեց քո զամբյուղում")}`); }
    catch (error) { setToast(error.message); }
  };
  const handleFavorite = async (product) => {
    if (!requireLogin()) return;
    try {
      const selected = await toggleFavorite(product);
      setToast(selected ? t("Պահպանվեց քո նախընտրածներում") : t("Հեռացվեց նախընտրածներից"));
    } catch (error) { setToast(error.message); }
  };

  return (
    <main className="ph-home">
      <div className="shop-container">
        <section className="ph-hero" aria-labelledby="hero-title">
          <div className="ph-hero-copy">
            <span className="ph-kicker"><ShopIcon name="sparkle" size={15} /> {t("ՍՄԱՐԹ ԸՆՏՐՈՒԹՅՈՒՆ, ԱՄԵՆ ՕՐ")}</span>
            <h1 id="hero-title">{t("Քո աշխարհը՝")}<br/><span>{t("մեկ հպումով։")}</span></h1>
            <p>{t("Բացահայտիր քո հաջորդ սմարթֆոնը։ Սիրված բրենդներ, ընտրված մոդելներ և գներ, որոնք հաճելիորեն կզարմացնեն։")}</p>
            <div className="ph-hero-actions">
              <a href="#products" className="shop-btn-primary">{t("Գնել հիմա")} <ShopIcon name="arrowRight" size={19}/></a>
              <Link to="/contact" className="ph-hero-link">{t("Օգնե՞նք ընտրել")} <ShopIcon name="arrowRight" size={16}/></Link>
            </div>
            <div className="ph-hero-social-proof"><div className="ph-avatar-stack"><span>✦</span><span>★</span><span>♥</span></div><div><strong>4.8 / 5 <span>★★★★★</span></strong><small>{t("Գնորդների սիրելի ընտրությունը")}</small></div></div>
          </div>
          <div className="ph-hero-art" aria-hidden="true">
            <div className="ph-hero-glow"/>
            <div className="ph-device ph-device-back"><div className="ph-camera-island"><i/><i/><i/></div></div>
            <div className="ph-device ph-device-front"><div className="ph-device-island"/><div className="ph-device-time">09:41</div><div className="ph-device-wallpaper"><span/></div><div className="ph-device-caption">{t("hello, future.")}</div></div>
            <div className="ph-floating-chip ph-chip-top"><ShopIcon name="star" size={16} fill="#ffbd69"/><span>{t("Թոփ որակ")}</span></div>
            <div className="ph-floating-chip ph-chip-bottom"><ShopIcon name="check" size={17}/><span>{t("100% օրիգինալ")}</span></div>
          </div>
          <div className="ph-hero-scrollmark">01 — 04 <span>● ● ○ ○</span></div>
        </section>

        <div className="ph-benefit-strip" aria-label={t("Մեր առավելությունները")}>
          <div className="ph-benefit"><span className="ph-benefit-icon"><ShopIcon name="truck" size={23}/></span><div><strong>{t("Արագ առաքում")}</strong><small>{t("Ամբողջ Հայաստանում")}</small></div></div>
          <div className="ph-benefit"><span className="ph-benefit-icon"><ShopIcon name="shield" size={23}/></span><div><strong>{t("Վստահելի որակ")}</strong><small>{t("Միայն օրիգինալ տեխնիկա")}</small></div></div>
          <div className="ph-benefit"><span className="ph-benefit-icon"><ShopIcon name="return" size={23}/></span><div><strong>{t("Հարմար գնումներ")}</strong><small>{t("Պարզ ու արագ պատվեր")}</small></div></div>
        </div>

        <section className="ph-collection" id="products" aria-labelledby="collection-title">
          <div className="ph-section-topline"><span className="shop-eyebrow">{t("ՀԱՏՈՒԿ ՔԵԶ ՀԱՄԱՐ")}</span><span className="ph-section-index">{t("/ 01 — ՏԵՍԱԿԱՆԻ")}</span></div>
          <div className="ph-section-head"><div><h2 id="collection-title">{t("Գտիր քո")} <em>{t("իդեալականը")}</em></h2><p>{t("Հատուկ ընտրված սմարթֆոններ՝ յուրահատուկ հնարավորություններով։")}</p></div><Link to="/profile/favorites" className="ph-section-favorites">{t("Իմ նախընտրածները")} <ShopIcon name="arrowRight" size={17}/></Link></div>
          <div className="ph-filter-row" role="group" aria-label={t("Ֆիլտրել ըստ բրենդի")}>
            <div className="ph-filter-pills">{categories.map((item) => <button type="button" key={item} onClick={() => setBrand(item)} className={`ph-filter-pill ${brand === item ? 'active' : ''}`} aria-pressed={brand === item}>{t(item)}</button>)}</div>
            <div className="ph-products-count"><ShopIcon name="filter" size={17}/>{visibleProducts.length} {countLabel(visibleProducts.length, language)}</div>
          </div>
          {visibleProducts.length ? <div className="ph-products-grid">{visibleProducts.map((product) => (
            <article className="ph-card" key={product.id}>
              <div className={`ph-card-media ph-media-${product.tone}`}>
                <span className="ph-card-label">{t(product.tag)}</span>
                <button type="button" disabled={busy} className={`ph-card-heart ${isFavorite(product.id) ? 'active' : ''}`} onClick={() => handleFavorite(product)} aria-label={isFavorite(product.id) ? `${product.name}${t(": հեռացնել նախընտրածներից")}` : `${product.name}${t(": ավելացնել նախընտրածներին")}`} aria-pressed={isFavorite(product.id)}><ShopIcon name="heart" size={20} fill={isFavorite(product.id) ? 'currentColor' : 'none'} /></button>
                <Link to={`/product/${product.id}`} className="ph-card-img-link" aria-label={`${t("Դիտել ")}${product.name}`}><img src={product.image} alt={product.name} loading="lazy"/></Link>
              </div>
              <div className="ph-card-info"><div className="ph-card-meta"><span>{product.brand} · {product.storage}</span><span><ShopIcon name="star" size={13} fill="#ffb95d" strokeWidth={1.2}/> {product.rating}</span></div>
                <Link to={`/product/${product.id}`} className="ph-card-name">{product.name}</Link>
                <div className="ph-card-prices"><strong>{formatPrice(product.price)}</strong>{product.oldPrice > product.price && <del>{formatPrice(product.oldPrice)}</del>}</div>
                <button type="button" className="ph-card-cart-btn" disabled={busy} onClick={() => handleCart(product)}><ShopIcon name="bag" size={18}/> {t("Ավելացնել զամբյուղ")} <ShopIcon name="arrowRight" size={16}/></button>
              </div>
            </article>
          ))}</div> : <div className="ph-no-results"><ShopIcon name="search" size={30}/><h3>{t("Ապրանք չգտնվեց")}</h3><p>{t("Փորձիր այլ որոնում կամ ընտրիր ուրիշ բրենդ։")}</p><button onClick={() => { setBrand('Բոլորը'); window.location.assign('/#products'); }}>{t("Ցույց տալ բոլորը")}</button></div>}
        </section>

        <section className="ph-bottom-banner"><div><span className="ph-banner-eyebrow"><ShopIcon name="sparkle" size={15}/> {t("ԱՎԵԼԻՆ, ՔԱՆ ՍՈՎՈՐԱԿԱՆ ԳՆՈՒՄ")}</span><h2>{t("Նոր հեռախո՞ս։")}<br/><span>{t("Լավ ընտրություն։")}</span></h2><p>{t("Գտիր հենց քո ոճին համապատասխան տեխնիկան։")}</p><Link className="ph-banner-button" to="/contact">{t("Կապ հաստատել")} <ShopIcon name="arrowRight" size={18}/></Link></div><div className="ph-banner-decoration" aria-hidden="true"><span>✳</span><span>✴</span><span>✦</span></div></section>
      </div>
      {toast && <div className="ph-toast" role="status"><ShopIcon name="check" size={19}/>{t(toast)}<button type="button" onClick={() => setToast('')} aria-label={t("Փակել")}><ShopIcon name="close" size={15}/></button></div>}
    </main>
  );
};
