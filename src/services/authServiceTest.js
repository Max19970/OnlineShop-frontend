// Имитация задержки сети
const networkDelay = (ms) => new Promise(res => setTimeout(res, ms));

// "База данных" пользователей (в реальном приложении это будет на сервере)
const users = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'password123', // В реальном приложении пароли должны быть хешированы!
    name: 'Тестовый Пользователь',
    role: 'customer',
    deliveryAddress: 'г. Москва, ул. Примерная, д. 1, кв. 2',
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'adminpassword',
    name: 'Администратор Сайта',
    role: 'admin',
    deliveryAddress: null,
  },
];

// Функция для "генерации" псевдо-JWT токена
const generatePseudoToken = (user) => {
  const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
  if (user.deliveryAddress !== undefined) {
    payload.deliveryAddress = user.deliveryAddress;
  }
  const stringToEncode = JSON.stringify(payload);
  const encodedString = btoa(unescape(encodeURIComponent(stringToEncode)));
  return `pseudo-jwt-token.${encodedString.replace(/=/g, '')}.${Date.now() + 3600000}`;
};

export const authServiceTest = {
  login: async (credentials) => {
    await networkDelay(1000);
    const { email, password } = credentials;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      const token = generatePseudoToken(userWithoutPassword);
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
      return { user: userWithoutPassword, token };
    } else {
      throw new Error('Неверный email или пароль');
    }
  },

  register: async (userData) => {
    await networkDelay(1500);
    const { email, password, name } = userData;

    if (users.find(u => u.email === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const newUser = {
      id: String(Date.now()),
      email,
      password,
      name,
      role: 'customer',
      deliveryAddress: null,
    };
    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    const token = generatePseudoToken(userWithoutPassword);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
    console.log('Registered users:', users);
    return { user: userWithoutPassword, token };
  },

  logout: async () => {
    await networkDelay(500);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  loadUserFromStorage: () => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const expiry = parseInt(tokenParts[2], 10);
          if (expiry > Date.now()) {
            const fullUser = { ...user, deliveryAddress: user.deliveryAddress !== undefined ? user.deliveryAddress : null };
            return { user: fullUser, token };
          } else {
            console.warn('Токен истек');
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            return null;
          }
        }
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
    await networkDelay(700);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].deliveryAddress = address;
      const { password, ...userWithoutPassword } = users[userIndex];

      const newToken = generatePseudoToken(userWithoutPassword);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));

      return { user: userWithoutPassword, token: newToken };
    }
    throw new Error('Пользователь не найден для обновления адреса');
  },

  updateUserProfile: async (userId, profileData) => {
    await networkDelay(800);
    const { name, email } = profileData;

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Пользователь не найден для обновления профиля');
    }

    // Проверка на уникальность email, если он был изменен
    if (email && email !== users[userIndex].email) {
      if (users.some(u => u.email === email && u.id !== userId)) {
        throw new Error('Этот email уже используется другим пользователем.');
      }
      users[userIndex].email = email;
    }

    if (name) {
      users[userIndex].name = name;
    }

    const { password, ...userWithoutPassword } = users[userIndex];
    const newToken = generatePseudoToken(userWithoutPassword);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));

    return { user: userWithoutPassword, token: newToken };
  }
};