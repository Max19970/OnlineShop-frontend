// TODO: Заменить URL на актуальный адрес вашего API
const API_BASE_URL = 'http://localhost:5000/api/products';

export const productService = {
    getProducts: async (params = {}) => {
        // Добавим возможность передавать параметры, например, для пагинации или фильтрации в будущем
        const queryParams = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}${queryParams ? `?${queryParams}` : ''}`);
        if (!response.ok) {
            throw new Error('Не удалось загрузить товары');
        }
        return response.json();
    },

    getProductById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Не удалось загрузить товар с ID: ${id}`);
        }
        return response.json();
    },

    createProduct: async (productData) => {
        const token = localStorage.getItem('authToken'); // Предполагаем, что токен хранится так
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Токен для авторизации администратора
            },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Ошибка при создании товара');
        }
        return response.json();
    },

    updateProduct: async (productId, productData) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Ошибка при обновлении товара');
        }
        return response.json();
    },

    deleteProduct: async (productId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            // DELETE может не возвращать тело JSON при успехе, но при ошибке может
            let errorMessage = 'Ошибка при удалении товара';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Если тело ответа не JSON или пустое
                errorMessage = `${errorMessage} (статус: ${response.status})`;
            }
            throw new Error(errorMessage);
        }
        // Для DELETE запросов API может возвращать 204 No Content или тело ответа
        if (response.status === 204) {
            return { success: true, message: 'Товар успешно удален' };
        }
        return response.json(); // Если API возвращает тело ответа
    },

    getAllTags: async () => {
        const response = await fetch(`${API_BASE_URL}/tags`);
        if (!response.ok) {
            throw new Error('Не удалось загрузить теги');
        }
        return response.json();
    },

    getAllCategories: async () => {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error('Не удалось загрузить категории');
        }
        return response.json();
    }
};