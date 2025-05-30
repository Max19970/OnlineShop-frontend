import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Добавлен useLocation
import { useAuthDispatch, useAuthState } from '../contexts/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useAuthDispatch();
    const { isLoading, error, isAuthenticated } = useAuthState();
    const navigate = useNavigate();
    const location = useLocation(); // Получаем location

    // Определяем, куда перенаправить пользователя после входа
    const from = location.state?.from?.pathname || '/profile'; // По умолчанию на /profile

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true }); // Используем 'from' для редиректа
        }
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            // Навигация произойдет в useEffect
        } catch (err) {
            console.error('Ошибка входа:', err.message);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title text-center mb-4">Вход</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="emailInput" className="form-label">Email адрес</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="emailInput"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="passwordInput" className="form-label">Пароль</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="passwordInput"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span className="visually-hidden">Загрузка...</span> Вход...
                                    </>
                                ) : (
                                    'Войти'
                                )}
                            </button>
                        </form>
                        <p className="mt-3 text-center">
                            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;