import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuthState } from '../contexts/AuthContext';

// Вспомогательные функции для форматирования (можно вынести в utils)
const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
};

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
        return dateString;
    }
};

function OrderDetailsPage() {
    const { orderId } = useParams();
    const { user, isAuthenticated } = useAuthState(); // Получаем пользователя для проверки прав
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) {
            setError("ID заказа не найден в URL.");
            setLoading(false);
            return;
        }

        if (!isAuthenticated) {
            // Можно редиректить на логин или просто показать сообщение
            setError("Пожалуйста, войдите в систему для просмотра деталей заказа.");
            setLoading(false);
            return;
        }

        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await orderService.getOrderDetails(orderId);
                // Дополнительная проверка: этот заказ принадлежит текущему пользователю?
                // Это лучше делать на бэкенде, но можно добавить и клиентскую проверку, если API отдает userId в заказе
                if (user && data.userId && data.userId !== user.id && user.role !== 'admin') {
                    setError("У вас нет прав для просмотра этого заказа.");
                    setOrder(null);
                } else {
                    setOrder(data);
                }
            } catch (err) {
                setError(err.message || "Не удалось загрузить детали заказа.");
                console.error("Error fetching order details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, isAuthenticated, user]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка деталей заказа...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <i className="bi bi-exclamation-triangle-fill display-3 text-danger mb-3"></i>
                <h2>Ошибка</h2>
                <p className="lead text-muted">{error}</p>
                <Link to="/profile" className="btn btn-primary mt-3">Вернуться в профиль</Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container py-5 text-center">
                <i className="bi bi-cart-x-fill display-3 text-warning mb-3"></i>
                <h2>Заказ не найден</h2>
                <p className="lead text-muted">Не удалось найти информацию по указанному заказу.</p>
                <Link to="/profile" className="btn btn-primary mt-3">Вернуться в профиль</Link>
            </div>
        );
    }

    // Предполагаемая структура объекта order:
    // order.id (или orderId)
    // order.orderNumber
    // order.createdAt (или date)
    // order.status ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    // order.items (массив товаров: [{ productId, name, quantity, price, imageUrl }])
    // order.totalAmount
    // order.deliveryAddress (объект или строка)
    // order.paymentMethod
    // order.shippingMethod

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <span className="badge bg-warning text-dark">В ожидании</span>;
            case 'processing': return <span className="badge bg-info">В обработке</span>;
            case 'shipped': return <span className="badge bg-primary">Отправлен</span>;
            case 'delivered': return <span className="badge bg-success">Доставлен</span>;
            case 'cancelled': return <span className="badge bg-danger">Отменен</span>;
            default: return <span className="badge bg-secondary">{status || 'Неизвестен'}</span>;
        }
    };

    return (
        <div className="container py-5">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
                    <li className="breadcrumb-item"><Link to="/profile">Профиль</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Заказ #{order.orderId || order.id}
                    </li>
                </ol>
            </nav>

            <h1 className="mb-4">Детали заказа #{order.orderId || order.id}</h1>

            <div className="card shadow-sm mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Общая информация</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <p><strong>Номер заказа:</strong> {order.orderId || order.id}</p>
                            <p><strong>Дата заказа:</strong> {formatDate(order.createdAt || order.date)}</p>
                            <p><strong>Статус:</strong> {getStatusBadge(order.status)}</p>
                            <p><strong>Итоговая сумма:</strong> <strong className="text-primary">{formatPrice(order.totalAmount)}</strong></p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Адрес доставки:</strong></p>
                            <p className="text-muted">
                                {typeof order.deliveryAddress === 'object'
                                    ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.zipCode}` // Пример, если адрес - объект
                                    : order.deliveryAddress || 'Не указан'}
                            </p>
                            {/* Можно добавить другие детали, если они есть, например, способ оплаты/доставки */}
                            {order.paymentMethod && <p><strong>Способ оплаты:</strong> {order.paymentMethod}</p>}
                            {order.shippingMethod && <p><strong>Способ доставки:</strong> {order.shippingMethod}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header">
                    <h5 className="mb-0">Состав заказа</h5>
                </div>
                <div className="card-body p-0">
                    {(!order.items || order.items.length === 0) ? (
                        <p className="text-muted p-3">Информация о товарах в заказе отсутствует.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th scope="col" style={{ width: '10%' }}></th>
                                    <th scope="col">Товар</th>
                                    <th scope="col" className="text-center">Кол-во</th>
                                    <th scope="col" className="text-end">Цена за ед.</th>
                                    <th scope="col" className="text-end">Сумма</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>
                                            <Link to={`/product/${item.id}`}>
                                                <img
                                                    src={item.imageUrl || 'https://via.placeholder.com/80?text=No+Image'}
                                                    alt={item.name}
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '60px', objectFit: 'cover' }}
                                                />
                                            </Link>
                                        </td>
                                        <td>
                                            <Link to={`/product/${item.id}`} className="text-decoration-none text-dark">
                                                {item.name || 'Без названия'}
                                            </Link>
                                            {item.variantInfo && <small className="d-block text-muted">{item.variantInfo}</small>}
                                        </td>
                                        <td className="text-center align-middle">{item.quantity}</td>
                                        <td className="text-end align-middle">{formatPrice(item.price)}</td>
                                        <td className="text-end align-middle fw-bold">{formatPrice(item.quantity * item.price)}</td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot className="table-light">
                                <tr>
                                    <td colSpan="4" className="text-end fw-bold">Промежуточный итог:</td>
                                    <td className="text-end fw-bold">{formatPrice(order.subtotalAmount !== undefined ? order.subtotalAmount : order.items.reduce((sum, item) => sum + item.quantity * item.price, 0))}</td>
                                </tr>
                                {order.discountAmount > 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-end fw-bold">Скидка:</td>
                                        <td className="text-end fw-bold text-danger">{formatPrice(order.discountAmount)}</td>
                                    </tr>
                                )}
                                {order.shippingCost > 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-end fw-bold">Доставка:</td>
                                        <td className="text-end fw-bold">{formatPrice(order.shippingCost)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="4" className="text-end h5">Итого:</td>
                                    <td className="text-end h5 text-primary">{formatPrice(order.totalAmount)}</td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 text-center">
                <Link to="/profile" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-2"></i>Вернуться к списку заказов
                </Link>
            </div>
        </div>
    );
}

export default OrderDetailsPage;