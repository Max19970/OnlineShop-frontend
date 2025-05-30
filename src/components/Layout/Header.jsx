import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthState, useAuthDispatch } from '../../contexts/AuthContext'; // Обновленный путь

function Header() {
    const { isAuthenticated, user, isLoading } = useAuthState();
    const { logout } = useAuthDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login'); // Перенаправляем на страницу входа после выхода
    };

    // Не отображаем ничего, пока идет первоначальная загрузка состояния аутентификации
    // Это предотвращает "мигание" ссылок Войти/Выйти при загрузке приложения
    if (isLoading && !isAuthenticated && !user) {
        // Можно вернуть плейсхолдер или просто null
        return (
            <header>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div className="container">
                        <Link className="navbar-brand" to="/">ТехноМарт</Link>
                        <div className="spinner-border text-light ms-auto" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }

    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link className="navbar-brand" to="/">ТехноМарт</Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/" end>
                                    Главная
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/products">
                                    Товары
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/cart">
                                    Корзина
                                    {/* <span className="badge bg-primary ms-1">0</span> */}
                                </NavLink>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            {isAuthenticated && user ? (
                                <>
                                    {user.role === 'admin' && (
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="/admin">
                                                Админ Панель
                                            </NavLink>
                                        </li>
                                    )}
                                    <li className="nav-item dropdown">
                                        <a
                                            className="nav-link dropdown-toggle"
                                            href="#" // eslint-disable-line jsx-a11y/anchor-is-valid
                                            id="navbarDropdownMenuLink"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            {user.name || user.email}
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                                            <li>
                                                <NavLink className="dropdown-item" to="/profile">
                                                    Профиль
                                                </NavLink>
                                            </li>
                                            <li>
                                                <button className="dropdown-item" onClick={handleLogout}>
                                                    Выйти
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/login">
                                            Войти
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/register">
                                            Регистрация
                                        </NavLink>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;