import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
//import { productServiceTest } from '../services/productServiceTest';
import { productService } from '../services/productService';
import { useCartDispatch } from '../contexts/CartContext'; // <-- Импортируем useCartDispatch

function ProductDetailsPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartDispatch(); // <-- Получаем функцию addItem

    // Функция для корректного отображения звезд рейтинга
    const renderStars = (ratingValue) => {
        const starsToRender = [];
        const rating = parseFloat(ratingValue);
        if (isNaN(rating)) return null;

        for (let i = 0; i < 5; i++) {
            if (rating >= i + 1) {
                starsToRender.push(<i key={`star-fill-${i}`} className="bi bi-star-fill"></i>);
            } else if (rating >= i + 0.5) {
                starsToRender.push(<i key={`star-half-${i}`} className="bi bi-star-half"></i>);
            } else {
                starsToRender.push(<i key={`star-empty-${i}`} className="bi bi-star"></i>);
            }
        }
        return starsToRender;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setError("ID товара не указан.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const data = await productService.getProductById(productId);
                if (data) {
                    setProduct(data);
                } else {
                    setError('Товар не найден. Возможно, он был удален или не существует.');
                }
            } catch (err) {
                console.error("Ошибка загрузки товара:", err);
                setError(err.message || 'Не удалось загрузить информацию о товаре.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleQuantityChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value > 0 && (!product || value <= product.stock)) {
            setQuantity(value);
        } else if (value <= 0) {
            setQuantity(1);
        } else if (product && value > product.stock) {
            setQuantity(product.stock);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        addItem(product, quantity); // <-- Используем addItem из CartContext
        // Можно добавить уведомление для пользователя, например, с помощью react-toastify или alert
        alert(`Товар "${product.name}" (ID: ${product.id}) в количестве ${quantity} шт. добавлен в корзину.`);
    };

    const displayPrice = product ? product.price.toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }) : '';

    if (isLoading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Загрузка информации о товаре...</span>
                </div>
                <p className="h5">Загрузка информации о товаре...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center" role="alert">
                    <h4>Ошибка!</h4>
                    <p>{error}</p>
                    <Link to="/products" className="btn btn-primary">Вернуться к списку товаров</Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mt-5 text-center">
                <h4>Товар не найден.</h4>
                <p>Запрашиваемый товар не может быть отображен.</p>
                <Link to="/products" className="btn btn-secondary">К каталогу товаров</Link>
            </div>
        );
    }

    const breadcrumbs = [
        { label: 'Главная', path: '/' },
        { label: 'Каталог', path: '/products' },
        { label: product.category || 'Категория', path: `/products?category=${encodeURIComponent(product.category || '')}` },
        { label: product.name, isActive: true }
    ];

    return (
        <div className="container mt-4 mb-5 product-details-page">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    {breadcrumbs.map((crumb, index) => (
                        <li key={index} className={`breadcrumb-item ${crumb.isActive ? 'active' : ''}`} aria-current={crumb.isActive ? 'page' : undefined}>
                            {crumb.isActive ? (
                                crumb.label
                            ) : (
                                <Link to={crumb.path}>{crumb.label}</Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            <div className="row g-5">
                <div className="col-lg-6">
                    <div className="product-image-container mb-4 shadow-sm rounded overflow-hidden">
                        <img
                            src={product.imageUrl || 'https://via.placeholder.com/600x450/CCCCCC/FFFFFF?Text=No+Image'}
                            className="img-fluid w-100"
                            alt={product.name}
                            style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                <div className="col-lg-6">
                    <h1 className="display-5 fw-bold mb-3">{product.name}</h1>

                    <div className="d-flex align-items-center mb-3">
                        {product.rating && (
                            <span className="text-warning me-2">
                                {renderStars(product.rating)}
                            </span>
                        )}
                        {product.reviews !== undefined && (
                            <a href="#reviews" className="text-muted text-decoration-none">({product.reviews} отзывов)</a>
                        )}
                    </div>

                    <p className="fs-3 fw-light mb-3">{displayPrice}</p>

                    <div className="mb-3">
                        <span className={`badge ${product.stock > 0 ? 'bg-success-subtle text-success-emphasis border border-success-subtle' : 'bg-danger-subtle text-danger-emphasis border border-danger-subtle'}`}>
                            {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
                        </span>
                        <span className="ms-3 text-muted small">Категория: <Link to={`/products?category=${encodeURIComponent(product.category || 'Без категории')}`} className="text-decoration-none">{product.category || 'Без категории'}</Link></span>
                    </div>

                    <p className="lead mb-4">{product.description}</p>

                    {product.tags && product.tags.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-2">Теги:</h5>
                            {product.tags.map(tag => (
                                <Link key={tag} to={`/products?tags=${encodeURIComponent(tag)}`} className="btn btn-sm btn-outline-secondary me-2 mb-2">{tag}</Link>
                            ))}
                        </div>
                    )}

                    {product.stock > 0 && (
                        <div className="card bg-light p-3 mb-4 shadow-sm">
                            <div className="row align-items-center">
                                <div className="col-md-4 mb-2 mb-md-0">
                                    <label htmlFor="quantity" className="form-label">Количество:</label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        className="form-control form-control-sm text-center"
                                        value={quantity}
                                        min="1"
                                        max={product.stock}
                                        onChange={handleQuantityChange}
                                        aria-label="Количество товара"
                                    />
                                </div>
                                <div className="col-md-8">
                                    <button
                                        className="btn btn-primary btn-lg w-100"
                                        onClick={handleAddToCart}
                                        disabled={quantity <= 0}
                                    >
                                        <i className="bi bi-cart-plus-fill me-2"></i>Добавить в корзину
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {product.stock === 0 && (
                        <div className="alert alert-warning" role="alert">
                            Товара временно нет в наличии.
                        </div>
                    )}

                    <div className="mt-4 d-grid gap-2 d-sm-flex">
                        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left me-2"></i>Назад
                        </button>
                        <Link to="/products" className="btn btn-outline-info">
                            <i className="bi bi-list-ul me-2"></i>Ко всем товарам
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailsPage;