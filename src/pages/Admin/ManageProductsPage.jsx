import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Импортируем созданные компоненты
import ProductListPage from '../../components/Admin/ProductListPage';
import ProductCreatePage from './ProductCreatePage'; // Это уже страница
import ProductEditPage from './ProductEditPage';   // Это уже страница

function ManageProductsPage() {
    // Базовый путь для продуктов уже "/admin/products",
    // так как AdminPage настроен на path="products/*" для этого компонента.
    // Поэтому здесь мы используем относительные пути для вложенных маршрутов.

    return (
        <Routes>
            {/* Индексный маршрут для /admin/products -> покажет список товаров */}
            <Route index element={<ProductListPage />} />

            {/* Маршрут для /admin/products/new -> покажет форму создания товара */}
            <Route path="new" element={<ProductCreatePage />} />

            {/* Маршрут для /admin/products/edit/:productId -> покажет форму редактирования товара */}
            <Route path="edit/:productId" element={<ProductEditPage />} />

            {/* Можно добавить маршрут для просмотра одного товара, если нужно /admin/products/view/:productId */}
            {/* <Route path="view/:productId" element={<ProductViewPage />} /> */}
        </Routes>
    );
}

export default ManageProductsPage;