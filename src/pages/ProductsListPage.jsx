import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Импортируем useLocation
//import { productServiceTest } from '../services/productServiceTest';
import { productService } from '../services/productService';
import ProductCard from '../components/Product/ProductCard';

function ProductsListPage() {
    const location = useLocation(); // Получаем объект location

    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    const [availableCategories, setAvailableCategories] = useState([]); // Новое: доступные категории
    const [selectedCategory, setSelectedCategory] = useState(null); // Новое: выбранная категория

    // Загрузка продуктов, тегов, категорий и установка фильтров из URL при монтировании
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [productsData, tagsData, categoriesData] = await Promise.all([
                    productService.getProducts(),
                    productService.getAllTags(),
                    productService.getAllCategories() // Загружаем категории
                ]);
                setAllProducts(productsData);
                setFilteredProducts(productsData);
                setAvailableTags(tagsData);
                setAvailableCategories(categoriesData); // Сохраняем категории

                // Проверяем URL параметры для установки начальных фильтров
                const params = new URLSearchParams(location.search);
                const urlTag = params.get('tags'); // Для одного тега из URL
                const urlCategory = params.get('category');

                if (urlTag && tagsData.includes(urlTag)) {
                    setSelectedTags([urlTag]);
                }
                if (urlCategory && categoriesData.includes(urlCategory)) {
                    setSelectedCategory(urlCategory);
                }

            } catch (err) {
                console.error("Ошибка загрузки данных:", err);
                setError(err.message || 'Не удалось загрузить данные. Попробуйте обновить страницу.');
                setAllProducts([]);
                setFilteredProducts([]);
                setAvailableTags([]);
                setAvailableCategories([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [location.search]); // Перезапускаем при изменении URL параметров (например, при навигации по истории)

    // Фильтрация продуктов при изменении searchTerm, selectedTags, selectedCategory или allProducts
    useEffect(() => {
        let currentProducts = [...allProducts];

        if (searchTerm.trim() !== '') {
            currentProducts = currentProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedTags.length > 0) {
            currentProducts = currentProducts.filter(product =>
                selectedTags.every(selectedTag => product.tags.includes(selectedTag))
            );
        }

        // Новое: фильтрация по категории
        if (selectedCategory) {
            currentProducts = currentProducts.filter(product => product.category === selectedCategory);
        }

        setFilteredProducts(currentProducts);
    }, [searchTerm, selectedTags, selectedCategory, allProducts]);


    const handleTagToggle = (tag) => {
        setSelectedTags(prevSelectedTags =>
            prevSelectedTags.includes(tag)
                ? prevSelectedTags.filter(t => t !== tag)
                : [...prevSelectedTags, tag]
        );
    };

    // Новое: обработчик выбора категории
    const handleCategorySelect = (category) => {
        setSelectedCategory(prevSelectedCategory =>
            prevSelectedCategory === category ? null : category // Позволяет выбрать или снять выбор
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedTags([]);
        setSelectedCategory(null); // Сбрасываем и категорию
    };

    if (isLoading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Загрузка товаров...</span>
                </div>
                <p className="h5">Загрузка товаров...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <h4>Ошибка загрузки данных</h4>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="products-list-page">
            <div className="bg-light p-4 mb-4 rounded shadow-sm">
                <h1 className="display-6 mb-3">Каталог товаров</h1>
                <div className="row g-3">
                    <div className="col-lg-8">
                        <input
                            type="search"
                            className="form-control form-control-lg"
                            placeholder="Поиск по названию или описанию..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Поиск товаров"
                        />
                    </div>
                    <div className="col-lg-4 d-flex">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={clearFilters}
                            disabled={!searchTerm && selectedTags.length === 0 && !selectedCategory} // Обновляем условие
                        >
                            Сбросить все фильтры
                        </button>
                    </div>
                </div>
            </div>

            {/* Новое: Фильтр по категориям */}
            <div className="mb-4 p-3 border rounded bg-white shadow-sm">
                <h5 className="mb-3">Фильтр по категориям:</h5>
                {availableCategories.length > 0 ? (
                    <div className="d-flex flex-wrap">
                        {availableCategories.map(category => (
                            <button
                                key={category}
                                type="button"
                                className={`btn btn-sm me-2 mb-2 ${selectedCategory === category ? 'btn-info text-white' : 'btn-outline-info'}`}
                                onClick={() => handleCategorySelect(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">Категории для фильтрации отсутствуют.</p>
                )}
                {selectedCategory && (
                    <p className="mt-2 mb-0 small text-muted">
                        Активная категория: {selectedCategory}
                        <button
                            className="btn btn-link btn-sm p-0 ms-2 text-danger"
                            onClick={() => setSelectedCategory(null)}
                            title="Сбросить категорию"
                        >
                            (сбросить)
                        </button>
                    </p>
                )}
            </div>

            <div className="mb-4 p-3 border rounded bg-white shadow-sm">
                <h5 className="mb-3">Фильтр по тегам:</h5>
                {availableTags.length > 0 ? (
                    <div className="d-flex flex-wrap">
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                className={`btn btn-sm me-2 mb-2 ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleTagToggle(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">Теги для фильтрации отсутствуют.</p>
                )}
                {selectedTags.length > 0 && (
                    <p className="mt-2 mb-0 small text-muted">
                        Активные теги: {selectedTags.join(', ')}
                    </p>
                )}
            </div>

            {filteredProducts.length > 0 ? (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-emoji-frown text-muted mb-3" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
                    </svg>
                    <h4>Товары не найдены</h4>
                    <p className="text-muted">
                        По вашему запросу ничего не нашлось. Попробуйте изменить условия поиска или сбросить фильтры.
                    </p>
                </div>
            )}
        </div>
    );
}

export default ProductsListPage;