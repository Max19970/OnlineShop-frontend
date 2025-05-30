import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../components/Admin/ProductForm';
import { productService } from '../../services/productService';

function ProductEditPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [initialProduct, setInitialProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Общее состояние загрузки (для формы и для получения данных)
    const [error, setError] = useState(null); // Общее состояние ошибки

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setError("ID товара не указан.");
                navigate('/admin/products'); // или на страницу 404
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const data = await productService.getProductById(productId);
                if (data) {
                    setInitialProduct(data);
                } else {
                    setError('Товар не найден.');
                    // Можно добавить задержку перед редиректом, чтобы пользователь увидел сообщение
                    // setTimeout(() => navigate('/admin/products'), 3000);
                }
            } catch (err) {
                console.error("Ошибка загрузки товара для редактирования:", err);
                setError(err.message || 'Не удалось загрузить данные товара.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productId, navigate]);

    const handleSaveProduct = async (productData) => {
        setIsLoading(true);
        setError(null);
        try {
            // Убедимся, что productId есть
            if (!productId) {
                throw new Error("Невозможно обновить товар без ID.");
            }
            // Данные для обновления
            const dataToUpdate = {
                ...productData,
                id: productId, // Или _id, в зависимости от вашей модели данных
                // Преобразования, если API ожидает числовые ID для категорий/тегов
            };
            await productService.updateProduct(productId, dataToUpdate);
            alert('Товар успешно обновлен!'); // Заменить на более user-friendly уведомление
            navigate('/admin/products'); // Перенаправление на список товаров
        } catch (err) {
            console.error("Ошибка при обновлении товара:", err);
            setError(err.message || 'Не удалось обновить товар. Проверьте введенные данные.');
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    if (isLoading && !initialProduct) { // Показываем загрузку, пока данные товара не загружены
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Загрузка данных товара...</span>
                </div>
                <p className="h5">Загрузка данных товара...</p>
            </div>
        );
    }

    if (error && !initialProduct) { // Если ошибка при загрузке и товара нет
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center" role="alert">
                    <h4>Ошибка!</h4>
                    <p>{error}</p>
                    <button onClick={() => navigate('/admin/products')} className="btn btn-primary">
                        Вернуться к списку товаров
                    </button>
                </div>
            </div>
        );
    }

    if (!initialProduct && !isLoading) { // Если товар не найден (и не идет загрузка)
        return (
            <div className="container mt-5">
                <div className="alert alert-warning text-center" role="alert">
                    <h4>Товар не найден</h4>
                    <p>Не удалось загрузить товар для редактирования.</p>
                    <button onClick={() => navigate('/admin/products')} className="btn btn-primary">
                        Вернуться к списку товаров
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="mb-4">Редактирование товара: {initialProduct?.name || `ID: ${productId}`}</h2>
            {/* initialProduct может быть еще null на первом рендере, поэтому ProductForm должен это корректно обрабатывать
                или мы можем отрендерить ProductForm только когда initialProduct загружен */}
            {initialProduct && (
                <ProductForm
                    initialProduct={initialProduct}
                    onSave={handleSaveProduct}
                    onCancel={handleCancel}
                    isLoading={isLoading} // Передаем состояние загрузки операции сохранения
                    error={error} // Передаем ошибку операции сохранения
                />
            )}
        </div>
    );
}

export default ProductEditPage;