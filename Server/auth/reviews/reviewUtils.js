export function validateReview({ rating, comment } = {}) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return 'Ընտրիր 1–5 աստղ։';
  if (typeof comment !== 'string') return 'Գրիր կարծիք ապրանքի մասին։';
  const cleanComment = comment.trim();
  if (cleanComment.length < 10 || cleanComment.length > 1000 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(cleanComment)) {
    return 'Կարծիքը պետք է լինի 10–1000 նիշ։';
  }
  return null;
}

export const reviewPublic = (review) => ({
  id: String(review._id),
  userId: String(review.userId),
  authorName: review.authorName,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

export function ratingSummary(reviews) {
  const count = reviews.length;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return { reviews: count, rating: count ? Math.round((sum / count) * 10) / 10 : 0 };
}
