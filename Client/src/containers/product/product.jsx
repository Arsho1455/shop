import { countLabel, useLanguage } from '../../i18n/LanguageContext.jsx';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatPrice } from '../../shop/catalog.js';
import { useCatalog } from '../../shop/CatalogContext.jsx';
import { useShop } from '../../shop/ShopContext.jsx';
import { useLoginGate } from '../../shop/useLoginGate.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './product.css';

export const ProductPage = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const { products, loading: catalogLoading } = useCatalog();
  const product = products.find((item) => String(item.id) === String(id));
  const { isFavorite, toggleFavorite, addToCart, busy } = useShop();
  const requireLogin = useLoginGate();
  const [message, setMessage] = useState('');
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(''), 3500); return () => clearTimeout(timer); }, [message]);

  if (catalogLoading) return <main className="shop-product-missing shop-container">{t("Բեռնվում է...")}</main>;
  if (!product) return <main className="shop-product-missing shop-container"><h1>{t("Ապրանքը չգտնվեց")}</h1><Link className="shop-btn-primary" to="/">{t("Վերադառնալ գլխավոր էջ")}</Link></main>;
  const handleAdd = async () => {
    if (!requireLogin()) return;
    try { if (await addToCart(product)) setMessage(t("Ապրանքը ավելացվեց քո զամբյուղում ✓")); }
    catch (error) { setMessage(error.message); }
  };
  const handleLike = async () => {
    if (!requireLogin()) return;
    try { const selected = await toggleFavorite(product); setMessage(selected ? t("Ավելացվեց նախընտրածներին ✓") : t("Հեռացվեց նախընտրածներից")); }
    catch (error) { setMessage(error.message); }
  };

  return <main className="shop-product-page shop-container">
    <nav className="shop-product-breadcrumb" aria-label={t("Որտեղ եք գտնվում")}><Link to="/">{t("Գլխավոր")}</Link><ShopIcon name="arrowRight" size={13}/><Link to="/#products">{t("Տեսականի")}</Link><ShopIcon name="arrowRight" size={13}/><strong>{product.name}</strong></nav>
    <div className="shop-product-panel">
      <div className={`shop-product-visual ph-media-${product.tone}`}>
        <span className="shop-product-tag"><ShopIcon name="sparkle" size={16}/>{t(product.tag)}</span>
        <img src={product.image} alt={product.name}/>
        <span className="shop-product-visual-note">01 / 01 · {product.brand.toUpperCase()}</span>
      </div>
      <section className="shop-product-body">
        <span className="shop-eyebrow">{product.brand.toUpperCase()} · {product.storage}</span>
        <h1>{product.name}</h1>
        <div className="shop-product-rating"><ShopIcon name="star" size={16} fill="#ffb95d"/><b>{product.rating}</b><span>· {product.reviews} {countLabel(product.reviews, language, "reviews")}</span></div>
        <p className="shop-product-description">{t(product.description)}</p>
        <div className="shop-product-prices"><strong>{formatPrice(product.price)}</strong>{product.oldPrice > product.price && <del>{formatPrice(product.oldPrice)}</del>}<span>{t("Հատուկ գին")}</span></div>
        <div className="shop-product-availability"><span className="shop-product-stock-dot"/>{t("Առկա է ·")} {product.stock} {t("հատ")}</div>
        <div className="shop-product-actions">
          <button className="shop-btn-primary shop-product-add" type="button" disabled={busy} onClick={handleAdd}><ShopIcon name="bag" size={21}/> {t("Ավելացնել զամբյուղ")} <ShopIcon name="arrowRight" size={18}/></button>
          <button type="button" disabled={busy} className={`shop-product-like ${isFavorite(product.id) ? 'active' : ''}`} onClick={handleLike} aria-label={isFavorite(product.id) ? t("Հեռացնել նախընտրածներից") : t("Ավելացնել նախընտրածներին")}><ShopIcon name="heart" size={22} fill={isFavorite(product.id) ? 'currentColor' : 'none'}/></button>
        </div>
        <p className="shop-product-login-tip"><ShopIcon name="shield" size={17}/> {t("Զամբյուղ և նախընտրածներ ավելացնելու համար անհրաժեշտ է մուտք գործել քո հաշիվ։")}</p>
        <div className="shop-product-specs"><div><span>{t("Բրենդ")}</span><strong>{product.brand}</strong></div><div><span>{t("Հիշողություն")}</span><strong>{product.storage}</strong></div><div><span>{t("Գույն")}</span><strong>{t(product.color)}</strong></div><div><span>{t("Վիճակ")}</span><strong>{t("Նոր")}</strong></div></div>
      </section>
    </div>
    <Link to="/#products" className="shop-product-back"><ShopIcon name="arrowLeft" size={18}/> {t("Տեսնել մյուս ապրանքները")}</Link>
    {message && <div className="ph-toast" role="status"><ShopIcon name="check" size={18}/>{t(message)}<button type="button" onClick={() => setMessage('')} aria-label={t("Փակել")}><ShopIcon name="close" size={16}/></button></div>}
  </main>;
};
