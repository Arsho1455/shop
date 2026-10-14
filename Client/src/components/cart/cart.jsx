import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../shop/ShopContext.jsx';
import { formatPrice } from '../../shop/catalog.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './cart.css';

export const CartPage = () => {
  const { t } = useLanguage();
  const { cart, loading, busy, setCartQuantity, removeFromCart, clearCart, error } = useShop();
  const [notice, setNotice] = useState('');
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const act = async (action) => {
    setNotice('');
    try { await action(); }
    catch (err) { setNotice(err.message); }
  };
  return <section className="account-list-panel" aria-labelledby="cart-heading">
    <div className="account-list-heading"><div><span className="shop-eyebrow">{t("ՔՈ ԳՆՈՒՄՆԵՐԸ")}</span><h2 id="cart-heading">{t("Իմ զամբյուղը")} <span>{totalQuantity}</span></h2><p>{t("Պահպանիր քեզ հետաքրքրող ապրանքները քո հաշվում։")}</p></div>{cart.length > 0 && <button className="account-text-button" type="button" disabled={busy} onClick={() => act(clearCart)}><ShopIcon name="trash" size={16}/> {t("Մաքրել զամբյուղը")}</button>}</div>
    {notice && <p className="account-shop-error" role="alert">{t(notice)}</p>}
    {error && <p className="account-shop-error" role="alert">{t(error)}</p>}
    {loading ? <p className="account-shop-wait">{t("Բեռնվում է...")}</p> : cart.length === 0 ? <div className="account-shop-empty"><span className="account-shop-empty-icon"><ShopIcon name="bag" size={35}/></span><h3>{t("Զամբյուղդ դեռ դատարկ է")}</h3><p>{t("Ընտրիր քեզ դուր եկած հեռախոսը և ավելացրու այստեղ։")}</p><Link to="/#products" className="shop-btn-primary">{t("Գնալ գնումների")} <ShopIcon name="arrowRight" size={17}/></Link></div> : <div className="account-cart-layout"><div className="account-cart-products">{cart.map((item) => <article className="account-cart-row" key={item.id}>
      <Link to={`/product/${item.id}`} className={`account-cart-image ph-media-${item.tone}`}><img src={item.image} alt={item.name}/></Link>
      <div className="account-cart-info"><span className="account-cart-meta">{item.brand} · {item.storage}</span><Link to={`/product/${item.id}`} className="account-cart-name">{item.name}</Link><strong>{formatPrice(item.price)}</strong><div className="account-quantity"><button disabled={busy} type="button" onClick={() => act(() => setCartQuantity(item.id, item.quantity - 1))} aria-label={t("Պակասեցնել քանակը")}><ShopIcon name="minus" size={15}/></button><span>{item.quantity}</span><button disabled={busy || item.quantity >= 99} type="button" onClick={() => act(() => setCartQuantity(item.id, item.quantity + 1))} aria-label={t("Ավելացնել քանակը")}><ShopIcon name="plus" size={15}/></button></div></div>
      <div className="account-cart-side"><strong>{formatPrice(item.quantity * item.price)}</strong><button type="button" disabled={busy} aria-label={t("Հեռացնել զամբյուղից")} onClick={() => act(() => removeFromCart(item.id))}><ShopIcon name="trash" size={17}/></button></div>
    </article>)}</div><aside className="account-cart-summary"><div className="account-summary-badge"><ShopIcon name="bag" size={20}/></div><h3>{t("Քո պատվերը")}</h3><div><span>{t("Ապրանքների քանակը")}</span><strong>{totalQuantity}</strong></div><div><span>{t("Ընդհանուր արժեքը")}</span><strong>{formatPrice(totalPrice)}</strong></div><hr/><p className="account-summary-total"><span>{t("Ընդամենը")}</span><strong>{formatPrice(totalPrice)}</strong></p><p className="account-summary-disclaimer">{t("Առցանց վճարման և պատվերի հաստատման գործառույթը դեռ միացված չէ։")}</p><Link to="/#products" className="shop-btn-soft">{t("Շարունակել ընտրել")} <ShopIcon name="arrowRight" size={17}/></Link></aside></div>}
  </section>;
};
