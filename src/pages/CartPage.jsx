import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartState, useCartDispatch } from '../contexts/CartContext';
import { useAuthState } from '../contexts/AuthContext';
import CartItem from '../components/Cart/CartItem';
import { orderService } from '../services/orderService'; // Импортируем наш новый сервис
//import { orderServiceTest } from '../services/orderServiceTest';

function CartPage() {
    const { items } = useCartState();
    const { updateQuantity, removeItem, clearCart } = useCartDispatch();
    const { isAuthenticated, user } = useAuthState();
    const navigate = useNavigate();

    const [checkoutError, setCheckoutError] = useState(null);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false); // Состояние для отслеживания процесса оформления

    const formatPrice = (price) => {
        return price.toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        setCheckoutError(null);
        if (!isAuthenticated) {
            // ИЗМЕНЕНО: Устанавливаем сообщение об ошибке вместо навигации
            setCheckoutError('Для оформления заказа необходимо авторизоваться.');
            return;
        }

        if (!user?.deliveryAddress) {
            setCheckoutError('Пожалуйста, укажите адрес доставки в вашем профиле перед оформлением заказа.');
            return;
        }

        setIsProcessingOrder(true); // Начинаем процесс оформления
        try {
            const totalAmount = calculateTotal();
            // Предполагаем, что объект user содержит id и email, необходимые для заказа
            // Также передаем deliveryAddress, если оно есть в user
            console.log("Total Amount: " + totalAmount);
            const orderData = {
                id: user.id, // или user.uid, в зависимости от вашей структуры AuthContext
                email: user.email,
                deliveryAddress: user.deliveryAddress,
                items: items,
                totalAmount: totalAmount
            };

            console.log("Order Data: " + JSON.stringify(orderData));

            const createdOrder = await orderService.createOrder(orderData);

            console.log('Заказ успешно создан:', createdOrder);
            alert(`Заказ #${createdOrder.orderId} успешно оформлен! Мы скоро свяжемся с вами.`);
            clearCart(); // Очищаем корзину после успешного заказа
            // Опционально: перенаправить на страницу подтверждения заказа
            navigate(`/order-details/${createdOrder.orderId}`); // Пример, если у вас есть такая страница

        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            setCheckoutError(error.message || 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.');
        } finally {
            setIsProcessingOrder(false); // Завершаем процесс оформления
        }
    };

    if (items.length === 0 && !isProcessingOrder) { // Не показываем пустую корзину, если идет оформление
        return (
            <div className="text-center mt-5">
                <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                <h2 className="mt-3">Ваша корзина пуста</h2>
                <p className="lead text-muted">Самое время добавить что-нибудь интересное!</p>
                <Link to="/products" className="btn btn-primary btn-lg mt-3">
                    <i className="bi bi-shop me-2"></i>Перейти к покупкам
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Ваша корзина</h1>
                {items.length > 0 && !isProcessingOrder && (
                    <button className="btn btn-outline-danger" onClick={clearCart} disabled={isProcessingOrder}>
                        <i className="bi bi-trash3 me-2"></i>Очистить корзину
                    </button>
                )}
            </div>

            {checkoutError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {checkoutError}
                    <button type="button" className="btn-close" onClick={() => setCheckoutError(null)} aria-label="Close"></button>
                </div>
            )}

            {isProcessingOrder && (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Оформление заказа...</span>
                    </div>
                    <p className="mt-3 fs-5">Оформляем ваш заказ, пожалуйста, подождите...</p>
                </div>
            )}

            {!isProcessingOrder && items.length > 0 && ( // Показываем содержимое корзины только если не идет оформление
                <div className="row gy-4">
                    <div className="col-lg-8">
                        {items.map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                updateQuantity={updateQuantity}
                                removeItem={removeItem}
                            />
                        ))}
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Сумма заказа</h4>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        Товары ({items.reduce((acc, item) => acc + item.quantity, 0)} шт.)
                                        <span>{formatPrice(calculateTotal())}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        Доставка
                                        <span className="text-success">Бесплатно</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0 fw-bold border-top pt-3">
                                        Итого
                                        <span>{formatPrice(calculateTotal())}</span>
                                    </li>
                                </ul>
                                <button
                                    className="btn btn-primary btn-lg w-100 mt-4"
                                    onClick={handleCheckout}
                                    disabled={isProcessingOrder || items.length === 0}
                                >
                                    {isProcessingOrder ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Обработка...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-wallet2 me-2"></i>Оформить заказ
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;