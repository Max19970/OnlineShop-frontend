import React from 'react';
import { Link } from 'react-router-dom';

// Функцию форматирования цены можно вынести в утилиты, если она используется еще где-то,
// но для простоты пока оставим здесь.
const formatPrice = (price) => {
    return price.toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
};

function CartItem({ item, updateQuantity, removeItem }) {
    const handleQuantityChange = (productId, newQuantity) => {
        const quantityNum = parseInt(newQuantity, 10);
        if (!isNaN(quantityNum)) {
            updateQuantity(productId, quantityNum);
        }
    };

    const calculateSubtotal = (cartItem) => {
        return cartItem.price * cartItem.quantity;
    };

    return (
        <div className="card mb-3 shadow-sm">
            <div className="card-body">
                <div className="row align-items-center">
                    <div className="col-md-2 col-sm-3 col-4">
                        <Link to={`/product/${item.id}`}>
                            <img
                                src={item.imageUrl || 'https://via.placeholder.com/150x100/CCCCCC/FFFFFF?Text=No+Image'}
                                alt={item.name}
                                className="img-fluid rounded"
                                style={{ maxHeight: '100px', objectFit: 'contain' }}
                            />
                        </Link>
                    </div>
                    <div className="col-md-4 col-sm-9 col-8">
                        <h5 className="card-title mb-1">
                            <Link to={`/product/${item.id}`} className="text-decoration-none text-dark">{item.name}</Link>
                        </h5>
                        <p className="card-text text-muted small">Цена: {formatPrice(item.price)}</p>
                    </div>
                    <div className="col-md-3 col-sm-6 col-7 mt-2 mt-md-0">
                        <div className="input-group input-group-sm" style={{maxWidth: '150px'}}>
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                            >
                                <i className="bi bi-dash"></i>
                            </button>
                            <input
                                type="number"
                                className="form-control text-center"
                                value={item.quantity}
                                min="1"
                                max={item.stock || 99}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                aria-label={`Количество ${item.name}`}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.stock && item.quantity >= item.stock}
                            >
                                <i className="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-4 mt-2 mt-md-0 text-md-end">
                        <p className="fw-bold mb-0">{formatPrice(calculateSubtotal(item))}</p>
                    </div>
                    <div className="col-md-1 col-sm-2 col-1 mt-2 mt-md-0 text-end">
                        <button
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => removeItem(item.id)}
                            title="Удалить товар"
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartItem;