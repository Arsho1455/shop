import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from './containers/home/home.jsx';
import { ContactPage } from './containers/contact/contact.jsx';
import { ProductPage } from './containers/product/product.jsx';
import { MyHeader } from './components/header/header.jsx';
import { MyFooter } from './components/footer/footer.jsx';
import { AuthProvider } from './auth/context/AuthContext.jsx';
import { ShopProvider } from './shop/ShopContext.jsx';
import { CatalogProvider } from './shop/CatalogContext.jsx';
import Admin from './admin/Admin.jsx';
import Auth from './auth/pages/Auth.jsx';
import Profile from './auth/pages/Profile.jsx';
import VerifyEmail from './auth/pages/VerifyEmail.jsx';
import ForgotPassword from './auth/pages/ForgotPassword.jsx';
import ResetPassword from './auth/pages/ResetPassword.jsx';
import Checkout from './checkout/Checkout.jsx';
import OrderResult from './checkout/OrderResult.jsx';
import './auth/auth.css';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import SiteExperience from './experience/SiteExperience.jsx';

const AuthPage = ({ children }) => <div className="shop-auth">{children}</div>;

export default function App() {
  return <Router><LanguageProvider><AuthProvider><CatalogProvider><ShopProvider>
    <SiteRoutes />
  </ShopProvider></CatalogProvider></AuthProvider></LanguageProvider></Router>;
}

function SiteRoutes() {
  const { pathname } = useLocation();
  // Separate layout: no shop header/footer on admin URLs.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <SiteExperience><Admin /></SiteExperience>;
  return <SiteExperience><MyHeader />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/auth" element={<AuthPage><Auth /></AuthPage>} />
      <Route path="/verify-email" element={<AuthPage><VerifyEmail /></AuthPage>} />
      <Route path="/forgot-password" element={<AuthPage><ForgotPassword /></AuthPage>} />
      <Route path="/reset-password" element={<AuthPage><ResetPassword /></AuthPage>} />
      <Route path="/profile" element={<AuthPage><Profile /></AuthPage>} />
      <Route path="/profile/favorites" element={<AuthPage><Profile section="favorites" /></AuthPage>} />
      <Route path="/profile/cart" element={<AuthPage><Profile section="cart" /></AuthPage>} />
      <Route path="/profile/orders" element={<AuthPage><Profile section="orders" /></AuthPage>} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/result" element={<OrderResult />} />
      <Route path="/favorites" element={<Navigate to="/profile/favorites" replace />} />
      <Route path="/cart" element={<Navigate to="/profile/cart" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <MyFooter /></SiteExperience>;
}
