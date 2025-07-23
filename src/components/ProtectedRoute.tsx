import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Vérifier les permissions si des rôles sont spécifiés
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié selon le rôle
    let redirectPath = '/dashboard';
    
    switch (user.role) {
      case 'ADMIN':
        redirectPath = '/admin';
        break;
      case 'PDG':
        redirectPath = '/pdg';
        break;
      case 'RH':
        redirectPath = '/rh';
        break;
      case 'CAISSIER':
        redirectPath = '/caissier';
        break;
      case 'LOGISTICIEN':
        redirectPath = '/logisticien';
        break;
      case 'MEDECIN':
        redirectPath = '/medecin';
        break;
      case 'AGENT_HOSPITALISATION':
        redirectPath = '/hospitalisation';
        break;
      case 'LABORANTIN':
        redirectPath = '/laborantin';
        break;
      case 'AGENT_MATERNITE':
        redirectPath = '/maternite';
        break;
      default:
        redirectPath = '/dashboard';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  // Afficher le contenu protégé
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 