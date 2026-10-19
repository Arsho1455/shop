import { countLabel, useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../shop/catalog.js';
import { useCatalog } from '../../shop/CatalogContext.jsx';
import { useShop } from '../../shop/ShopContext.jsx';
import { useLoginGate } from '../../shop/useLoginGate.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './home.css';
import { filterAndSortProducts } from '../../shop/productFilters.js';
import PhoneScene from './PhoneScene.jsx';
import useCinematicMotion from './useCinematicMotion.js';

const allBrands = 'Բոլորը';

export const HomePage = () => {
  const homeRef = useRef(null);
  useCinematicMotion(homeRef);
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
      const timer = setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }), 80);
      return () => clearTimeout(timer);
    }
    if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.hash, location.search, location.key]);

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
    <main className="ph-home" ref={homeRef}>
        <section className="ph-hero" aria-labelledby="hero-title">
          <div className="ph-atmosphere" aria-hidden="true"><div className="ph-light ph-light-blue"/><div className="ph-light ph-light-amber"/><div className="ph-grain"/><div className="ph-orbital-grid"/></div>
          <div className="ph-hero-inner shop-container">
          <div className="ph-hero-coordinate" aria-hidden="true"><span>PH / THE NEXT CHAPTER</span><span>DESIGNED AROUND YOU ↗</span></div>
          <div className="ph-hero-copy">
            <span className="ph-kicker"><span className="ph-live-dot"/> {t('ՏԵԽՆՈԼՈԳԻԱ, ՈՐ ԶԳՈՒՄ ԵՍ')} <ShopIcon name="arrowRight" size={13}/></span>
            <h1 id="hero-title"><span className="ph-title-line">{t("Քո աշխարհը՝")}</span><span className="ph-title-line ph-title-gradient">{t("մեկ հպումով։")}</span></h1>
            <p>{t('Մեծ գաղափարներ։ Անսահման հնարավորություններ։ Գտիր այն սմարթֆոնը, որը կհամընկնի քո ռիթմին։')}</p>
            <div className="ph-hero-actions">
              <a href="#products" className="ph-button ph-button-light">{t("Դիտել տեսականին")} <span><ShopIcon name="arrowRight" size={19}/></span></a>
              <Link to="/contact" className="ph-hero-link">{t("Օգնե՞նք ընտրել")} <ShopIcon name="arrowRight" size={16}/></Link>
            </div>
            <div className="ph-hero-note"><span className="ph-note-symbol"><ShopIcon name="shield" size={18}/></span><span>{t('Քո հաջորդ սիրելի սմարթֆոնը։')}<small>{t('Ընտրված է քո առօրյայի համար։')}</small></span></div>
          </div>
          <div className="ph-hero-art"><PhoneScene /></div>
          <div className="ph-hero-bottom"><a href="#products" className="ph-scroll-cue"><span className="ph-scroll-icon"/>{t('Ոլորիր՝ բացահայտելու համար')}</a><span className="ph-edition">CURATED TECH. EVERYDAY POSSIBILITIES.</span><span className="ph-hero-index"><b>01</b> / 03</span></div>
          </div>
        </section>

        <div className="ph-brand-band" aria-label={t('Սիրված բրենդներ')}>
          <div className="ph-brand-band-label">{t('Տարբեր բրենդներ։ Նույն կիրքը։')}</div>
          <div className="ph-marquee"><div className="ph-marquee-track">{[0, 1].map((copy) => <div className="ph-marquee-group" key={copy} aria-hidden={copy === 1}>{[...new Set(products.map((p) => p.brand))].map((name) => <span key={name}>{name}<i>✳</i></span>)}</div>)}</div></div>
        </div>

      <div className="shop-container">
        <section className="ph-collection" id="products" aria-labelledby="collection-title">
          <div className="ph-section-topline ph-reveal"><span className="shop-eyebrow"><span className="ph-live-dot"/>{t("ՀԱՏՈՒԿ ՔԵԶ ՀԱՄԱՐ")}</span><span className="ph-section-index">01 / THE COLLECTION</span></div>
          <div className="ph-section-head ph-reveal"><div><h2 id="collection-title">{t("Գտիր քո")}<br/><em>{t("իդեալականը")}</em><span className="ph-heading-period">.</span></h2><p>{t("Հատուկ ընտրված սմարթֆոններ՝ յուրահատուկ հնարավորություններով։")}</p></div><Link to="/profile/favorites" className="ph-section-favorites">{t("Իմ նախընտրածները")} <span><ShopIcon name="arrowRight" size={19}/></span></Link></div>
          <div className="ph-filter-row" role="group" aria-label={t('Ֆիլտրել ըստ բրենդի')}>
            <div className="ph-filter-pills">{categories.map((item) => <button type="button" key={item} onClick={() => setBrand(item)} className={`ph-filter-pill ${brand === item ? 'active' : ''}`} aria-pressed={brand === item}>{t(item)}</button>)}</div>
            <div className="ph-products-count"><ShopIcon name="filter" size={17}/>{visibleProducts.length} {countLabel(visibleProducts.length, language)}</div>
          </div>
          <div className="ph-filter-shell">
            <div className="ph-filter-toolbar">
              <button className={`ph-filter-toggle ${filtersOpen ? 'active' : ''}`} type="button" aria-expanded={filtersOpen} aria-controls="ph-filter-panel" onClick={() => setFiltersOpen((prev) => !prev)}><ShopIcon name="filter" size={17}/> {t('Մանրամասն ֆիլտրեր')} <span>{filtersOpen ? '−' : '+'}</span></button>
              <label className="ph-sort-control"><span>{t('Դասավորել ըստ')}</span><select aria-label={t('Դասավորել ըստ')} value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="default">{t('Լռելյայն')}</option><option value="priceLow">{t('Գին՝ էժանից թանկ')}</option><option value="priceHigh">{t('Գին՝ թանկից էժան')}</option><option value="ratingHigh">{t('Բարձր գնահատական')}</option><option value="newest">{t('Նոր ապրանքներ')}</option><option value="name">{t('Անուն՝ Ա-Ֆ')}</option></select></label>
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
          {visibleProducts.length ? <div className="ph-products-grid">{visibleProducts.map((product, index) => (
            <article className="ph-card ph-reveal" key={product.id} style={{ '--reveal-delay': `${Math.min(index, 3) * 70}ms` }}>
              <div className={`ph-card-media ph-media-${product.tone}`}>
                <span className="ph-card-label">{t(product.tag)}</span>
                <button type="button" disabled={busy} className={`ph-card-heart ${isFavorite(product.id) ? 'active' : ''}`} onClick={() => handleFavorite(product)} aria-label={isFavorite(product.id) ? `${product.name}${t(": հեռացնել նախընտրածներից")}` : `${product.name}${t(": ավելացնել նախընտրածներին")}`} aria-pressed={isFavorite(product.id)}><ShopIcon name="heart" size={20} fill={isFavorite(product.id) ? 'currentColor' : 'none'} /></button>
                <span className="ph-card-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <Link to={`/product/${product.id}`} className="ph-card-img-link" aria-label={`${t("Դիտել ")}${product.name}`}><img src={product.image} alt={product.name} loading="lazy"/></Link>
                <Link to={`/product/${product.id}`} className="ph-card-explore" tabIndex={-1} aria-hidden="true"><ShopIcon name="arrowRight" size={20}/></Link>
              </div>
              <div className="ph-card-info"><div className="ph-card-meta"><span>{product.brand} · {product.storage}</span><span><ShopIcon name="star" size={13} fill={product.reviews ? "#ffb95d" : "none"} strokeWidth={1.2}/> {product.reviews ? product.rating : t("Նոր")}</span></div>
                <Link to={`/product/${product.id}`} className="ph-card-name">{product.name}</Link>
                <div className="ph-card-prices"><strong>{formatPrice(product.price)}</strong>{product.oldPrice > product.price && <del>{formatPrice(product.oldPrice)}</del>}</div>
                <button type="button" className="ph-card-cart-btn" disabled={busy || product.stock <= 0} aria-label={`${product.name}: ${t("Ավելացնել զամբյուղ")}`} onClick={() => handleCart(product)}><ShopIcon name="bag" size={18}/><span>{t("Ավելացնել զամբյուղ")}</span><ShopIcon name="arrowRight" size={16}/></button>
              </div>
            </article>
          ))}</div> : <div className="ph-no-results"><ShopIcon name="search" size={30}/><h3>{t("Ապրանք չգտնվեց")}</h3><p>{t("Փորձիր այլ որոնում կամ ընտրիր ուրիշ բրենդ։")}</p><button onClick={clearFilters}>{t("Ցույց տալ բոլորը")}</button></div>}
        </section>

      </div>

      <section className="ph-story" aria-labelledby="story-title">
        <div className="ph-story-sticky">
          <div className="ph-story-halo" aria-hidden="true"/>
          <div className="shop-container ph-story-layout">
            <div className="ph-story-copy">
              <span className="shop-eyebrow">02 / {t('ՔՈ ՌԻԹՄՈՎ')}</span>
              <h2 id="story-title"><span>{t('Ավելի մոտ։')}</span><span>{t('Ավելի հզոր։')}</span><span>{t('Ավելի դու։')}</span></h2>
              <p>{t('Կադրեր, որոնք կպահես։ Գաղափարներ, որոնք կիրականացնես։ Մի ամբողջ աշխարհ՝ քո ձեռքերում։')}</p>
              <a className="ph-text-link" href="#products">{t('Գտիր քո սմարթֆոնը')}<ShopIcon name="arrowRight" size={20}/></a>
              <div className="ph-story-steps" aria-hidden="true"><i/><i/><i/><span>SCROLL TO FEEL THE DIFFERENCE</span></div>
            </div>
            <div className="ph-story-art"><PhoneScene compact /></div>
          </div>
        </div>
      </section>

      <div className="shop-container">
        <section className="ph-service-section" aria-labelledby="service-title">
          <div className="ph-section-topline ph-reveal"><span className="shop-eyebrow">03 / THE PHONESHOP WAY</span><span className="ph-section-index">{t('Ամեն մանրուքը կարևոր է։')}</span></div>
          <h2 id="service-title" className="ph-service-title ph-reveal">{t('Լավ տեխնիկա։')}<br/><span>{t('Ավելի լավ փորձառություն։')}</span></h2>
          <div className="ph-benefit-strip">
            {[
              ['01', 'search', 'Ընտրիր քո ռիթմով', 'Համեմատիր բրենդները, գներն ու հնարավորությունները՝ քեզ հարմար ֆիլտրերով։'],
              ['02', 'heart', 'Պահիր սիրելիներդ', 'Հավանիր մոդելները և վերադարձիր դրանց քո անձնական էջում։'],
              ['03', 'user', 'Մենք քո կողքին ենք', 'Ընտրության հարցում օգնության կարի՞ք ունես։ Գրիր մեզ, միասին կգտնենք քո տարբերակը։'],
            ].map(([number, icon, title, description]) => <article className="ph-benefit ph-reveal" key={number}><div className="ph-benefit-top"><span>{number} /</span><ShopIcon name={icon} size={26}/></div><h3>{t(title)}</h3><p>{t(description)}</p></article>)}
          </div>
        </section>
        <section className="ph-bottom-banner ph-reveal"><div className="ph-banner-orbit" aria-hidden="true"/><div className="ph-banner-content"><span className="ph-banner-eyebrow"><span className="ph-live-dot"/>{t('ՔՈ ՀԱՋՈՐԴ ԳԼՈՒԽԸ')}</span><h2>{t("Նոր հեռախո՞ս։")}<br/><span>{t("Լավ ընտրություն։")}</span></h2><p>{t("Գտիր հենց քո ոճին համապատասխան տեխնիկան։")}</p><Link className="ph-button ph-button-light" to="/contact">{t("Կապ հաստատել")} <span><ShopIcon name="arrowRight" size={20}/></span></Link></div><span className="ph-banner-star" aria-hidden="true">✳</span></section>
      </div>
      {toast && <div className="ph-toast" role="status"><ShopIcon name="check" size={19}/>{t(toast)}<button type="button" onClick={() => setToast('')} aria-label={t("Փակել")}><ShopIcon name="close" size={15}/></button></div>}
    </main>
  );
};
