import { countLabel, useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { formatPrice } from '../../shop/catalog.js';
import { useCatalog } from '../../shop/CatalogContext.jsx';
import { useShop } from '../../shop/ShopContext.jsx';
import { useLoginGate } from '../../shop/useLoginGate.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import { ProductReviews } from './ProductReviews.jsx';
import useProductMotion from './useProductMotion.js';
import './product.css';

export const ProductPage = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const { hash } = useLocation();
  const { products, loading: catalogLoading } = useCatalog();
  const product = products.find((item) => String(item.id) === String(id));
  const { isFavorite, toggleFavorite, addToCart, busy } = useShop();
  const requireLogin = useLoginGate();
  const rootRef = useRef(null);
  const dialogRef = useRef(null);
  const [message, setMessage] = useState('');
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [motionEnabled, setMotionEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const ready = !catalogLoading && Boolean(product);
  useProductMotion(rootRef, id, ready && motionEnabled);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setMotionEnabled(false);
    };
    sync();
    preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setMessage('');
    dialogRef.current?.close();
  }, [id]);

  useEffect(() => {
    if (!ready) return;
    if (hash === '#reviews' || hash === '#specifications') {
      const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }), 50);
      return () => clearTimeout(timer);
    }
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id, ready, hash]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  if (catalogLoading) return <main className="shop-product-page pd-state"><span className="pd-status-dot"/><p>{t('Բեռնվում է...')}</p></main>;
  if (!product) return <main className="shop-product-page pd-state"><ShopIcon name="search" size={32}/><h1>{t('Ապրանքը չգտնվեց')}</h1><Link className="pd-primary-button" to="/">{t('Վերադառնալ գլխավոր էջ')}<ShopIcon name="arrowRight" size={19}/></Link></main>;

  const available = product.stock > 0;
  const discount = product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const relatedProducts = products.filter((item) => item.id !== product.id).slice(0, 3);
  const specifications = [
    ['01', 'bolt', 'Բրենդ', product.brand],
    ['02', 'filter', 'Հիշողություն', product.storage],
    ['03', 'sparkle', 'Գույն', t(product.color)],
    ['04', 'check', 'Վիճակ', t('Նոր')],
  ];

  const handleAdd = async () => {
    if (!available || !requireLogin()) return;
    try { if (await addToCart(product)) setMessage(t('Ապրանքը ավելացվեց քո զամբյուղում ✓')); }
    catch (error) { setMessage(error.message); }
  };
  const handleLike = async () => {
    if (!requireLogin()) return;
    try {
      const selected = await toggleFavorite(product);
      setMessage(selected ? t('Ավելացվեց նախընտրածներին ✓') : t('Հեռացվեց նախընտրածներից'));
    } catch (error) { setMessage(error.message); }
  };

  return <main key={product.id} className="shop-product-page" ref={rootRef} data-motion={motionEnabled ? 'on' : 'off'}>
    <div className="pd-page-atmosphere" aria-hidden="true"><i/><i/></div>
    <div className="shop-container">
      <nav className="shop-product-breadcrumb" aria-label={t('Որտեղ եք գտնվում')}>
        <Link to="/">{t('Գլխավոր')}</Link><ShopIcon name="arrowRight" size={12}/>
        <Link to="/#products">{t('Տեսականի')}</Link><ShopIcon name="arrowRight" size={12}/><strong>{product.name}</strong>
      </nav>

      <div className="pd-page-index" aria-hidden="true"><span>PH / THE PRODUCT EDIT</span><span>{String(product.id).padStart(2, '0')} — {product.brand.toUpperCase()}</span></div>

      <div className="shop-product-panel">
        <div className="pd-gallery pd-reveal">
          <div className="pd-gallery-meta"><span><i/>{product.brand.toUpperCase()} / {product.storage}</span><span>01 — 01</span></div>
          <div className="pd-gallery-stage">
            <div className="pd-gallery-glow" aria-hidden="true"/>
            <div className="pd-gallery-orbit" aria-hidden="true"/>
            <div className="pd-gallery-float">
              <div className="pd-gallery-object pd-tilt">
                <div className="pd-depth-plate pd-depth-plate-one" aria-hidden="true"/>
                <div className="pd-depth-plate pd-depth-plate-two" aria-hidden="true"/>
                <div className={`shop-product-visual ph-media-${product.tone}`}>
                  <img src={product.image} alt={product.name} fetchPriority="high"/>
                  <div className="pd-gallery-shine" aria-hidden="true"/>
                  <span className="shop-product-tag"><ShopIcon name="sparkle" size={13}/>{t(product.tag)}</span>
                  <span className="shop-product-visual-note">{product.brand.toUpperCase()}<span>{product.storage}</span></span>
                  <button className="pd-image-expand" type="button" onClick={() => dialogRef.current?.showModal()} aria-label={t('Մեծացնել նկարը')} title={t('Մեծացնել նկարը')}><svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg></button>
                </div>
              </div>
            </div>
          </div>
          <div className="pd-gallery-toolbar">
            <button className={`pd-motion-toggle ${motionEnabled ? 'is-active' : ''}`} type="button" disabled={reducedMotion} aria-pressed={motionEnabled} onClick={() => setMotionEnabled((enabled) => !enabled)}><span className="pd-motion-cube" aria-hidden="true">◇</span>{t('3D շարժում')}<span className="pd-toggle-track" aria-hidden="true"><i/></span></button>
            <span className="pd-gallery-hint">{t('Շարժիր մկնիկը՝ խորությունը զգալու համար')}</span>
          </div>
        </div>

        <section className="shop-product-body" aria-labelledby="product-title">
          <div className="pd-product-eyebrow pd-reveal"><span>{product.brand} / {t('Սմարթֆոններ')}</span><span className={`shop-product-availability ${available ? '' : 'is-unavailable'}`}><i className="shop-product-stock-dot"/>{available ? t('Առկա է') : t('Առկա չէ')}</span></div>
          <h1 id="product-title" className="pd-reveal">{product.name}<span className="pd-title-dot">.</span></h1>
          <a href="#reviews" className="shop-product-rating pd-reveal"><ShopIcon name="star" size={15} fill={product.reviews ? '#e8c58a' : 'none'}/><b>{product.reviews ? product.rating : t('Դեռ գնահատական չկա')}</b><span>· {product.reviews} {countLabel(product.reviews, language, 'reviews')}</span><ShopIcon name="arrowRight" size={13}/></a>
          <p className="shop-product-description pd-reveal">{t(product.description)}</p>
          <div className="pd-configuration pd-reveal"><span><i className="pd-color-dot"/>{t(product.color)}</span><span>{product.storage}</span><span>{t('Նոր')}</span></div>
          <div className="pd-purchase-panel pd-reveal">
            <span className="pd-price-label">{t('Քո հաջորդ քայլը՝')}</span>
            <div className="shop-product-prices"><strong>{formatPrice(product.price)}</strong>{product.oldPrice > product.price && <del>{formatPrice(product.oldPrice)}</del>}{discount > 0 && <span className="pd-discount">−{discount}%</span>}</div>
            {available && <p className="pd-stock-count"><span/>{t('Առկա է ·')} {product.stock} {t('հատ')}</p>}
            <div className="shop-product-actions">
              <button className="pd-primary-button shop-product-add" type="button" disabled={busy || !available} onClick={handleAdd}><ShopIcon name="bag" size={20}/><span>{t('Ավելացնել զամբյուղ')}</span><i><ShopIcon name="arrowRight" size={19}/></i></button>
              <button type="button" disabled={busy} className={`shop-product-like ${isFavorite(product.id) ? 'active' : ''}`} onClick={handleLike} aria-label={isFavorite(product.id) ? t('Հեռացնել նախընտրածներից') : t('Ավելացնել նախընտրածներին')} aria-pressed={isFavorite(product.id)}><ShopIcon name="heart" size={21} fill={isFavorite(product.id) ? 'currentColor' : 'none'}/></button>
            </div>
            <p className="shop-product-login-tip"><ShopIcon name="shield" size={15}/>{t('Զամբյուղ և նախընտրածներ ավելացնելու համար անհրաժեշտ է մուտք գործել քո հաշիվ։')}</p>
          </div>
          <div className="pd-detail-links pd-reveal"><a href="#specifications">{t('Ապրանքի մանրամասները')}<ShopIcon name="arrowRight" size={16}/></a><Link to="/contact">{t('Օգնե՞նք ընտրել')}<ShopIcon name="arrowRight" size={16}/></Link></div>
        </section>
      </div>

      <section className="pd-specification-section" id="specifications" aria-labelledby="specifications-title">
        <div className="pd-section-head pd-reveal"><div><span className="pd-eyebrow">01 / {t('ՄԱՆՐԱՄԱՍՆԵՐ')}</span><h2 id="specifications-title">{t('Ամեն մանրուքը՝')}<br/><span>{t('քո ընտրության համար։')}</span></h2></div><span className="pd-section-note">{product.name} / {product.storage}</span></div>
        <div className="shop-product-specs">{specifications.map(([number, icon, label, value]) => <div className="pd-spec-card pd-reveal" key={number}><div className="pd-spec-top"><span>{number} /</span><ShopIcon name={icon} size={23}/></div><span className="pd-spec-label">{t(label)}</span><strong>{value || '—'}</strong></div>)}</div>
      </section>

      <ProductReviews key={product.id} product={product}/>

      {relatedProducts.length > 0 && <section className="pd-related" aria-labelledby="related-title">
        <div className="pd-section-head pd-reveal"><div><span className="pd-eyebrow">03 / {t('ԲԱՑԱՀԱՅՏԻՐ ԱՎԵԼԻՆ')}</span><h2 id="related-title">{t('Դեռ փնտրո՞ւմ ես')}<br/><span>{t('քո տարբերակը։')}</span></h2></div><Link to="/#products" className="pd-all-products">{t('Դիտել տեսականին')}<ShopIcon name="arrowRight" size={19}/></Link></div>
        <div className="pd-related-grid">{relatedProducts.map((item, index) => <Link to={`/product/${item.id}`} className="pd-related-card pd-tilt pd-reveal" key={item.id} style={{ '--pd-delay': `${index * 65}ms` }}><div className="pd-related-image"><img src={item.image} alt={item.name} loading="lazy"/><span>{item.brand}</span><i><ShopIcon name="arrowRight" size={21}/></i></div><div className="pd-related-info"><div><span>{item.storage} · {t(item.color)}</span><h3>{item.name}</h3></div><strong>{formatPrice(item.price)}</strong></div></Link>)}</div>
      </section>}

      <Link to="/#products" className="shop-product-back"><span><ShopIcon name="arrowLeft" size={18}/></span>{t('Տեսնել մյուս ապրանքները')}</Link>
    </div>

    <dialog className="pd-image-dialog" ref={dialogRef} aria-label={`${product.name} — ${t('Մեծացնել նկարը')}`} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}><button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('Փակել')}><ShopIcon name="close" size={22}/></button><img src={product.image} alt={product.name}/><p>{product.name} <span>{product.storage} · {t(product.color)}</span></p></dialog>
    {message && <div className="ph-toast" role="status"><ShopIcon name="check" size={18}/>{t(message)}<button type="button" onClick={() => setMessage('')} aria-label={t('Փակել')}><ShopIcon name="close" size={16}/></button></div>}
  </main>;
};
