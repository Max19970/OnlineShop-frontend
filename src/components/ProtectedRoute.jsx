import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../contexts/AuthContext';

// Component prop может использоваться, если вы предпочитаете передавать компонент так: <ProtectedRoute component={ProfilePage} />
// children prop используется, если вы оборачиваете маршрут: <ProtectedRoute><ProfilePage /></ProtectedRoute>
// element prop используется в React Router v6 для Route: <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
// Мы будем использовать element prop для совместимости с текущей структурой App.js
function ProtectedRoute({ element, allowedRoles }) {
    const { isAuthenticated, isLoading, user } = useAuthState();
    const location = useLocation(); // Чтобы запомнить, куда пользователь хотел попасть

    if (isLoading) {
        // Можно показать какой-нибудь индикатор загрузки, пока проверяется статус аутентификации
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Перенаправляем на страницу входа, сохраняя текущий путь для редиректа после входа
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Проверка ролей, если массив allowedRoles передан и не пуст
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = user && allowedRoles.includes(user.role);
        if (!hasRequiredRole) {
            // У пользователя нет необходимой роли, перенаправляем на страницу "доступ запрещен" или на главную
            // Пока что перенаправим на главную, можно создать отдельную страницу ForbiddenPage
            console.warn(`Пользователь ${user?.email} с ролью ${user?.role} пытался получить доступ к маршруту, требующему одной из ролей: ${allowedRoles.join(', ')}`);
            return <Navigate to="/" state={{ from: location }} replace />;
            // Или: return <Navigate to="/unauthorized" replace />; (если есть такой маршрут)
        }
    }

    return element; // Пользователь аутентифицирован (и имеет нужную роль, если проверяется), отображаем запрошенный элемент
}

export default ProtectedRoute;