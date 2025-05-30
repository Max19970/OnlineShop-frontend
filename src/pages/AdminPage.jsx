import React from 'react';
import { Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from '../contexts/AuthContext';

// Компоненты для подстраниц админки (ManageProductsPage уже создан)
import ManageProductsPage from './Admin/ManageProductsPage';
// import ManageUsersPage from './Admin/ManageUsersPage'; // Создадим позже
// import ManageOrdersPage from './Admin/ManageOrdersPage'; // Создадим позже

function AdminDashboard() {
    return (
        <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="bi bi-speedometer2 me-2"></i>Обзорная панель</h5>
            </div>
            <div className="card-body">
                <p className="card-text">Добро пожаловать в административную панель!</p>
                <p>Выберите раздел для управления:</p>
                <div className="list-group">
                    <Link to="/admin/products" className="list-group-item list-group-item-action">
                        <i className="bi bi-box-seam-fill me-2"></i>Управление товарами
                    </Link>
                    <Link to="/admin/users" className="list-group-item list-group-item-action disabled" tabIndex="-1" aria-disabled="true">
                        <i className="bi bi-people-fill me-2"></i>Управление пользователями (скоро)
                    </Link>
                    <Link to="/admin/orders" className="list-group-item list-group-item-action disabled" tabIndex="-1" aria-disabled="true">
                        <i className="bi bi-receipt-cutoff me-2"></i>Управление заказами (скоро)
                    </Link>
                </div>
            </div>
        </div>
    );
}

function AdminPageLayout() {
    const { user } = useAuthState();
    const location = useLocation();

    // Базовый путь для админ-панели, чтобы корректно строить относительные пути для Link
    const adminBasePath = "/admin";

    // Определяем заголовок для текущей подстраницы
    let pageTitle = "Обзор";
    if (location.pathname.startsWith(`${adminBasePath}/products`)) {
        pageTitle = "Управление товарами";
    } else if (location.pathname.startsWith(`${adminBasePath}/users`)) {
        pageTitle = "Управление пользователями";
    } else if (location.pathname.startsWith(`${adminBasePath}/orders`)) {
        pageTitle = "Управление заказами";
    }


    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3"><i className="bi bi-shield-lock-fill me-2"></i>Админ-панель: {pageTitle}</h1>
                    {user && <p className="mb-0 text-muted small">Вы вошли как: {user.name || user.email}</p>}
                </div>
                {location.pathname !== adminBasePath && location.pathname !== `${adminBasePath}/` && (
                    <Link to={adminBasePath} className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-arrow-left me-1"></i> На главную админ-панели
                    </Link>
                )}
            </div>

            <div className="row">
                <div className="col-lg-3 mb-4 mb-lg-0">
                    {/* Боковое меню навигации */}
                    <div className="list-group shadow-sm">
                        <Link
                            to={adminBasePath}
                            className={`list-group-item list-group-item-action ${location.pathname === adminBasePath || location.pathname === `${adminBasePath}/` ? 'active' : ''}`}
                        >
                            <i className="bi bi-house-door-fill me-2"></i>Обзор
                        </Link>
                        <Link
                            to={`${adminBasePath}/products`}
                            className={`list-group-item list-group-item-action ${location.pathname.startsWith(`${adminBasePath}/products`) ? 'active' : ''}`}
                        >
                            <i className="bi bi-box-seam-fill me-2"></i>Товары
                        </Link>
                        <Link
                            to={`${adminBasePath}/users`}
                            className={`list-group-item list-group-item-action disabled ${location.pathname.startsWith(`${adminBasePath}/users`) ? 'active' : ''}`}
                            tabIndex="-1" aria-disabled="true"
                        >
                            <i className="bi bi-people-fill me-2"></i>Пользователи (скоро)
                        </Link>
                        <Link
                            to={`${adminBasePath}/orders`}
                            className={`list-group-item list-group-item-action disabled ${location.pathname.startsWith(`${adminBasePath}/orders`) ? 'active' : ''}`}
                            tabIndex="-1" aria-disabled="true"
                        >
                            <i className="bi bi-receipt-cutoff me-2"></i>Заказы (скоро)
                        </Link>
                        {/* Другие разделы админки */}
                    </div>
                </div>
                <div className="col-lg-9">
                    {/* Здесь будут отображаться компоненты подстраниц */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}


function AdminPage() {
    // Маршрут /admin/* в App.js уже настроен для AdminPage.
    // Теперь AdminPage будет содержать вложенные маршруты.
    return (
        <Routes>
            <Route path="/" element={<AdminPageLayout />}>
                {/* Индексный маршрут для /admin -> будет показан AdminDashboard */}
                <Route index element={<AdminDashboard />} />
                {/* Маршрут для /admin/products */}
                <Route path="products/*" element={<ManageProductsPage />} />
                {/* <Route path="users" element={<ManageUsersPage />} /> */}
                {/* <Route path="orders" element={<ManageOrdersPage />} /> */}
                {/* Другие подстраницы админки */}

                {/* Маршрут для формы добавления нового товара */}
                {/* Мы определим его внутри ManageProductsPage или как отдельный компонент, доступный через /admin/products/new */}
            </Route>
        </Routes>
    );
}

export default AdminPage;