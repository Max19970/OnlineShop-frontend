import React, { useState, useEffect } from 'react';
import { useNavigate }from 'react-router-dom';

function ProductForm({ initialProduct, onSave, onCancel, isLoading, error }) {
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        category: '', // Или categoryId, если категории - объекты
        stock: 0, // или countInStock, в зависимости от модели
        imageUrl: '',
        brand: '',
        tags: [], // Массив строк или объектов
        // ... другие поля, если есть
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (initialProduct) {
            setProductData({
                name: initialProduct.name || '',
                description: initialProduct.description || '',
                price: initialProduct.price || '',
                category: initialProduct.category?.name || initialProduct.category || '', // Адаптируем под структуру категории
                stock: initialProduct.stock !== undefined ? initialProduct.stock : 0,
                imageUrl: initialProduct.imageUrl || initialProduct.images?.[0]?.url || '',
                brand: initialProduct.brand || '',
                tags: initialProduct.tags || [],
                // ... маппинг других полей
            });
        } else {
            // Сброс формы для создания нового продукта
            setProductData({
                name: '', description: '', price: '', category: '',
                stock: 0, imageUrl: '', brand: '', tags: []
            });
        }
    }, [initialProduct]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Для чекбоксов или других типов полей, которые могут потребовать особой обработки
        if (name === "tags") { // Пример для тегов, если они вводятся через запятую
            setProductData(prev => ({ ...prev, [name]: value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
        } else {
            setProductData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        // Разрешаем только цифры и одну точку для десятичных знаков
        if (/^\d*\.?\d*$/.test(value)) {
            setProductData(prev => ({ ...prev, price: value }));
        }
    };

    const handleStockQuantityChange = (e) => {
        const value = e.target.value;
        // Разрешаем только целые числа
        if (/^\d*$/.test(value)) {
            setProductData(prev => ({ ...prev, stock: parseInt(value) }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const processedData = {
            ...productData,
            price: parseFloat(productData.price) || 0,
            stock: productData.stock,
            // Категорию и теги, возможно, нужно будет преобразовать к ID, если API этого требует
        };
        onSave(processedData);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate(-1); // Вернуться на предыдущую страницу по умолчанию
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card shadow-sm">
            <div className="card-header">
                <h5 className="mb-0">{initialProduct ? 'Редактировать товар' : 'Добавить новый товар'}</h5>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}

                <div className="row g-3">
                    <div className="col-md-8">
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Название товара</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={productData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Описание</label>
                            <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                rows="5"
                                value={productData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="mb-3">
                            <label htmlFor="imageUrl" className="form-label">URL основного изображения</label>
                            <input
                                type="url"
                                className="form-control"
                                id="imageUrl"
                                name="imageUrl"
                                value={productData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                            {productData.imageUrl && (
                                <img src={productData.imageUrl} alt="Предпросмотр" className="img-thumbnail mt-2" style={{ maxHeight: '150px' }}/>
                            )}
                        </div>
                    </div>
                </div>


                <div className="row g-3">
                    <div className="col-md-4">
                        <label htmlFor="price" className="form-label">Цена (RUB)</label>
                        <input
                            type="text" // Используем text для кастомной обработки
                            className="form-control"
                            id="price"
                            name="price"
                            value={productData.price}
                            onChange={handlePriceChange}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="category" className="form-label">Категория</label>
                        {/* TODO: Заменить на select с загрузкой категорий */}
                        <input
                            type="text"
                            className="form-control"
                            id="category"
                            name="category"
                            value={productData.category}
                            onChange={handleChange}
                            placeholder="Название категории"
                        />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="stock" className="form-label">Количество на складе</label>
                        <input
                            type="text" // Используем text для кастомной обработки
                            className="form-control"
                            id="stock"
                            name="stock"
                            value={productData.stock}
                            onChange={handleStockQuantityChange}
                            placeholder="0"
                            required
                        />
                    </div>
                </div>

                <div className="row g-3 mt-2">
                    <div className="col-md-6">
                        <label htmlFor="brand" className="form-label">Бренд</label>
                        <input
                            type="text"
                            className="form-control"
                            id="brand"
                            name="brand"
                            value={productData.brand}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="tags" className="form-label">Теги (через запятую)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="tags"
                            name="tags"
                            value={Array.isArray(productData.tags) ? productData.tags.join(', ') : ''}
                            onChange={handleChange}
                            placeholder="одежда, электроника, новинка"
                        />
                        {/* TODO: Добавить более продвинутый ввод тегов, например, react-select */}
                    </div>
                </div>

            </div>
            <div className="card-footer d-flex justify-content-end">
                <button type="button" className="btn btn-outline-secondary me-2" onClick={handleCancel} disabled={isLoading}>
                    Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Сохранение...
                        </>
                    ) : (initialProduct ? 'Сохранить изменения' : 'Создать товар')}
                </button>
            </div>
        </form>
    );
}

export default ProductForm;