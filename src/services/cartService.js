// Предполагается, что у вас есть базовый URL для вашего API
const API_BASE_URL = 'http://localhost:5000/api/cart'; // Замените на ваш реальный базовый URL API

// Вспомогательная функция для выполнения запросов
async function fetchWithAuth(url, options = {}) {
    const token = options.token || localStorage.getItem('authToken'); // Пример получения токена

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const error = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    // Для DELETE запросов или запросов без тела ответа (204 No Content)
    if (response.status === 204) {
        return null; // или true, или {} в зависимости от того, что ожидается
    }

    return response.json();
}

export const cartService = {
    /**
     * Запрашивает корзину пользователя с сервера.
     * @param {string} userId - ID пользователя.
     * @param {string} token - JWT токен для авторизации.
     * @returns {Promise<{items: Array}>} - Объект с элементами корзины.
     */
    fetchUserCart: async (userId, token) => {
        if (!userId) {
            console.warn("[cartService.fetchUserCart] userId is required.");
            return { items: [] }; // Возвращаем пустую корзину, если нет userId
        }
        console.log(`[cartService.fetchUserCart] Fetching cart for user ${userId}`);
        try {
            // ЗАМЕНИТЕ '/cart' на ваш реальный эндпоинт для получения корзины
            // Метод может быть GET, и userId может передаваться в URL или быть извлечен из токена на бэкенде
            const data = await fetchWithAuth(`${API_BASE_URL}/${userId}`, {
                method: 'GET',
                token: token, // Передаем токен во вспомогательную функцию
            });
            // Убедитесь, что ответ от сервера содержит поле items
            return data && Array.isArray(data.items) ? data : { items: [] };
        } catch (error) {
            console.error(`[cartService.fetchUserCart] Error fetching cart for user ${userId}:`, error);
            // В случае ошибки можно вернуть пустую корзину или пробросить ошибку дальше,
            // чтобы CartContext мог ее обработать
            throw error; // или return { items: [] };
        }
    },

    /**
     * Сохраняет/обновляет корзину пользователя на сервере.
     * @param {string} userId - ID пользователя.
     * @param {Array} items - Массив товаров в корзине.
     * @param {string} token - JWT токен для авторизации.
     * @returns {Promise<any>} - Ответ от сервера (например, обновленная корзина или статус успеха).
     */
    saveUserCart: async (userId, items, token) => {
        if (!userId) {
            console.warn("[cartService.saveUserCart] userId is required.");
            throw new Error("User ID is required to save cart.");
        }
        console.log(`[cartService.saveUserCart] Saving cart for user ${userId}:`, items);
        try {
            // ЗАМЕНИТЕ '/cart' на ваш реальный эндпоинт для сохранения корзины
            // Метод может быть POST или PUT
            const data = await fetchWithAuth(`${API_BASE_URL}/${userId}`, {
                method: 'POST', // или 'PUT'
                token: token,
                body: JSON.stringify({ items }), // Отправляем весь массив товаров
            });
            return data; // Возвращаем ответ сервера
        } catch (error) {
            console.error(`[cartService.saveUserCart] Error saving cart for user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Очищает корзину пользователя на сервере.
     * Может быть реализовано через saveUserCart с пустым массивом items,
     * или через отдельный эндпоинт, если он есть.
     * @param {string} userId - ID пользователя.
     * @param {string} token - JWT токен для авторизации.
     * @returns {Promise<any>} - Ответ от сервера.
     */
    clearUserCart: async (userId, token) => {
        if (!userId) {
            console.warn("[cartService.clearUserCart] userId is required.");
            throw new Error("User ID is required to clear cart.");
        }
        console.log(`[cartService.clearUserCart] Clearing cart for user ${userId}`);
        try {
            // Вариант 1: Использовать saveUserCart
            return await cartService.saveUserCart(userId, [], token);

            // Вариант 2: Если у вас есть специальный эндпоинт для очистки (например, DELETE /api/cart/{userId})
            /*
            const data = await fetchWithAuth(`${API_BASE_URL}/cart/${userId}`, {
                method: 'DELETE',
                token: token,
            });
            return data; // или return null; если ответ пустой (204 No Content)
            */
        } catch (error) {
            console.error(`[cartService.clearUserCart] Error clearing cart for user ${userId}:`, error);
            throw error;
        }
    },
};

// Можно также экспортировать по умолчанию, если это единственный экспорт
// export default cartService;