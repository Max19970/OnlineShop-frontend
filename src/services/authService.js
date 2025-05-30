// TODO: Заменить URL на актуальный адрес вашего API
const API_BASE_URL = 'http://localhost:5000/api/auth';

export const authService = {
    login: async (credentials) => {
        // Пример интеграции с реальным API:
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка входа');
        }
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        return data;
        // console.warn('Метод login еще не реализован для боевого API');
        // return Promise.reject(new Error('Метод login не реализован для боевого API'));
    },

    register: async (userData) => {
        // Пример интеграции с реальным API:
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка регистрации');
        }
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        return data;
        // console.warn('Метод register еще не реализован для боевого API');
        // return Promise.reject(new Error('Метод register не реализован для боевого API'));
    },

    logout: async () => {
        // На клиенте просто удаляем токен и данные пользователя.
        // На сервере может быть эндпоинт для инвалидации токена.
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        console.info('Пользователь вышел из системы (localStorage очищен)');
        return Promise.resolve();
    },

    loadUserFromStorage: () => {
        // Эта логика остается в основном клиентской,
        // но может потребоваться валидация токена на сервере при необходимости.
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (token && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                // TODO: Добавить логику валидации токена, если это необходимо
                // Например, можно сделать запрос к API для проверки актуальности токена
                // или просто проверять срок его действия, если он есть в токене.
                // Пока что, для примера, будем считать токен валидным, если он есть.
                return { user, token };
            } catch (error) {
                console.error("Ошибка загрузки пользователя из localStorage:", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                return null;
            }
        }
        return null;
    },

    updateDeliveryAddress: async (userId, address) => {
        // Пример интеграции с реальным API:
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${userId}/address`, {
          method: 'PUT', // или PATCH
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ deliveryAddress: address }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка обновления адреса доставки');
        }
        const updatedUserData = await response.json();
        localStorage.setItem('authUser', JSON.stringify(updatedUserData.user));
        // Если API возвращает новый токен, его тоже нужно обновить
        if (updatedUserData.token) {
           localStorage.setItem('authToken', updatedUserData.token);
        }
        return updatedUserData;
        // console.warn('Метод updateDeliveryAddress еще не реализован для боевого API');
        // return Promise.reject(new Error('Метод updateDeliveryAddress не реализован для боевого API'));
    },

    updateUserProfile: async (userId, profileData) => {
        // Пример интеграции с реальным API:
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
          method: 'PUT', // или PATCH
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка обновления профиля');
        }
        const updatedUserData = await response.json();
        localStorage.setItem('authUser', JSON.stringify(updatedUserData.user));
        // Если API возвращает новый токен, его тоже нужно обновить
        if (updatedUserData.token) {
           localStorage.setItem('authToken', updatedUserData.token);
        }
        return updatedUserData;
        // console.warn('Метод updateUserProfile еще не реализован для боевого API');
        // return Promise.reject(new Error('Метод updateUserProfile не реализован для боевого API'));
    }
};