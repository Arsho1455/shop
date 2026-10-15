/** Demo catalogue; replace with API products when the backend catalogue is ready. */
export const products = [
  {
    id: 1, name: 'iPhone 15', brand: 'Apple', price: 350000, oldPrice: 390000,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=900&q=85&fit=crop',
    storage: '128GB', color: 'Black', rating: 0, reviews: 0, stock: 12,
    description: 'iPhone 15-ը ժամանակակից և հզոր սմարթֆոն է՝ հիանալի տեսախցիկով և գեղեցիկ դիզայնով։',
    tag: 'Բեսթսելլեր', tone: 'peach',
  },
  {
    id: 2, name: 'Samsung Galaxy S24', brand: 'Samsung', price: 320000, oldPrice: 350000,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=900&q=85&fit=crop',
    storage: '256GB', color: 'Gray', rating: 0, reviews: 0, stock: 8,
    description: 'Samsung Galaxy S24՝ բարձր որակի էկրանով, հզոր պրոցեսորով և առաջադեմ տեսախցիկով։',
    tag: 'Թոփ ընտրություն', tone: 'sky',
  },
  {
    id: 3, name: 'Google Pixel 8', brand: 'Google', price: 280000, oldPrice: 310000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&q=85&fit=crop',
    storage: '128GB', color: 'Blue', rating: 0, reviews: 0, stock: 5,
    description: 'Google Pixel 8՝ հիանալի տեսախցիկով և մաքուր Android փորձառությամբ։',
    tag: 'Հատուկ գին', tone: 'lilac',
  },
  {
    id: 4, name: 'iPhone 14', brand: 'Apple', price: 280000, oldPrice: 320000,
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=900&q=85&fit=crop',
    storage: '128GB', color: 'Purple', rating: 0, reviews: 0, stock: 15,
    description: 'iPhone 14՝ արագ աշխատանքով, բարձրորակ տեսախցիկով և պրեմիում դիզայնով։',
    tag: 'Զեղչ', tone: 'mint',
  },
];

export const formatPrice = (amount) => `${Number(amount || 0).toLocaleString('en-US').replace(/,/g, ' ')} ֏`;
