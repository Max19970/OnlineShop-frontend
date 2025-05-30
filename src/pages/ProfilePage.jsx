import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Импортируем Link
import { useAuthState, useAuthDispatch } from '../contexts/AuthContext';
import { orderService } from '../services/orderService'; // Импортируем orderService

function ProfilePage() {
    const { user, isLoading: authLoading, error: authErrorFromContext } = useAuthState();
    const { updateUserDeliveryAddress, updateUserProfile } = useAuthDispatch();

    // Состояния для редактирования адреса
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [addressEditError, setAddressEditError] = useState(null);
    const [addressEditSuccess, setAddressEditSuccess] = useState(null);
    const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

    // Состояния для редактирования профиля (имя, email)
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    const [profileEditError, setProfileEditError] = useState(null);
    const [profileEditSuccess, setProfileEditSuccess] = useState(null);
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

    // Состояния для истории заказов
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    useEffect(() => {
        if (user) {
            setDeliveryAddress(user.deliveryAddress || '');
            setProfileData({ name: user.name || '', email: user.email || '' });

            // Загрузка истории заказов
            const fetchOrders = async () => {
                if (!user.id) return;
                setIsLoadingOrders(true);
                setOrdersError(null);
                try {
                    const userOrders = await orderService.getUserOrders(user.id);
                    setOrders(userOrders || []);
                } catch (error) {
                    console.error("Error fetching user orders:", error);
                    setOrdersError(error.message || 'Не удалось загрузить историю заказов.');
                } finally {
                    setIsLoadingOrders(false);
                }
            };

            fetchOrders();
        } else {
            // Если пользователя нет (например, после логаута), очищаем заказы
            setOrders([]);
        }
    }, [user]); // Зависимость от user, чтобы перезагрузить при смене пользователя

    // --- Обработчики для адреса ---
    const handleEditAddressToggle = () => {
        setIsEditingAddress(!isEditingAddress);
        setAddressEditError(null);
        setAddressEditSuccess(null);
        if (isEditingAddress && user) {
            setDeliveryAddress(user.deliveryAddress || '');
        }
    };

    const handleAddressChange = (e) => {
        setDeliveryAddress(e.target.value);
        if (addressEditError) setAddressEditError(null);
        if (addressEditSuccess) setAddressEditSuccess(null);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.id) {
            setAddressEditError('Ошибка: пользователь не идентифицирован.');
            return;
        }
        if (!deliveryAddress.trim()) {
            setAddressEditError('Адрес доставки не может быть пустым.');
            return;
        }
        setIsSubmittingAddress(true);
        setAddressEditError(null);
        setAddressEditSuccess(null);
        try {
            await updateUserDeliveryAddress(user.id, deliveryAddress.trim());
            setAddressEditSuccess('Адрес доставки успешно обновлен!');
            setIsEditingAddress(false);
        } catch (error) {
            setAddressEditError(error.message || 'Не удалось обновить адрес.');
        } finally {
            setIsSubmittingAddress(false);
        }
    };

    // --- Обработчики для профиля (имя, email) ---
    const handleEditProfileToggle = () => {
        setIsEditingProfile(!isEditingProfile);
        setProfileEditError(null);
        setProfileEditSuccess(null);
        if (isEditingProfile && user) {
            setProfileData({ name: user.name || '', email: user.email || '' });
        }
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        if (profileEditError) setProfileEditError(null);
        if (profileEditSuccess) setProfileEditSuccess(null);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.id) {
            setProfileEditError('Ошибка: пользователь не идентифицирован.');
            return;
        }
        if (!profileData.name.trim()) {
            setProfileEditError('Имя не может быть пустым.');
            return;
        }
        if (!profileData.email.trim()) {
            setProfileEditError('Email не может быть пустым.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            setProfileEditError('Введите корректный email.');
            return;
        }

        setIsSubmittingProfile(true);
        setProfileEditError(null);
        setProfileEditSuccess(null);
        try {
            await updateUserProfile(user.id, { name: profileData.name.trim(), email: profileData.email.trim() });
            setProfileEditSuccess('Данные профиля успешно обновлены!');
            setIsEditingProfile(false);
        } catch (error) {
            setProfileEditError(error.message || 'Не удалось обновить данные профиля.');
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    // Форматирование цены (можно вынести в utils, если используется в других местах)
    const formatPrice = (price) => {
        return price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
    };

    // Форматирование даты (можно вынести в utils)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString; // Если дата в неверном формате
        }
    };


    if (authLoading && !user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка данных профиля...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container py-5 text-center">
                <i className="bi bi-person-fill-lock display-1 text-danger mb-4"></i>
                <h2>Доступ запрещен</h2>
                <p className="lead text-muted">Пожалуйста, войдите в систему, чтобы просмотреть свой профиль.</p>
            </div>
        );
    }

    if (authErrorFromContext && !user) { // Эта проверка может быть избыточной, если !user уже обработан
        return (
            <div className="alert alert-danger text-center">
                Ошибка загрузки данных пользователя: {authErrorFromContext}
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-lg-4">
                    {/* Карточка с основной информацией о пользователе */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body text-center">
                            <i className="bi bi-person-circle display-1 text-primary mb-3"></i>
                            <h4 className="card-title mb-1">{isEditingProfile ? profileData.name : user.name}</h4>
                            <p className="text-muted mb-2">{isEditingProfile ? profileData.email : user.email}</p>
                            <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'info'}`}>
                                {user.role === 'admin' ? 'Администратор' : 'Покупатель'}
                            </span>
                        </div>
                    </div>

                    {/* Блок Истории заказов */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h5 className="card-title mb-3"><i className="bi bi-list-check me-2"></i>Мои заказы</h5>
                            {isLoadingOrders && (
                                <div className="text-center">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Загрузка заказов...</span>
                                    </div>
                                </div>
                            )}
                            {ordersError && <div className="alert alert-danger small p-2">{ordersError}</div>}
                            {!isLoadingOrders && !ordersError && orders.length === 0 && (
                                <p className="text-muted">У вас пока нет заказов.</p>
                            )}
                            {!isLoadingOrders && !ordersError && orders.length > 0 && (
                                <div className="list-group list-group-flush">
                                    {orders.slice(0, 5).map(order => ( // Показываем, например, последние 5 заказов
                                        <Link
                                            key={order.id || order.orderId} // Используйте order.id или order.orderId
                                            to={`/order-details/${order.id || order.orderId}`} // Убедитесь, что у вас есть такой маршрут
                                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                        >
                                            <span>
                                                Заказ #{order.orderNumber || order.id || order.orderId}
                                                <br />
                                                <small className="text-muted">{formatDate(order.createdAt || order.date)}</small>
                                            </span>
                                            <span className="badge bg-success rounded-pill">
                                                {formatPrice(order.totalAmount)}
                                            </span>
                                        </Link>
                                    ))}
                                    {orders.length > 5 && (
                                        <Link to="/orders" className="list-group-item list-group-item-action text-center text-primary">
                                            Посмотреть все заказы
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    {/* Секция редактирования личных данных */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h5 className="card-title d-flex justify-content-between align-items-center mb-4">
                                <span><i className="bi bi-person-fill-gear me-2"></i>Личные данные</span>
                                <button
                                    className={`btn btn-sm ${isEditingProfile ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                                    onClick={handleEditProfileToggle}
                                    disabled={isSubmittingProfile}
                                >
                                    <i className={`bi ${isEditingProfile ? 'bi-x-lg' : 'bi-pencil-square'} me-1`}></i>
                                    {isEditingProfile ? 'Отмена' : 'Изменить'}
                                </button>
                            </h5>

                            {profileEditError && <div className="alert alert-danger small p-2">{profileEditError}</div>}
                            {profileEditSuccess && <div className="alert alert-success small p-2">{profileEditSuccess}</div>}

                            {!isEditingProfile ? (
                                <>
                                    <div className="row mb-2">
                                        <div className="col-sm-3"><strong className="text-muted">Имя:</strong></div>
                                        <div className="col-sm-9">{user.name}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3"><strong className="text-muted">Email:</strong></div>
                                        <div className="col-sm-9">{user.email}</div>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="profileName" className="form-label small">Имя:</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            id="profileName"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileInputChange}
                                            disabled={isSubmittingProfile}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="profileEmail" className="form-label small">Email:</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-sm"
                                            id="profileEmail"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileInputChange}
                                            disabled={isSubmittingProfile}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmittingProfile}>
                                        {isSubmittingProfile ? (
                                            <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Сохранение...</>
                                        ) : (
                                            <><i className="bi bi-save me-1"></i> Сохранить</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Секция редактирования Адреса доставки */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h5 className="card-title d-flex justify-content-between align-items-center mb-4">
                                <span><i className="bi bi-truck me-2"></i>Адрес доставки</span>
                                <button
                                    className={`btn btn-sm ${isEditingAddress ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                                    onClick={handleEditAddressToggle}
                                    disabled={isSubmittingAddress}
                                >
                                    <i className={`bi ${isEditingAddress ? 'bi-x-lg' : 'bi-pencil-square'} me-1`}></i>
                                    {isEditingAddress ? 'Отмена' : 'Изменить'}
                                </button>
                            </h5>

                            {addressEditError && <div className="alert alert-danger small p-2">{addressEditError}</div>}
                            {addressEditSuccess && <div className="alert alert-success small p-2">{addressEditSuccess}</div>}

                            {!isEditingAddress ? (
                                <p className="text-muted">
                                    {user.deliveryAddress ? user.deliveryAddress : 'Адрес доставки не указан.'}
                                </p>
                            ) : (
                                <form onSubmit={handleAddressSubmit}>
                                    <div className="mb-3">
                                        <textarea
                                            className="form-control form-control-sm"
                                            rows="3"
                                            value={deliveryAddress}
                                            onChange={handleAddressChange}
                                            placeholder="Введите ваш адрес доставки"
                                            disabled={isSubmittingAddress}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmittingAddress}>
                                        {isSubmittingAddress ? (
                                            <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Сохранение...</>
                                        ) : (
                                            <><i className="bi bi-save me-1"></i> Сохранить адрес</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;