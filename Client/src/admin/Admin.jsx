import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../auth/lib/api.js';
import AdminLogin from './AdminLogin.jsx';
import { useCatalog } from '../shop/CatalogContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import ShopIcon from '../shop/ShopIcon.jsx';
import { formatPrice } from '../shop/catalog.js';
import { words } from './copy.js';
import './admin.css';

const emptyProduct = { name: '', brand: '', price: '', oldPrice: 0, stock: 0, image: '', storage: '', color: '', description: '', tag: '', tone: 'sky' };
const displayDate = (date, lang) => date ? new Date(date).toLocaleDateString(lang === 'hy' ? 'hy-AM' : lang === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function Status({ active, text }) { return <span className={`adm-status ${active ? 'ok' : 'wait'}`}><i />{text}</span>; }

function AdminDashboard({ user, onSignedOut }) {
  const { language, setLanguage, t } = useLanguage();
  const { refreshCatalog } = useCatalog();
  const w = words[language] || words.hy;
  const { pathname } = useLocation();
  const section = pathname.endsWith('/products') ? 'products' : pathname.endsWith('/users') ? 'users' : pathname.endsWith('/orders') ? 'orders' : 'overview';
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => { setSearch(''); setSubmittedSearch(''); setPage(1); setNotice(''); setError(''); }, [section]);
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    let live = true;
    setLoading(true); setError('');
    const endpoint = section === 'overview' ? '/api/admin/stats' : section === 'products' ? '/api/admin/products' : section === 'orders' ? `/api/admin/orders?page=${page}` : `/api/admin/users?page=${page}&q=${encodeURIComponent(submittedSearch)}`;
    api(endpoint)
      .then((data) => { if (!live) return;
        if (section === 'overview') setStats(data);
        if (section === 'products') setProducts(data.products || []);
        if (section === 'orders') { setOrders(data.orders || []); setTotal(data.count); setPages(data.pages); }
        if (section === 'users') { setUsers(data.users || []); setTotal(data.total); setPages(data.pages); }
      })
      .catch((e) => { if (live) setError(e.message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [section, page, submittedSearch, user?.id, user?.role]);

  const filteredProducts = useMemo(() => products.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(search.trim().toLowerCase())), [products, search]);


  const openNew = () => { setForm(emptyProduct); setEditor('new'); setError(''); };
  const openEdit = (p) => { setForm(Object.fromEntries(Object.keys(emptyProduct).map((key) => [key, p[key] ?? emptyProduct[key]]))); setEditor(p.id); setError(''); };
  const closeEditor = () => { setEditor(null); setError(''); };

  const saveProduct = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await api(editor === 'new' ? '/api/admin/products' : `/api/admin/products/${editor}`, {
        method: editor === 'new' ? 'POST' : 'PUT', body: form,
      });
      const response = await api('/api/admin/products');
      setProducts(response.products || []);
      await refreshCatalog();
      setNotice(editor === 'new' ? w.added : w.saved);
      closeEditor();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const removeProduct = async (p) => {
    if (!window.confirm(`${w.confirmDelete}\n\n${p.name}`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await api(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      setProducts((items) => items.filter((item) => item.id !== p.id));
      await refreshCatalog();
      setNotice(w.deleted);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const logout = async () => { try { await api('/api/admin/auth/logout', { method: 'POST' }); onSignedOut(); } catch (e) { setError(e.message); } };

  return <div className="adm-root">
    <aside className="adm-sidebar">
      <Link to="/admin" className="adm-brand"><span className="adm-brand-badge"><ShopIcon name="bolt" fill="white" size={21}/></span><span>phone<span>shop</span><small>MANAGEMENT</small></span></Link>
      <div className="adm-nav-label">{w.adminZone}</div>
      <nav className="adm-nav" aria-label={w.panel}>
        {[['overview', '/admin', 'filter', w.overview], ['products', '/admin/products', 'bag', w.products], ['users', '/admin/users', 'user', w.users], ['orders', '/admin/orders', 'bag', t('Իմ պատվերները')]].map(([key, href, icon, name]) =>
          <Link key={key} to={href} aria-current={section === key ? 'page' : undefined} className={`adm-nav-item ${section === key ? 'selected' : ''}`}><ShopIcon name={icon} size={19}/>{name}{section === key && <span className="adm-nav-active-dot" />}</Link>)}
      </nav>
      <div className="adm-sidebar-bottom"><Link to="/" className="adm-nav-item"><ShopIcon name="arrowLeft" size={19}/>{w.storefront}</Link>
        <button className="adm-nav-item" onClick={logout}><ShopIcon name="return" size={19}/>{w.logout}</button>
      </div>
      <div className="adm-side-user"><span className="adm-avatar">{user.name?.slice(0, 1)?.toUpperCase() || 'A'}</span><span><b>{user.name}</b><small>{user.email}</small></span><ShopIcon name="shield" size={17}/></div>
    </aside>
    <div className="adm-body">
      <header className="adm-topbar"><div className="adm-breadcrumb"><span>PhoneShop</span><ShopIcon name="arrowRight" size={15}/><strong>{section === 'overview' ? w.overview : section === 'products' ? w.products : section === 'orders' ? t('Իմ պատվերները') : w.users}</strong></div>
        <div className="adm-topbar-actions"><div className="adm-languages">{[['hy', 'ՀԱՅ'],['ru','РУС'],['en','ENG']].map(([code,label]) => <button type="button" key={code} aria-pressed={language === code} onClick={() => setLanguage(code)}>{label}</button>)}</div><span className="adm-top-avatar">{user.name?.slice(0, 1)?.toUpperCase()}</span></div>
      </header>
      <main key={section} className="adm-content">
        {section === 'overview' && <>
          <div className="adm-page-intro"><div><span className="adm-eyebrow">{w.dashboard} / 01</span><h1>{w.hello}, <em>{user.name?.split(' ')[0]} 👋</em></h1><p>{w.greetingSubtitle}</p></div><Link to="/admin/products" className="adm-primary"><ShopIcon name="plus" size={18}/>{w.manageProducts}</Link></div>
          {loading && <div className="adm-loading-slim">{w.loading}</div>}
          {!loading && stats && <>
            <div className="adm-metrics">
              {[['usersTotal', stats.users, 'user', 'purple'], ['productsTotal',stats.products,'bag','blue'],['verified',stats.verified,'check','green'],['inCarts',stats.cartItems,'heart','orange']].map(([label,value,icon,color])=><article className="adm-metric" key={label}><div className={`adm-metric-icon ${color}`}><ShopIcon name={icon} size={21}/></div><span>{w[label]}</span><b>{Number(value).toLocaleString()}</b><small>{w.dashboard} · PhoneShop</small></article>)}
            </div>
            <div className="adm-dashboard-grid"><section className="adm-card"><div className="adm-card-heading"><div><span className="adm-eyebrow">ACCOUNT ACTIVITY</span><h2>{w.recentUsers}</h2></div><Link to="/admin/users" className="adm-card-link">{w.seeAll} <ShopIcon name="arrowRight" size={16}/></Link></div><div className="adm-table-wrap" role="region" aria-label={w.panel} tabIndex={0}><table className="adm-table"><thead><tr><th>{w.user}</th><th>{w.status}</th><th>{w.joined}</th></tr></thead><tbody>{stats.latestUsers.map((person) => <tr key={person._id}><td><div className="adm-person"><span className="adm-mini-avatar">{person.name?.slice(0,1)?.toUpperCase()}</span><span><b>{person.name}</b><small>{person.email}</small></span></div></td><td><Status active={person.isEmailVerified} text={person.isEmailVerified ? w.verifiedYes : w.verifiedNo}/></td><td>{displayDate(person.createdAt, language)}</td></tr>)}{!stats.latestUsers.length && <tr><td colSpan="3">{w.noUsers}</td></tr>}</tbody></table></div></section>
              <section className="adm-inventory-card"><span className="adm-inventory-orb"><ShopIcon name="shield" size={26}/></span><span className="adm-eyebrow">STORE HEALTH</span><h2>{w.attention}</h2><div className="adm-stock-number">{stats.lowStock}<small> / {stats.products}</small></div><div className="adm-track"><span style={{width: `${stats.products ? 100 * (stats.products - stats.lowStock) / stats.products : 100}%`}} /></div><p>{stats.lowStock ? `${stats.lowStock} ${w.lowStockMessage}` : w.allStocked}</p><Link to="/admin/products">{w.manageProducts}<ShopIcon name="arrowRight" size={18}/></Link></section>
            </div>
          </>}
          <p className="adm-muted-tip"><Link to="/admin/orders">{t('Դիտել պատվերները')} →</Link></p>
        </>}
        {section === 'products' && <><div className="adm-page-intro"><div><span className="adm-eyebrow">CATALOG / 02</span><h1>{w.products}</h1><p>{w.productsDesc}</p></div><button onClick={openNew} className="adm-primary"><ShopIcon name="plus" size={18}/>{w.addProduct}</button></div><div className="adm-card adm-data-card"><div className="adm-data-toolbar"><div className="adm-search"><ShopIcon name="search" size={19}/><input aria-label={w.productsSearch} value={search} onChange={e=>setSearch(e.target.value)} placeholder={w.productsSearch}/></div><span className="adm-row-counter">{filteredProducts.length} {w.products.toLowerCase()}</span></div>{loading ? <div className="adm-loading-slim">{w.loading}</div> : <div className="adm-table-wrap" role="region" aria-label={w.panel} tabIndex={0}><table className="adm-table adm-product-table"><thead><tr><th>{w.title}</th><th>{w.price}</th><th>{w.stock}</th><th>{w.actions}</th></tr></thead><tbody>{filteredProducts.map((p)=><tr key={p.id}><td><div className="adm-product"><span className="adm-product-photo"><img src={p.image} alt="" /></span><div><b>{p.name}</b><small>{p.brand} · {p.storage}</small></div></div></td><td><b>{formatPrice(p.price)}</b></td><td><Status active={p.stock > 5} text={String(p.stock)}/></td><td><div className="adm-row-actions"><button disabled={busy} onClick={()=>openEdit(p)}>{w.edit}</button><button className="danger" disabled={busy} onClick={()=>removeProduct(p)}>{w.remove}</button></div></td></tr>)}{filteredProducts.length===0 && <tr><td colSpan="4" className="adm-empty-cell">{w.noProducts}</td></tr>}</tbody></table></div>}</div></>}
        {section === 'orders' && <><div className="adm-page-intro"><div><span className="adm-eyebrow">ORDERS / 04</span><h1>{t('Իմ պատվերները')}</h1><p>{t('Հաճախորդների դեմո պատվերները։ Դրանք իրական վճարումներ չեն։')}</p></div><span className="adm-user-count">{total}</span></div><div className="adm-card adm-data-card">{loading ? <div className="adm-loading-slim">{w.loading}</div> : <div className="adm-table-wrap" role="region" aria-label={w.panel} tabIndex={0}><table className="adm-table"><thead><tr><th>{t('Պատվերի համար')}</th><th>{t('Հաճախորդ')}</th><th>{t('Առաքման հասցե')}</th><th>{t('Գումար')}</th><th>{t('Վիճակ')}</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><b>{order.orderNumber}</b><small style={{display:'block'}}>{displayDate(order.createdAt, language)}</small></td><td><b>{order.shipping.fullName}</b><small style={{display:'block'}}>{order.email}</small><small>{order.shipping.phone}</small></td><td>{order.shipping.city}, {order.shipping.street}{order.shipping.apartment ? `, ${order.shipping.apartment}` : ''}</td><td><b>{formatPrice(order.total)}</b></td><td><Status active={['paid', 'demo_completed'].includes(order.status)} text={t(order.status === 'demo_completed' ? 'Դեմո պատվեր' : order.status === 'paid' ? 'Վճարված' : order.status === 'refunded' ? 'Վերադարձված' : order.status === 'failed' ? 'Չվճարված' : 'Սպասման մեջ')} />{order.inventoryIssue && <small style={{display:'block',color:'#c35c57'}}>{t('Ստուգել պահեստի մնացորդը')}</small>}</td></tr>)}{!orders.length && <tr><td colSpan="5" className="adm-empty-cell">{t('Դեռ պատվերներ չկան')}</td></tr>}</tbody></table></div>}<div className="adm-pagination"><span>{w.page} {page} {w.of} {pages}</span><div><button disabled={page === 1} onClick={()=>setPage(x=>x-1)}>{w.prev}</button><button disabled={page === pages} onClick={()=>setPage(x=>x+1)}>{w.next}</button></div></div></div></>}
        {section === 'users' && <><div className="adm-page-intro"><div><span className="adm-eyebrow">PEOPLE / 03</span><h1>{w.users}</h1><p>{w.usersDesc}</p></div><span className="adm-user-count">{total} {w.users.toLowerCase()}</span></div><div className="adm-card adm-data-card"><form className="adm-data-toolbar" onSubmit={e=>{e.preventDefault();setPage(1);setSubmittedSearch(search);}}><div className="adm-search"><ShopIcon name="search" size={19}/><input aria-label={w.usersSearch} value={search} onChange={e=>setSearch(e.target.value)} placeholder={w.usersSearch}/></div><button className="adm-outline" type="submit">{w.search}</button></form>{loading ? <div className="adm-loading-slim">{w.loading}</div> : <div className="adm-table-wrap" role="region" aria-label={w.panel} tabIndex={0}><table className="adm-table"><thead><tr><th>{w.user}</th><th>{w.role}</th><th>{w.status}</th><th>{w.favorites} / {w.cart}</th><th>{w.joined}</th></tr></thead><tbody>{users.map((person)=><tr key={person.id}><td><div className="adm-person"><span className="adm-mini-avatar">{person.name?.slice(0,1)?.toUpperCase()}</span><span><b>{person.name}</b><small>{person.email}</small></span></div></td><td><span className={`adm-role ${person.role === 'admin' ? 'staff' : ''}`}>{person.role === 'admin' ? w.admin : w.customer}</span></td><td><Status active={person.verified} text={person.verified ? w.verifiedYes : w.verifiedNo}/></td><td>{person.favorites} ♡ &nbsp; {person.cartItems} ⛶</td><td>{displayDate(person.createdAt,language)}</td></tr>)}{users.length===0 && <tr><td colSpan="5" className="adm-empty-cell">{w.noUsers}</td></tr>}</tbody></table></div>}<div className="adm-pagination"><span>{w.page} {page} {w.of} {pages}</span><div><button disabled={page===1} onClick={()=>setPage(x=>x-1)}>{w.prev}</button><button disabled={page===pages} onClick={()=>setPage(x=>x+1)}>{w.next}</button></div></div></div></>}
        {notice && <div className="adm-alert success" role="status">✓ {notice}</div>}
        {error && <div className="adm-alert error" role="alert">{error} <button onClick={() => { setError(''); window.location.reload(); }}>{w.retry}</button></div>}
      </main>
    </div>
    {editor !== null && <div className="adm-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget && !busy) closeEditor();}}><div className="adm-dialog" role="dialog" aria-modal="true" aria-labelledby="adm-dialog-title"><div className="adm-dialog-heading"><div><span className="adm-eyebrow">PRODUCT EDITOR</span><h2 id="adm-dialog-title">{editor==='new'?w.addNew:w.editProduct}</h2></div><button className="adm-close" onClick={closeEditor} disabled={busy} aria-label={w.cancel}><ShopIcon name="close" size={20}/></button></div><form onSubmit={saveProduct}><div className="adm-form-fields">{[
      ['name',w.title,true],['brand',w.brand,true],['price',w.price,true,'number'],['oldPrice',w.oldPrice,false,'number'],['stock',w.stock,true,'number'],['image',w.image,true,'url'],['storage',w.storage],['color',w.color],['tag',w.tag],['description',w.description,false,'textarea'],
    ].map(([key,label,required,type])=><label key={key} className={`adm-field ${key==='image'||key==='description'?'wide':''}`}><span>{label}{required?' *':''}</span>{type==='textarea'?<textarea rows={3} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} maxLength={1500}/>:<input type={type||'text'} min={type==='number'?0:undefined} step={type==='number'?'1':undefined} required={required} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>}</label>)}<label className="adm-field"><span>{w.tone}</span><select value={form.tone} onChange={e=>setForm(f=>({...f,tone:e.target.value}))}>{['sky','mint','peach','lilac'].map(t=><option key={t} value={t}>{t}</option>)}</select></label></div>{error && <p className="adm-dialog-error" role="alert">{error}</p>}<div className="adm-dialog-footer"><button className="adm-outline" type="button" onClick={closeEditor} disabled={busy}>{w.cancel}</button><button className="adm-primary" type="submit" disabled={busy}>{busy?w.loading:editor==='new'?w.creating:w.save}</button></div></form></div></div>}
  </div>;
}


// Separate admin sign-in from the customer's AuthContext.
// Logging in to the shop never grants an admin session automatically.
export default function Admin() {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    let active = true;
    api('/api/admin/auth/me')
      .then(({ user }) => { if (active) setAdminUser(user); })
      .catch(() => { if (active) setAdminUser(null); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  if (checking) return <div className="adm-loading">{words[language]?.loading || 'Բեռնվում է...'}</div>;
  if (!adminUser && pathname !== '/admin/login') {
    return <Navigate to="/admin/login" state={{ from: pathname }} replace />;
  }
  if (!adminUser) return <AdminLogin onSignedIn={(user) => {
    setAdminUser(user);
    const target = state?.from;
    navigate(['/admin', '/admin/products', '/admin/users'].includes(target) ? target : '/admin', { replace: true });
  }} />;
  if (pathname === '/admin/login') return <Navigate to="/admin" replace />;
  return <AdminDashboard user={adminUser} onSignedOut={() => {
    setAdminUser(null);
    navigate('/admin/login', { replace: true });
  }} />;
}
