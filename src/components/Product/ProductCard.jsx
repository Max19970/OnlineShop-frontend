import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css'; // Создадим этот файл для дополнительной стилизации
import { useCartDispatch } from '../../contexts/CartContext'; // Импортируем хук для доступа к функциям корзины

function ProductCard({ product }) {
    const { addItem } = useCartDispatch(); // Получаем функцию addItem из контекста

    if (!product) {
        return null; // Или какой-то плейсхолдер для ошибки
    }

    const { id, name, price, imageUrl, tags, description, rating, reviews } = product;

    const displayPrice = price.toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0, // Не показывать копейки, если они нулевые
        maximumFractionDigits: 2
    });

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product); // Используем product целиком, т.к. CartContext ожидает объект товара
        // Можно добавить уведомление для пользователя, например, с помощью toast-библиотеки
        alert(`Товар "${name}" добавлен в корзину`);
    };

    return (
        <div className="col">
            <div className="card h-100 shadow-sm product-card">
                <Link to={`/product/${id}`} className="product-card-img-link">
                    <img
                        src={imageUrl || 'https://via.placeholder.com/400x300/CCCCCC/FFFFFF?Text=No+Image'}
                        className="card-img-top product-card-img"
                        alt={name}
                    />
                </Link>
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title product-card-title">
                        <Link to={`/product/${id}`} className="text-decoration-none stretched-link">
                            {name}
                        </Link>
                    </h5>
                    <p className="card-text text-muted small flex-grow-1 product-card-description">
                        {description.substring(0, 80)}{description.length > 80 ? '...' : ''}
                    </p>
                    <div className="product-card-tags mb-2">
                        {tags && tags.length > 0 && (
                            tags.slice(0, 3).map(tag => (
                                <span key={tag} className="badge bg-light text-dark me-1 mb-1 border">{tag}</span>
                            ))
                        )}
                        {tags && tags.length > 3 && (
                            <span className="badge bg-light text-dark me-1 mb-1 border">+{tags.length - 3} еще</span>
                        )}
                    </div>
                    {rating && (
                        <div className="product-card-rating small text-muted mb-2">
                            Рейтинг: {rating.toFixed(1)}/5 ({reviews} отзывов)
                        </div>
                    )}
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                        <p className="card-text fs-5 fw-bold mb-0 product-card-price">{displayPrice}</p>
                        <button className="btn btn-sm btn-primary" onClick={handleAddToCart}>
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;