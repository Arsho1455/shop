import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { Link } from 'react-router-dom';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './footer.css';

export const MyFooter = () => {
  const { t } = useLanguage();

  return <footer className="footer">
    <div className="shop-container footer-main">
      <div className="footer-brand">
        <Link to="/" className="footer-logo"><span><ShopIcon name="bolt" size={20} fill="white"/></span>phone<b>Shop</b><i>.</i></Link>
        <p>{t("Քո տեխնոլոգիական աշխարհը՝ մեկ վայրում։ Գտիր սիրված սմարթֆոնները պարզ, գեղեցիկ և հարմար միջավայրում։")}</p>
        <div className="footer-legal"><ShopIcon name="shield" size={15}/> {t("Անվտանգ անձնական հաշիվ")}</div>
      </div>
      <div className="footer-links">
        <strong>{t("Բացահայտիր")}</strong>
        <Link to="/">{t("Գլխավոր")}</Link>
        <Link to="/#products">{t("Սմարթֆոններ")}</Link>
        <Link to="/contact">{t("Կապ մեզ հետ")}</Link>
      </div>
      <div className="footer-links">
        <strong>{t("Իմ հաշիվը")}</strong>
        <Link to="/auth?mode=login">{t("Մուտք / Գրանցում")}</Link>
        <Link to="/profile/favorites">{t("Նախընտրածներ")}</Link>
        <Link to="/profile/cart">{t("Զամբյուղ")}</Link>
      </div>
      <div className="footer-news">
        <span className="footer-news-kicker">PHONESHOP</span>
        <strong>{t("Ամեն ինչ սկսվում է ճիշտ ընտրությունից։")}</strong>
        <Link to="/#products">{t("Դիտել տեսականին")} <ShopIcon name="arrowRight" size={16}/></Link>
      </div>
    </div>
    <div className="footer-bottom shop-container">
      <span>© {new Date().getFullYear()} {t("PhoneShop. Բոլոր իրավունքները պաշտպանված են։")}</span>
      <span>{t("Ստեղծված է Հայաստանում")} <span aria-hidden="true">✦</span></span>
    </div>
    <div className="footer-wordmark" aria-hidden="true"><span>phone<span>Shop</span><i>.</i></span></div>
  </footer>;
};
