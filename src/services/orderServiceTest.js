// Имитация задержки сети
const networkDelay = (ms) => new Promise(res => setTimeout(res, ms));

export const orderServiceTest = {
    /**
     * Имитирует создание заказа.
     * @param {object} userData - Данные пользователя (например, id, email, deliveryAddress).
     * @param {Array<object>} cartItems - Массив товаров в корзине.
     * @param {number} totalAmount - Общая сумма заказа.
     * @returns {Promise<object>} - Промис, который разрешается с объектом созданного заказа.
     */
    createOrder: async (userData, cartItems, totalAmount) => {
        await networkDelay(1500); // Имитация запроса к серверу

        console.log('Order Service: Creating order for user:', userData);
        console.log('Order Service: Cart items:', cartItems);
        console.log('Order Service: Total amount:', totalAmount);

        // Имитация возможной ошибки (например, если какой-то товар закончился на складе)
        // Для демонстрации, можно раскомментировать:
        // if (Math.random() > 0.8) {
        //     console.error('Order Service: Failed to create order - simulated error.');
        //     throw new Error('Не удалось обработать заказ. Пожалуйста, попробуйте позже.');
        // }

        // Имитация ответа от сервера
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const orderDetails = {
            orderId,
            userId: userData.id,
            userEmail: userData.email, // Предполагаем, что email есть в userData
            items: cartItems.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                pricePerUnit: item.price,
            })),
            totalAmount,
            deliveryAddress: userData.deliveryAddress,
            status: 'pending', // Начальный статус заказа
            createdAt: new Date().toISOString(),
        };

        console.log('Order Service: Order created successfully:', orderDetails);
        return orderDetails;
    },
};