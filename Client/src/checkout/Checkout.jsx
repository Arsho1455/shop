import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext.jsx';
import { useShop } from '../shop/ShopContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { api } from '../auth/lib/api.js';
import { formatPrice } from '../shop/catalog.js';
import ShopIcon from '../shop/ShopIcon.jsx';
import { demoCardValid, formatDemoCard, formatDemoExpiry, SAMPLE_CARD } from './demoCard.js';
import './checkout.css';

const addressFields = [
  { key: 'fullName', label: 'Ստացողի անուն, ազգանուն', placeholder: 'Անուն Ազգանուն', autocomplete: 'name', required: true },
  { key: 'phone', label: 'Հեռախոսահամար', placeholder: '+374 99 123456', autocomplete: 'tel', required: true, type: 'tel' },
  { key: 'region', label: 'Մարզ', placeholder: 'Օրինակ՝ Արմավիր', autocomplete: 'address-level1' },
  { key: 'city', label: 'Քաղաք կամ գյուղ', placeholder: 'Օրինակ՝ Երևան', autocomplete: 'address-level2', required: true },
  { key: 'street', label: 'Փողոց և տուն', placeholder: 'Փողոց, տան համար', autocomplete: 'street-address', required: true },
  { key: 'apartment', label: 'Բնակարան, հարկ (ըստ ցանկության)', placeholder: 'Բնակարան, մուտք, հարկ' },
  { key: 'postalCode', label: 'Փոստային ինդեքս (ըստ ցանկության)', placeholder: '0001', autocomplete: 'postal-code' },
];
const initialAddress = { fullName: '', phone: '+374 ', region: '', city: '', street: '', apartment: '', postalCode: '', notes: '' };
const emptyCard = { holder: '', number: '', expiry: '', cvv: '' };

export default function Checkout() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refreshShop } = useShop();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState(initialAddress);
  const [card, setCard] = useState(emptyCard);
  const [settings, setSettings] = useState({ demoMode: true, demoEnabled: true, deliveryFee: 0 });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const checkoutKey = useRef(crypto.randomUUID());

  useEffect(() => {
    if (!authLoading && !user) navigate(`/auth?mode=login&next=${encodeURIComponent('/checkout')}`, { replace: true });
  }, [authLoading, user, navigate]);
  useEffect(() => {
    if (user?.name) setShipping((prev) => ({ ...prev, fullName: prev.fullName || user.name }));
  }, [user?.name]);
  useEffect(() => {
    let active = true;
    api('/api/orders/settings').then((data) => { if (active) setSettings(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setSettingsLoading(false); });
    return () => { active = false; };
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal + (settings.deliveryFee || 0);
  const setCardField = (key, value) => setCard((old) => ({ ...old, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (busy || !settings.demoEnabled || !cart.length) return;
    if (!demoCardValid(card)) {
      setError('Օգտագործիր միայն էջում նշված փորձնական քարտի տվյալները։');
      return;
    }
    setBusy(true); setError('');
    try {
      // IMPORTANT: send ONLY shipping + checkoutKey. Card number, expiry, CVV and name stay in this component.
      const { order } = await api('/api/orders/checkout', { method: 'POST', body: { shipping, checkoutKey: checkoutKey.current } });
      setCard(emptyCard); // discard sample input on successful simulation
      await refreshShop().catch(() => {});
      navigate(`/checkout/result?order=${encodeURIComponent(order.id)}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  if (authLoading || cartLoading || !user) return <main className="checkout-page shop-container"><p>{t('Բեռնվում է...')}</p></main>;
  return <main className="checkout-page"><div className="shop-container">
    <nav className="checkout-breadcrumb"><Link to="/profile/cart">{t('Իմ զամբյուղը')}</Link><ShopIcon name="arrowRight" size={14}/><strong>{t('Պատվերի ձևակերպում')}</strong></nav>
    <div className="checkout-heading"><div><span className="shop-eyebrow">{t('ԴԵՄՈ ԳՆՈՒՄ · ԳՈՒՄԱՐ ՉԻ ԳԱՆՁՎՈՒՄ')}</span><h1>{t('Պատվերի ձևակերպում')} <span>✦</span></h1><p>{t('Լրացրու առաքման տվյալներն ու փորձնական քարտը՝ պատվերի ձևակերպումը ստուգելու համար։')}</p></div><div className="checkout-steps"><b className="done">1 · {t('Զամբյուղ')}</b><i/><b>2 · {t('Առաքում')}</b><i/><b>3 · {t('Դեմո հաստատում')}</b></div></div>
    {!cart.length ? <div className="checkout-empty"><ShopIcon name="bag" size={45}/><h2>{t('Զամբյուղդ դեռ դատարկ է')}</h2><Link className="shop-btn-primary" to="/#products">{t('Գնալ գնումների')}</Link></div> :
      <form className="checkout-layout" onSubmit={submit}><div className="checkout-fields">
        <section className="checkout-section"><div className="checkout-section-title"><span className="checkout-section-icon"><ShopIcon name="user" size={21}/></span><div><span className="shop-eyebrow">01 / {t('Կոնտակտային տվյալներ')}</span><h2>{t('Ո՞վ է ստանալու պատվերը')}</h2></div></div><div className="checkout-form-grid">
          {addressFields.map((item) => <label className={['street','fullName'].includes(item.key) ? 'checkout-wide' : ''} key={item.key}><span>{t(item.label)}{item.required && <i> *</i>}</span><input required={item.required} type={item.type || 'text'} autoComplete={item.autocomplete || 'off'} placeholder={t(item.placeholder)} maxLength={item.key === 'street' ? 160 : 90} value={shipping[item.key]} onChange={(e) => setShipping((old) => ({ ...old, [item.key]: e.target.value }))}/></label>)}
          <label className="checkout-wide"><span>{t('Նշումներ առաքման համար (ըստ ցանկության)')}</span><textarea rows={3} maxLength={400} value={shipping.notes} onChange={(e) => setShipping((old) => ({ ...old, notes: e.target.value }))} placeholder={t('Օրինակ՝ զանգահարել առաքելուց առաջ')}/></label>
          <label className="checkout-wide"><span>{t('Հաստատված էլ. հասցե')}</span><input value={user.email} disabled aria-readonly="true"/></label>
        </div></section>
        <section className="checkout-section checkout-payment-info"><div className="checkout-section-title"><span className="checkout-section-icon"><ShopIcon name="shield" size={21}/></span><div><span className="shop-eyebrow">02 / {t('ՓՈՐՁՆԱԿԱՆ ՎՃԱՐՈՒՄ')}</span><h2>{t('Դեմո քարտի տվյալներ')}</h2></div></div>
          <div className="checkout-demo-notice" role="note"><strong>{t('Մի մուտքագրիր իրական բանկային քարտի տվյալներ։')}</strong><p>{t('Սա միայն ցուցադրական գնում է։ Գումար չի փոխանցվում, իրական պատվեր չի ուղարկվում։')}</p></div>
          <div className="checkout-demo-card" aria-label={t('Փորձնական քարտի նախադիտում')}><div className="checkout-demo-card-top"><b>PHONESHOP<span>•</span> DEMO</b><span>VISA</span></div><div className="checkout-demo-chip">▦</div><strong className="checkout-demo-number">{card.number || '4242  ••••  ••••  4242'}</strong><div className="checkout-demo-card-bottom"><span>{card.holder || 'DEMO CUSTOMER'}</span><span>{card.expiry || '12/30'}</span></div></div>
          <div className="checkout-demo-field-head"><h3>{t('Փորձնական քարտ')}</h3><button type="button" className="checkout-demo-autofill" onClick={() => { setCard(SAMPLE_CARD); setError(''); }}>{t('Լրացնել դեմո քարտը')} <ShopIcon name="check" size={15}/></button></div>
          <div className="checkout-form-grid checkout-card-inputs">
            <label className="checkout-wide"><span>{t('Քարտի սեփականատիրոջ անունը')} *</span><input required autoComplete="off" value={card.holder} onChange={(e) => setCardField('holder', e.target.value.slice(0, 70))} placeholder="DEMO CUSTOMER"/></label>
            <label className="checkout-wide"><span>{t('Քարտի համար')} *</span><input required inputMode="numeric" autoComplete="off" value={card.number} onChange={(e) => setCardField('number', formatDemoCard(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19}/></label>
            <label><span>{t('Վավերականություն')} *</span><input required inputMode="numeric" autoComplete="off" value={card.expiry} onChange={(e) => setCardField('expiry', formatDemoExpiry(e.target.value))} placeholder="12/30" maxLength={5}/></label>
            <label><span>CVV *</span><input required inputMode="numeric" autoComplete="off" value={card.cvv} onChange={(e) => setCardField('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))} type="password" placeholder="123" maxLength={3}/></label>
          </div>
          <div className="checkout-test-note"><b>{t('Թեստային տվյալներ')}:</b> 4242 4242 4242 4242 · 12/30 · 123 <span>{t('Միայն այս փորձնական քարտն է ընդունվում։')}</span></div>
          <div className="checkout-security"><ShopIcon name="shield" size={18}/>{t('Քարտի դաշտերը չեն ուղարկվում սերվեր և չեն պահպանվում։ Կայքը չի գանձում գումար։')}</div>
        </section>
      </div><aside className="checkout-summary"><div className="checkout-summary-top"><span className="shop-eyebrow">{t('ՔՈ ՊԱՏՎԵՐԸ')}</span><h2>{t('Պատվերի ամփոփում')}</h2></div><div className="checkout-summary-items">{cart.map((item) => <div className="checkout-summary-item" key={item.id}><span className={`checkout-summary-photo ph-media-${item.tone}`}><img src={item.image} alt=""/></span><span><b>{item.name}</b><small>{item.quantity} × {formatPrice(item.price)}</small></span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div>
        <div className="checkout-summary-prices"><p><span>{t('Ապրանքների արժեքը')}</span><strong>{formatPrice(subtotal)}</strong></p><p><span>{t('Առաքում')}</span><strong>{settings.deliveryFee ? formatPrice(settings.deliveryFee) : t('Անվճար')}</strong></p></div><div className="checkout-grand-total"><span>{t('Ընդամենը')}</span><b>{formatPrice(total)}</b></div>
        {error && <p className="checkout-error" role="alert">{t(error)}</p>}
        <button className="checkout-pay-button" disabled={!settings.demoEnabled || settingsLoading || busy || !cart.length} type="submit"><ShopIcon name="check" size={20}/>{busy ? t('Դեմո պատվերը գրանցվում է...') : t('Հաստատել դեմո գնումը')}<ShopIcon name="arrowRight" size={19}/></button>
        <p className="checkout-summary-footer"><ShopIcon name="shield" size={16}/>{t('Դեմո պատվերը կպահպանվի պրոֆիլում։ Իրական գումար չի գանձվի։')}</p>
        <Link className="checkout-back" to="/profile/cart"><ShopIcon name="arrowLeft" size={16}/>{t('Վերադառնալ զամբյուղ')}</Link>
      </aside></form>}
  </div></main>;
}
