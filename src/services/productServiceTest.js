// Имитация задержки сети
const networkDelay = (ms) => new Promise(res => setTimeout(res, ms));

// "База данных" товаров
const sampleProducts = [
    {
        id: '1',
        name: 'Смартфон "Фотон X"',
        description: 'Новейший смартфон с передовыми технологиями камеры и производительности. Большой OLED экран, тройная камера 48МП и быстрая зарядка.',
        price: 79990,
        imageUrl: 'https://via.placeholder.com/400x300/FFC107/000000?Text=Smartphone+Photon+X',
        tags: ['electronics', 'smartphone', 'new', 'camera', 'oled'],
        category: 'Смартфоны',
        stock: 15,
        rating: 4.8,
        reviews: 120,
    },
    {
        id: '2',
        name: 'Ноутбук "Орбита Про 16"',
        description: 'Мощный и легкий ноутбук для профессионалов и творческих задач. Процессор Intel Core i7, 16 ГБ ОЗУ, SSD 512 ГБ.',
        price: 129900,
        imageUrl: 'https://via.placeholder.com/400x300/0DCAF0/FFFFFF?Text=Laptop+Orbita+Pro',
        tags: ['electronics', 'laptop', 'professional', 'powerful', 'intel'],
        category: 'Ноутбуки',
        stock: 8,
        rating: 4.9,
        reviews: 85,
    },
    {
        id: '3',
        name: 'Беспроводные наушники "АудиоСфера"',
        description: 'Кристально чистый звук, активное шумоподавление и комфорт на весь день. До 30 часов работы.',
        price: 19950,
        imageUrl: 'https://via.placeholder.com/400x300/6F42C1/FFFFFF?Text=Headphones+AudioSphere',
        tags: ['electronics', 'audio', 'headphones', 'wireless', 'noise-cancelling'],
        category: 'Аудиотехника',
        stock: 25,
        rating: 4.6,
        reviews: 210,
    },
    {
        id: '4',
        name: 'Умные часы "Хронос 2"',
        description: 'Следите за своим здоровьем, активностью и оставайтесь на связи. Встроенный GPS, NFC, мониторинг сна.',
        price: 24900,
        imageUrl: 'https://via.placeholder.com/400x300/198754/FFFFFF?Text=Smartwatch+Chronos+2',
        tags: ['electronics', 'wearable', 'smartwatch', 'health', 'gps', 'nfc'],
        category: 'Носимая электроника',
        stock: 12,
        rating: 4.5,
        reviews: 150,
    },
    {
        id: '5',
        name: 'Планшет "Таблет Z10"',
        description: 'Универсальный 10-дюймовый планшет для работы, учебы и развлечений. Яркий экран, долгое время работы.',
        price: 45000,
        imageUrl: 'https://via.placeholder.com/400x300/DC3545/FFFFFF?Text=Tablet+Z10',
        tags: ['electronics', 'tablet', 'entertainment', '10-inch'],
        category: 'Планшеты',
        stock: 20,
        rating: 4.4,
        reviews: 95,
    },
    {
        id: '6',
        name: 'Игровая консоль "ГеймМастер 5"',
        description: 'Погрузитесь в мир игр нового поколения с потрясающей графикой и скоростью. Поддержка 4K HDR.',
        price: 59990,
        imageUrl: 'https://via.placeholder.com/400x300/FD7E14/000000?Text=GameMaster+5',
        tags: ['electronics', 'gaming', 'console', 'entertainment', 'new', '4k'],
        category: 'Игровые консоли',
        stock: 7,
        rating: 4.9,
        reviews: 180,
    },
    {
        id: '7',
        name: 'Фотоаппарат "ПроПиксел M2"',
        description: 'Профессиональное качество снимков для энтузиастов и начинающих фотографов. Сменный объектив.',
        price: 99900,
        imageUrl: 'https://via.placeholder.com/400x300/20C997/000000?Text=Camera+ProPixel+M2',
        tags: ['electronics', 'camera', 'photography', 'professional', 'mirrorless'],
        category: 'Фототехника',
        stock: 5,
        rating: 4.7,
        reviews: 60,
    },
    {
        id: '8',
        name: 'Портативная колонка "БасБуст Мини"',
        description: 'Мощный звук в компактном корпусе, бери музыку с собой. Защита от воды IPX7.',
        price: 8990,
        imageUrl: 'https://via.placeholder.com/400x300/6610F2/FFFFFF?Text=Speaker+BassBoost+Mini',
        tags: ['electronics', 'audio', 'speaker', 'portable', 'bluetooth', 'waterproof'],
        category: 'Аудиотехника',
        stock: 30,
        rating: 4.5,
        reviews: 110,
    }
];

export const productServiceTest = {
    getProducts: async () => {
        await networkDelay(700);
        return JSON.parse(JSON.stringify(sampleProducts));
    },

    getProductById: async (id) => {
        await networkDelay(400);
        const product = sampleProducts.find(p => p.id === id);
        if (product) {
            return JSON.parse(JSON.stringify(product));
        }
        return null;
    },

    getAllTags: async () => {
        await networkDelay(100);
        const allTags = new Set();
        sampleProducts.forEach(product => {
            product.tags.forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags).sort();
    },

    // Новая функция для получения всех уникальных категорий
    getAllCategories: async () => {
        await networkDelay(100);
        const allCategories = new Set();
        sampleProducts.forEach(product => {
            if (product.category) { // Убедимся, что категория есть
                allCategories.add(product.category);
            }
        });
        return Array.from(allCategories).sort();
    }
};