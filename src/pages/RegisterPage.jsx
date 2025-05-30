import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthDispatch, useAuthState } from '../contexts/AuthContext';

function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Можно добавить поле для подтверждения пароля и соответствующую логику

    const { register } = useAuthDispatch();
    const { isLoading, error, isAuthenticated } = useAuthState();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/profile'); // или '/'
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Здесь можно добавить валидацию, например, совпадение паролей
        try {
            await register({ name, email, password });
            // Навигация произойдет в useEffect
        } catch (err) {
            console.error('Ошибка регистрации:', err.message);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title text-center mb-4">Регистрация</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="nameInput" className="form-label">Имя</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nameInput"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="emailInputReg" className="form-label">Email адрес</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="emailInputReg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="passwordInputReg" className="form-label">Пароль</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="passwordInputReg"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6} // Пример простой валидации
                                    disabled={isLoading}
                                />
                            </div>
                            {/* Поле для подтверждения пароля можно добавить здесь */}
                            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span className="visually-hidden">Загрузка...</span> Регистрация...
                                    </>
                                ) : (
                                    'Зарегистрироваться'
                                )}
                            </button>
                        </form>
                        <p className="mt-3 text-center">
                            Уже есть аккаунт? <Link to="/login">Войти</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;