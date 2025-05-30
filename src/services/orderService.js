// TODO: Заменить URL на актуальный адрес вашего API
import {productService} from "./productService";

const API_BASE_URL = 'http://localhost:5000/api/orders';

export const orderService = {
    createOrder: async (orderPayload) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderPayload),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка при создании заказа');
        }
        return response.json();
    },

    getUserOrders: async (userId) => {
        if (!userId) {
            console.warn("[orderService.getUserOrders] userId is required.");
            return [];
        }
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Пользователь не авторизован');
        }

        console.log(`[orderService.getUserOrders] Fetching orders for user ${userId}`);
        // ВАЖНО: Если API ожидает ID пользователя в URL, то должно быть /user/${userId}
        // Если API определяет пользователя по токену и ожидает просто /user, то текущий вариант /user корректен.
        // Проверьте документацию вашего API. Для примера оставлю /user, предполагая, что сервер идентифицирует пользователя по токену.
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error(`[orderService.getUserOrders] Failed to fetch orders for user ${userId}:`, errorData);
            throw new Error(errorData.message || 'Не удалось загрузить историю заказов');
        }
        const data = await response.json();
        console.log(`[orderService.getUserOrders] Received orders for user ${userId}:`, data);
        return Array.isArray(data) ? data : (data.orders || []);
    },

    /**
     * Получает детали конкретного заказа по его ID.
     * @param {string} orderId - ID заказа.
     * @returns {Promise<Object>} - Объект с деталями заказа.
     */
    getOrderDetails: async (orderId) => {
        if (!orderId) {
            console.warn("[orderService.getOrderDetails] orderId is required.");
            throw new Error('Не указан ID заказа');
        }
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Пользователь не авторизован');
        }

        console.log(`[orderService.getOrderDetails] Fetching details for order ${orderId}`);
        const response = await fetch(`${API_BASE_URL}/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error(`[orderService.getOrderDetails] Failed to fetch order details for ${orderId}:`, errorData);
            throw new Error(errorData.message || 'Не удалось загрузить детали заказа');
        }
        const data = await response.json();
        //const dataItems = [];
        data.items.forEach(item => {productService.getProductById(item.id)
            .then(product => {data.items[data.items.indexOf(item)].imageUrl = product.imageUrl})
            .catch(error => console.error(error));
        });
        //data.items = dataItems;
        console.log(`[orderService.getOrderDetails] Received details for order ${orderId}:`, data);
        return data; // Предполагаем, что API возвращает объект заказа
    }
};