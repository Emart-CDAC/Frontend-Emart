import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for route guarding
 * - Redirects to login if user is not authenticated
 * - For admin routes, checks if user has admin role
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while auth state is being determined
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check admin access for admin-only routes
    if (adminOnly) {
        const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' || user?.type === 'ADMIN';
        if (!isAdmin) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
