import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/Admin/ProductForm';
import { productService } from '../../services/productService';

function ProductCreatePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSaveProduct = async (productData) => {
        setIsLoading(true);
        setError(null);
        try {
            // Убедимся, что передаем правильные данные в сервис
            const dataToSave = {
                ...productData,
                // Преобразования, если API ожидает числовые ID для категорий/тегов,
                // или если какие-то поля не должны отправляться при создании
                // Например, если API само генерирует ID
            };
            await productService.createProduct(dataToSave);
            alert('Товар успешно создан!'); // Заменить на более user-friendly уведомление
            navigate('/admin/products'); // Перенаправление на список товаров
        } catch (err) {
            console.error("Ошибка при создании товара:", err);
            setError(err.message || 'Не удалось создать товар. Проверьте введенные данные.');
            setIsLoading(false);
        }
        // setIsLoading(false) здесь не нужен, если есть navigate,
        // но если создание не удалось, то isLoading должен быть false
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    return (
        <div>
            {/* Можно добавить "хлебные крошки" или заголовок страницы */}
            <h2 className="mb-4">Добавление нового товара</h2>
            <ProductForm
                onSave={handleSaveProduct}
                onCancel={handleCancel}
                isLoading={isLoading}
                error={error}
                // initialProduct не передаем, так как это форма для создания
            />
        </div>
    );
}

export default ProductCreatePage;