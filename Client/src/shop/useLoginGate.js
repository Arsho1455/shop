import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext.jsx';

export function useLoginGate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    if (user) return true;
    const next = `${location.pathname}${location.search}`;
    navigate(`/auth?mode=login&next=${encodeURIComponent(next)}&reason=shop`);
    return false;
  };
}
