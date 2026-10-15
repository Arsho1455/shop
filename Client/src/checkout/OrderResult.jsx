import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { api } from '../auth/lib/api.js';
import { formatPrice } from '../shop/catalog.js';
import ShopIcon from '../shop/ShopIcon.jsx';
import './checkout.css';

export default function OrderResult() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [query] = useSearchParams();
  const navigate = useNavigate();
  const id = query.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!authLoading && !user) navigate(`/auth?mode=login&next=${encodeURIComponent(`/checkout/result?order=${id || ''}`)}`, { replace: true });
  }, [authLoading, user, navigate, id]);
  useEffect(() => {
    if (!user || !id) { setLoading(false); return; }
    let active = true;
    api(`/api/orders/${encodeURIComponent(id)}`)
      .then(({ order: data }) => { if (active) setOrder(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, user?.id]);
  const complete = order?.status === 'demo_completed';
  return <main className="checkout-page"><div className="shop-container checkout-result-container"><section className="checkout-result-card">
    <span className={`checkout-result-icon ${complete ? 'success' : 'pending'}`}><ShopIcon name={complete ? 'check' : 'clock'} size={38}/></span>
    <span className="shop-eyebrow">{t('ԴԵՄՈ ՊԱՏՎԵՐ')}</span><h1>{t(complete ? 'Դեմո գնումը հաջողությամբ գրանցվեց' : 'Պատվերի կարգավիճակ')}</h1>
    <p>{t(complete ? 'Քո փորձնական պատվերը պահվել է պրոֆիլում։ Վճարում և իրական առաքում չեն կատարվել։' : 'Բացվում են պատվերի տվյալները։')}</p>
    {loading && <p>{t('Բեռնվում է...')}</p>}
    {order && <div className="checkout-result-details"><div><span>{t('Պատվերի համար')}</span><strong>{order.orderNumber}</strong></div><div><span>{t('Գումար')}</span><strong>{formatPrice(order.total)}</strong></div><div><span>{t('Վիճակ')}</span><strong>{t(complete ? 'Դեմո պատվեր' : 'Սպասման մեջ')}</strong></div></div>}
    {error && <p className="checkout-error" role="alert">{t(error)}</p>}
    <div className="checkout-result-actions"><Link className="shop-btn-primary" to="/profile/orders">{t('Իմ պատվերները')} <ShopIcon name="arrowRight" size={17}/></Link><Link className="shop-btn-soft" to="/#products">{t('Շարունակել ընտրել')} <ShopIcon name="arrowRight" size={17}/></Link></div>
  </section></div></main>;
}
