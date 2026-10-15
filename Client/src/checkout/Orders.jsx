import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../auth/lib/api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { formatPrice } from '../shop/catalog.js';
import ShopIcon from '../shop/ShopIcon.jsx';
import './checkout.css';

export default function Orders() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { let active=true; api('/api/orders').then(result=>{if(active)setOrders(result.orders || []);}).catch(err=>{if(active)setError(err.message);}).finally(()=>{if(active)setLoading(false);}); return ()=>{active=false;}; }, []);
  const statusName = { demo_completed: 'Դեմո պատվեր', paid: 'Վճարված', refunded: 'Վերադարձված', pending_payment: 'Սպասման մեջ', failed: 'Չվճարված', payment_setup_failed: 'Չվճարված' };
  return <section className="checkout-orders"><div className="account-list-heading"><div><span className="shop-eyebrow">{t('ՊԱՏՎԵՐՆԵՐԻ ՊԱՏՄՈՒԹՅՈՒՆ')}</span><h2>{t('Իմ պատվերները')}</h2><p>{t('Այստեղ պահվում են քո փորձնական պատվերները։')}</p></div></div>
    {loading && <p>{t('Բեռնվում է...')}</p>}{error && <p role="alert" className="checkout-error">{t(error)}</p>}
    {!loading && !orders.length && <div className="account-shop-empty"><span className="account-shop-empty-icon"><ShopIcon name="bag" size={34}/></span><h3>{t('Դեռ պատվերներ չկան')}</h3><Link to="/#products" className="shop-btn-primary">{t('Գնալ գնումների')}</Link></div>}
    <div className="checkout-orders-list">{orders.map(order => <article key={order.id} className="checkout-order-card"><div className="checkout-order-top"><span><b>{order.orderNumber}</b><small>{new Date(order.createdAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'hy-AM')}</small></span><span className={`checkout-status ${order.status}`}>{t(statusName[order.status] || 'Սպասման մեջ')}</span></div><div className="checkout-order-items">{order.items.map(item => <span key={item.productId} className="checkout-order-product"><img src={item.image} alt=""/><span>{item.name}<small>× {item.quantity}</small></span></span>)}</div><div className="checkout-order-bottom"><div><small>{t('Ընդամենը')}</small><strong>{formatPrice(order.total)}</strong></div><Link to={`/checkout/result?order=${encodeURIComponent(order.id)}`}>{t('Դիտել պատվերը')} <ShopIcon name="arrowRight" size={16}/></Link></div></article>)}</div>
  </section>;
}
