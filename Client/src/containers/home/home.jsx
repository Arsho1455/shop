import { countLabel, useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../shop/catalog.js';
import { useCatalog } from '../../shop/CatalogContext.jsx';
import { useShop } from '../../shop/ShopContext.jsx';
import { useLoginGate } from '../../shop/useLoginGate.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './home.css';
import { filterAndSortProducts } from '../../shop/productFilters.js';

const allBrands = 'Բոլորը';

export const HomePage = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { products } = useCatalog();
  const { isFavorite, toggleFavorite, addToCart, busy } = useShop();
  const requireLogin = useLoginGate();
  const [brand, setBrand] = useState('Բոլորը');
  const [toast, setToast] = useState('');
  const [storage, setStorage] = useState('');
  const [color, setColor] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = new URLSearchParams(location.search).get('q')?.trim().toLowerCase() || '';

  const categories = useMemo(() => [allBrands, ...new Set(products.map((p) => p.brand))], [products]);
  const memories = useMemo(() => [...new Set(products.map((p) => p.storage).filter(Boolean))].sort(), [products]);
  const colors = useMemo(() => [...new Set(products.map((p) => p.color).filter(Boolean))].sort(), [products]);
  const visibleProducts = useMemo(() => filterAndSortProducts(products, { brand, query, storage, color, minPrice, maxPrice, minRating, inStock, onSale, sortBy }), [products, brand, query, storage, color, minPrice, maxPrice, minRating, inStock, onSale, sortBy]);
  const filtersActive = Boolean(query || brand !== allBrands || storage || color || minPrice || maxPrice || minRating || inStock || onSale || sortBy !== 'default');
  const clearFilters = () => {
    setBrand(allBrands); setStorage(''); setColor(''); setMinPrice(''); setMaxPrice(''); setMinRating('');
    setInStock(false); setOnSale(false); setSortBy('default');
    if (query) navigate('/#products');
  };

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
            <div className="ph-hero-social-proof"><div className="ph-avatar-stack"><span>✦</span><span>★</span><span>♥</span></div><div><strong>{t("Բացահայտիր սիրված մոդելները")} <span>✦</span></strong><small>{t("Գնորդների սիրելի ընտրությունը")}</small></div></div>
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
          <div className="ph-filter-row" role="group" aria-label={t('Ֆիլտրել ըստ բրենդի')}>
            <div className="ph-filter-pills">{categories.map((item) => <button type="button" key={item} onClick={() => setBrand(item)} className={`ph-filter-pill ${brand === item ? 'active' : ''}`} aria-pressed={brand === item}>{t(item)}</button>)}</div>
            <div className="ph-products-count"><ShopIcon name="filter" size={17}/>{visibleProducts.length} {countLabel(visibleProducts.length, language)}</div>
          </div>
          <div className="ph-filter-shell">
            <div className="ph-filter-toolbar">
              <button className={`ph-filter-toggle ${filtersOpen ? 'active' : ''}`} type="button" aria-expanded={filtersOpen} aria-controls="ph-filter-panel" onClick={() => setFiltersOpen((prev) => !prev)}><ShopIcon name="filter" size={17}/> {t('Մանրամասն ֆիլտրեր')} <span>{filtersOpen ? '−' : '+'}</span></button>
              <label className="ph-sort-control"><span>{t('Դասավորել ըստ')}</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="default">{t('Լռելյայն')}</option><option value="priceLow">{t('Գին՝ էժանից թանկ')}</option><option value="priceHigh">{t('Գին՝ թանկից էժան')}</option><option value="ratingHigh">{t('Բարձր գնահատական')}</option><option value="newest">{t('Նոր ապրանքներ')}</option><option value="name">{t('Անուն՝ Ա-Ֆ')}</option></select></label>
              {filtersActive && <button className="ph-filter-reset" type="button" onClick={clearFilters}>{t('Մաքրել ֆիլտրերը')} <ShopIcon name="close" size={14}/></button>}
              <span className="ph-filter-result">{visibleProducts.length} {countLabel(visibleProducts.length, language)}</span>
            </div>
            {filtersOpen && <div id="ph-filter-panel" className="ph-filter-panel">
              <label>{t('Հիշողություն')}<select value={storage} onChange={(event) => setStorage(event.target.value)}><option value="">{t('Բոլորը')}</option>{memories.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label>{t('Գույն')}<select value={color} onChange={(event) => setColor(event.target.value)}><option value="">{t('Բոլորը')}</option>{colors.map((value) => <option key={value} value={value}>{t(value)}</option>)}</select></label>
              <label>{t('Գին սկսած (֏)')}<input aria-label={t('Գին սկսած (֏)')} type="number" min="0" inputMode="numeric" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" /></label>
              <label>{t('Գին մինչև (֏)')}<input aria-label={t('Գին մինչև (֏)')} type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="500 000" /></label>
              <label>{t('Գնահատական')}<select value={minRating} onChange={(event) => setMinRating(event.target.value)}><option value="">{t('Բոլորը')}</option><option value="4">4+ ★</option><option value="3">3+ ★</option><option value="2">2+ ★</option><option value="1">1+ ★</option></select></label>
              <label className="ph-filter-check"><input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)}/><span>{t('Միայն առկա')}</span></label>
              <label className="ph-filter-check"><input type="checkbox" checked={onSale} onChange={(event) => setOnSale(event.target.checked)}/><span>{t('Միայն զեղչված')}</span></label>
            </div>}
          </div>
          {visibleProducts.length ? <div className="ph-products-grid">{visibleProducts.map((product) => (
            <article className="ph-card" key={product.id}>
              <div className={`ph-card-media ph-media-${product.tone}`}>
                <span className="ph-card-label">{t(product.tag)}</span>
                <button type="button" disabled={busy} className={`ph-card-heart ${isFavorite(product.id) ? 'active' : ''}`} onClick={() => handleFavorite(product)} aria-label={isFavorite(product.id) ? `${product.name}${t(": հեռացնել նախընտրածներից")}` : `${product.name}${t(": ավելացնել նախընտրածներին")}`} aria-pressed={isFavorite(product.id)}><ShopIcon name="heart" size={20} fill={isFavorite(product.id) ? 'currentColor' : 'none'} /></button>
                <Link to={`/product/${product.id}`} className="ph-card-img-link" aria-label={`${t("Դիտել ")}${product.name}`}><img src={product.image} alt={product.name} loading="lazy"/></Link>
              </div>
              <div className="ph-card-info"><div className="ph-card-meta"><span>{product.brand} · {product.storage}</span><span><ShopIcon name="star" size={13} fill={product.reviews ? "#ffb95d" : "none"} strokeWidth={1.2}/> {product.reviews ? product.rating : t("Նոր")}</span></div>
                <Link to={`/product/${product.id}`} className="ph-card-name">{product.name}</Link>
                <div className="ph-card-prices"><strong>{formatPrice(product.price)}</strong>{product.oldPrice > product.price && <del>{formatPrice(product.oldPrice)}</del>}</div>
                <button type="button" className="ph-card-cart-btn" disabled={busy} onClick={() => handleCart(product)}><ShopIcon name="bag" size={18}/> {t("Ավելացնել զամբյուղ")} <ShopIcon name="arrowRight" size={16}/></button>
              </div>
            </article>
          ))}</div> : <div className="ph-no-results"><ShopIcon name="search" size={30}/><h3>{t("Ապրանք չգտնվեց")}</h3><p>{t("Փորձիր այլ որոնում կամ ընտրիր ուրիշ բրենդ։")}</p><button onClick={clearFilters}>{t("Ցույց տալ բոլորը")}</button></div>}
        </section>

        <section className="ph-bottom-banner"><div><span className="ph-banner-eyebrow"><ShopIcon name="sparkle" size={15}/> {t("ԱՎԵԼԻՆ, ՔԱՆ ՍՈՎՈՐԱԿԱՆ ԳՆՈՒՄ")}</span><h2>{t("Նոր հեռախո՞ս։")}<br/><span>{t("Լավ ընտրություն։")}</span></h2><p>{t("Գտիր հենց քո ոճին համապատասխան տեխնիկան։")}</p><Link className="ph-banner-button" to="/contact">{t("Կապ հաստատել")} <ShopIcon name="arrowRight" size={18}/></Link></div><div className="ph-banner-decoration" aria-hidden="true"><span>✳</span><span>✴</span><span>✦</span></div></section>
      </div>
      {toast && <div className="ph-toast" role="status"><ShopIcon name="check" size={19}/>{t(toast)}<button type="button" onClick={() => setToast('')} aria-label={t("Փակել")}><ShopIcon name="close" size={15}/></button></div>}
    </main>
  );
};
