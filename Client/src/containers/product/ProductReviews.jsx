import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { api } from '../../auth/lib/api.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useCatalog } from '../../shop/CatalogContext.jsx';
import { useLoginGate } from '../../shop/useLoginGate.js';
import ShopIcon from '../../shop/ShopIcon.jsx';
import './reviews.css';

function Stars({ rating, interactive = false, onChange, t }) {
  if (!interactive) return <span className="ph-review-stars" aria-label={`${rating} / 5`}>{Array.from({ length: 5 }, (_, i) => <ShopIcon key={i} name="star" size={17} fill={i < rating ? 'currentColor' : 'none'}/>)}</span>;
  return <div className="ph-star-picker" role="group" aria-label={t('Ընտրիր գնահատական')}>
    {Array.from({ length: 5 }, (_, i) => <button type="button" key={i} onClick={() => onChange(i + 1)} aria-label={`${i + 1} / 5`} aria-pressed={rating === i + 1}><ShopIcon name="star" size={27} fill={i < rating ? 'currentColor' : 'none'}/></button>)}
  </div>;
}

export function ProductReviews({ product }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const requireLogin = useLoginGate();
  const { refreshCatalog } = useCatalog();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReviews = useCallback(async (nextPage = 1) => {
    const result = await api(`/api/products/${product.id}/reviews?page=${nextPage}`);
    setReviews((previous) => nextPage === 1 ? result.reviews : [...previous, ...result.reviews]);
    setTotal(result.total);
    setPage(nextPage);
    setHasMore(result.hasMore);
  }, [product.id]);

  const loadMine = useCallback(async () => {
    if (!user) { setMyReview(null); setRating(5); setComment(''); return; }
    const result = await api(`/api/products/${product.id}/reviews/mine`);
    setMyReview(result.review);
    setRating(result.review?.rating || 5);
    setComment(result.review?.comment || '');
  }, [product.id, user]);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setStatus(''); setReviews([]);
    Promise.all([loadReviews(1), loadMine()]).catch((err) => {
      if (active) setError(err.message);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadReviews, loadMine]);

  const save = async (event) => {
    event.preventDefault();
    if (!requireLogin()) return;
    if (comment.trim().length < 10 || comment.trim().length > 1000) {
      setError(t('Կարծիքը պետք է լինի 10–1000 նիշ։')); return;
    }
    setSaving(true); setError(''); setStatus('');
    try {
      const result = await api(`/api/products/${product.id}/reviews${myReview ? '/mine' : ''}`, {
        method: myReview ? 'PUT' : 'POST', body: { rating, comment: comment.trim() },
      });
      setMyReview(result.review);
      await Promise.all([loadReviews(1), refreshCatalog()]);
      setStatus(t(myReview ? 'Կարծիքը թարմացվեց։' : 'Շնորհակալություն կարծիքի համար։'));
    } catch (err) { setError(t(err.message)); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!myReview || !window.confirm(t('Հեռացնե՞լ քո կարծիքը։'))) return;
    setSaving(true); setError(''); setStatus('');
    try {
      await api(`/api/products/${product.id}/reviews/mine`, { method: 'DELETE' });
      setMyReview(null); setComment(''); setRating(5);
      await Promise.all([loadReviews(1), refreshCatalog()]);
      setStatus(t('Կարծիքը հեռացվեց։'));
    } catch (err) { setError(t(err.message)); }
    finally { setSaving(false); }
  };

  return <section className="ph-reviews" id="reviews" aria-labelledby="ph-reviews-title">
    <div className="ph-reviews-top pd-reveal">
      <div className="ph-reviews-intro"><span className="shop-eyebrow">{t('ՀԱՃԱԽՈՐԴՆԵՐԻ ԿԱՐԾԻՔՆԵՐ')}</span><h2 id="ph-reviews-title">{t('Գնահատականներ և կարծիքներ')}</h2><p>{t('Կիսվիր ապրանքի մասին քո փորձով։')}</p></div>
      <div className="ph-review-score"><strong>{product.reviews ? product.rating.toFixed(1) : '—'}</strong><Stars rating={Math.round(product.rating)} t={t}/><small>{product.reviews} {t('կարծիք')}</small></div>
    </div>
    <div className="ph-review-layout">
      <div className="ph-review-list pd-reveal">
        {loading && <p className="ph-review-muted">{t('Բեռնվում է...')}</p>}
        {!loading && reviews.length === 0 && <div className="ph-review-empty"><ShopIcon name="star" size={26}/><h3>{t('Դեռ կարծիքներ չկան')}</h3><p>{t('Եղիր առաջինը, ով կգնահատի այս ապրանքը։')}</p></div>}
        {reviews.map((review) => <article className="ph-review-card" key={review.id}>
          <div className="ph-review-card-head"><div className="ph-review-person"><span className="ph-review-avatar">{review.authorName?.slice(0, 1)?.toUpperCase() || '★'}</span><div><strong>{review.authorName}</strong><small>{new Date(review.createdAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'hy-AM')}</small></div></div><Stars rating={review.rating} t={t}/></div>
          <p>{review.comment}</p>
          {myReview?.id === review.id && <span className="ph-review-own">{t('Քո կարծիքը')}</span>}
        </article>)}
        {hasMore && <button className="ph-review-more" disabled={loading} type="button" onClick={async () => { setLoading(true); try { await loadReviews(page + 1); } catch (err) { setError(t(err.message)); } finally { setLoading(false); } }}>{t('Ցույց տալ ավելի շատ կարծիքներ')}</button>}
        {total > 0 && <p className="ph-review-muted">{t('Ցուցադրված է')} {reviews.length} / {total}</p>}
      </div>
      <form className="ph-review-form pd-reveal" onSubmit={save}>
        <h3>{t(myReview ? 'Խմբագրել քո կարծիքը' : 'Գրել կարծիք')}</h3>
        <p>{t('Գնահատիր ապրանքը 1-ից 5 աստղով և թող քո կարծիքը։')}</p>
        <Stars rating={rating} interactive onChange={setRating} t={t}/>
        <label htmlFor="ph-review-message">{t('Քո կարծիքը')}</label>
        <textarea id="ph-review-message" maxLength={1000} minLength={10} rows={5} value={comment} onChange={(e) => setComment(e.target.value)} disabled={saving} placeholder={t('Ի՞նչն է քեզ դուր եկել այս ապրանքում։')} />
        <span className="ph-review-length">{comment.trim().length} / 1000</span>
        {error && <p className="ph-review-error" role="alert">{error}</p>}
        {status && <p className="ph-review-success" role="status">{status}</p>}
        <button type={user ? 'submit' : 'button'} className="shop-btn-primary ph-review-submit" disabled={saving} onClick={!user ? () => requireLogin() : undefined}>{saving ? t('Պահպանվում է...') : user ? t(myReview ? 'Պահպանել փոփոխությունները' : 'Հրապարակել կարծիքը') : t('Մուտք գործել՝ կարծիք գրելու համար')}</button>
        {myReview && <button type="button" className="ph-review-delete" disabled={saving} onClick={remove}>{t('Հեռացնել իմ կարծիքը')}</button>}
        <small>{t('Յուրաքանչյուր օգտատեր կարող է թողնել մեկ կարծիք յուրաքանչյուր ապրանքի համար։')}</small>
      </form>
    </div>
  </section>;
}
