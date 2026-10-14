import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../shop/ShopContext.jsx';
import { formatPrice } from '../../shop/catalog.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './favorites.css';

export const FavoritesPage = () => {
  const { t } = useLanguage();
  const { favorites, loading, busy, removeFavorite, clearFavorites, addToCart, error } = useShop();
  const [notice, setNotice] = useState('');
  const act = async (action, success) => {
    setNotice('');
    try { await action(); if (success) setNotice(success); }
    catch (err) { setNotice(err.message); }
  };
  return <section className="account-list-panel" aria-labelledby="favorites-heading">
    <div className="account-list-heading"><div><span className="shop-eyebrow">{t("ՔՈ ԸՆՏՐՈՒԹՅՈՒՆՆԵՐԸ")}</span><h2 id="favorites-heading">{t("Իմ նախընտրածները")} <span>{favorites.length}</span></h2><p>{t("Այստեղ հավաքված են քո պահպանած ապրանքները։")}</p></div>{favorites.length > 0 && <button className="account-text-button" type="button" disabled={busy} onClick={() => act(clearFavorites, t("Նախընտրածները մաքրված են։"))}><ShopIcon name="trash" size={16}/> {t("Մաքրել բոլորը")}</button>}</div>
    {notice && <p className="account-shop-notice" role="status">{t(notice)}</p>}
    {error && <p className="account-shop-error" role="alert">{t(error)}</p>}
    {loading ? <p className="account-shop-wait">{t("Բեռնվում է...")}</p> : favorites.length === 0 ? <div className="account-shop-empty"><span className="account-shop-empty-icon"><ShopIcon name="heart" size={35}/></span><h3>{t("Դեռ նախընտրածներ չունես")}</h3><p>{t("Սեղմիր ապրանքի սրտիկի վրա, և այն կհայտնվի այստեղ։")}</p><Link className="shop-btn-primary" to="/#products">{t("Դիտել տեսականին")} <ShopIcon name="arrowRight" size={17}/></Link></div> : <div className="account-favs-grid">{favorites.map((item) => <article className="account-fav-card" key={item.id}>
      <Link to={`/product/${item.id}`} className={`account-fav-image ph-media-${item.tone}`}><img src={item.image} alt={item.name}/></Link>
      <div className="account-fav-details"><span>{item.brand} · {item.storage}</span><Link to={`/product/${item.id}`}>{item.name}</Link><strong>{formatPrice(item.price)}</strong><div className="account-fav-actions"><button type="button" disabled={busy} onClick={() => act(() => addToCart(item), t("Ավելացվեց զամբյուղում։"))}><ShopIcon name="bag" size={16}/> {t("Զամբյուղ")}</button><button className="account-remove" type="button" disabled={busy} aria-label={t("Հեռացնել նախընտրածներից")} onClick={() => act(() => removeFavorite(item.id))}><ShopIcon name="trash" size={17}/></button></div></div>
    </article>)}</div>}
  </section>;
};
