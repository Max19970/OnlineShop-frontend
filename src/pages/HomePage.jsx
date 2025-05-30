import React from 'react';
import { Link } from 'react-router-dom'; // Для кнопок-ссылок
// import ProductCard from '../components/Products/ProductCard'; // Если хотите вывести несколько товаров
// import { productServiceTest } from '../services/productServiceTest'; // Если хотите загрузить реальные товары
// import { useQuery } from 'react-query'; // Если используете react-query для загрузки

function HomePage() {
    // Пример: если бы вы хотели загрузить несколько товаров для отображения
    // const { data: featuredProducts, isLoading, error } = useQuery('featuredProducts', () => productServiceTest.getProducts().then(data => data.slice(0, 3)));

    return (
        <div>
            {/* Секция "Герой" (Hero Section) */}
            <div className="container-fluid bg-light p-5 mb-4 rounded-3 shadow-sm">
                <div className="container-fluid py-5 text-center">
                    <i className="bi bi-shop-window display-1 text-primary mb-4"></i>
                    <h1 className="display-4 fw-bold">Добро пожаловать в ТехноМарт!</h1>
                    <p className="fs-4 col-md-8 offset-md-2 text-muted">
                        Ваш надежный партнер в мире современной электроники и гаджетов.
                        Откройте для себя лучшие новинки и проверенные временем устройства по выгодным ценам.
                    </p>
                    <Link to="/products" className="btn btn-primary btn-lg mt-3 px-4 gap-3">
                        <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                        Перейти в каталог
                    </Link>
                </div>
            </div>

            {/* Секция "Преимущества" */}
            <div className="container px-4 py-5" id="featured-3">
                <h2 className="pb-2 border-bottom text-center mb-5">Почему выбирают нас?</h2>
                <div className="row g-4 py-3 row-cols-1 row-cols-lg-3">
                    <div className="feature col text-center">
                        <div className="feature-icon-small d-inline-flex align-items-center justify-content-center text-bg-primary bg-gradient fs-2 mb-3 rounded-3 p-3">
                            <i className="bi bi-truck"></i>
                        </div>
                        <h3 className="fs-4 text-body-emphasis">Быстрая доставка</h3>
                        <p>Оперативно доставим ваш заказ в любую точку страны. Удобные варианты получения.</p>
                    </div>
                    <div className="feature col text-center">
                        <div className="feature-icon-small d-inline-flex align-items-center justify-content-center text-bg-primary bg-gradient fs-2 mb-3 rounded-3 p-3">
                            <i className="bi bi-shield-check"></i>
                        </div>
                        <h3 className="fs-4 text-body-emphasis">Гарантия качества</h3>
                        <p>Мы работаем только с проверенными поставщиками и предлагаем официальную гарантию на все товары.</p>
                    </div>
                    <div className="feature col text-center">
                        <div className="feature-icon-small d-inline-flex align-items-center justify-content-center text-bg-primary bg-gradient fs-2 mb-3 rounded-3 p-3">
                            <i className="bi bi-headset"></i>
                        </div>
                        <h3 className="fs-4 text-body-emphasis">Поддержка клиентов</h3>
                        <p>Наша команда поддержки всегда готова помочь вам с выбором и ответить на любые вопросы.</p>
                    </div>
                </div>
            </div>

            {/* Секция "Популярные товары" или "Новинки" (пример, требует загрузки данных) */}
            {/*
            <div className="container py-5">
                <h2 className="text-center mb-5">Популярные товары</h2>
                {isLoading && <p className="text-center">Загрузка товаров...</p>}
                {error && <p className="text-center text-danger">Ошибка загрузки товаров.</p>}
                {featuredProducts && (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
                <div className="text-center mt-5">
                    <Link to="/products" className="btn btn-outline-primary btn-lg">
                        Смотреть все товары
                    </Link>
                </div>
            </div>
            */}

            {/* Секция "Призыв к действию" (Call to Action) */}
            <div className="container my-5">
                <div className="p-5 text-center bg-body-tertiary rounded-3">
                    <i className="bi bi-envelope-paper-heart fs-1 text-success mb-3"></i>
                    <h2 className="text-body-emphasis">Будьте в курсе новинок и акций!</h2>
                    <p className="col-lg-8 mx-auto fs-5 text-muted">
                        Подпишитесь на нашу рассылку, чтобы первыми узнавать о специальных предложениях и поступлениях.
                    </p>
                    <div className="d-inline-flex gap-2 my-3 justify-content-center">
                        {/* Здесь можно добавить форму подписки или ссылку на страницу подписки */}
                        <button className="btn btn-success btn-lg" type="button" onClick={() => alert('Функционал подписки в разработке!')}>
                            <i className="bi bi-bell-fill me-2"></i>
                            Подписаться
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default HomePage;