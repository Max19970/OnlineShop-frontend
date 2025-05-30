import React, { createContext, useReducer, useContext, useEffect, useRef } from 'react';
import { useAuthState } from './AuthContext';
import {cartService} from "../services/cartService";
import {productService} from "../services/productService"; // Предполагается, что AuthContext.js в той же директории

const CartStateContext = createContext(undefined);
const CartDispatchContext = createContext(undefined);

const GUEST_CART_STORAGE_KEY = 'guestShoppingCart';

// TODO: Создайте cartService.js для взаимодействия с API корзины вашего бэкенда
// Примерные функции, которые понадобятся в cartService.js:
// const cartService = {
//   fetchUserCart: async (userId, token) => { /* ...логика запроса к API... */ return { items: [] }; },
//   saveUserCart: async (userId, items, token) => { /* ...логика запроса к API... */ return true; },
// };
// Вместо реальных вызовов cartService, я буду использовать заглушки и комментарии.

// Загрузка гостевой корзины из localStorage
const loadGuestCartFromStorage = () => {
    try {
        const serializedState = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (serializedState === null) {
            return { items: [] };
        }
        const storedCart = JSON.parse(serializedState);
        return { items: storedCart.items || [] };
    } catch (e) {
        console.warn("Could not load guest cart from localStorage", e);
        return { items: [] };
    }
};

const initialState = {
    items: [], // Начальное состояние всегда пустое, загрузка произойдет в useEffect
    isLoading: true, // Флаг для отслеживания загрузки корзины
    error: null,
};

function cartReducer(state, action) {
    switch (action.type) {
        case 'CART_OPERATION_START':
            return { ...state, isLoading: true, error: null };
        case 'CART_OPERATION_SUCCESS': // Общий успех для операций, которые не меняют items напрямую (например, сохранение)
            return { ...state, isLoading: false, error: null };
        case 'CART_OPERATION_FAILURE':
            return { ...state, isLoading: false, error: action.payload.error };
        case 'SET_CART_ITEMS':
            return { ...state, items: action.payload.items, isLoading: false, error: null };
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(
                (item) => item.id === action.payload.product.id
            );
            let newItems;
            if (existingItemIndex > -1) {
                newItems = state.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + action.payload.quantity }
                        : item
                );
            } else {
                newItems = [...state.items, { ...action.payload.product, quantity: action.payload.quantity }];
            }
            return { ...state, items: newItems };
        }
        case 'UPDATE_QUANTITY': {
            const newItems = state.items.map(item =>
                item.id === action.payload.productId
                    ? { ...item, quantity: Math.max(0, action.payload.quantity) }
                    : item
            ).filter(item => item.quantity > 0);
            return { ...state, items: newItems };
        }
        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(item => item.id !== action.payload.productId);
            return { ...state, items: newItems };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] }; // isLoading и error не меняем, это просто очистка локального состояния
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

// Функция для мержа (объединения) корзин
function mergeCarts(serverItems, guestItems) {
    const merged = [...serverItems];
    guestItems.forEach(guestItem => {
        const existingItemIndex = merged.findIndex(item => item.id === guestItem.id);
        if (existingItemIndex > -1) {
            merged[existingItemIndex] = {
                ...merged[existingItemIndex],
                quantity: merged[existingItemIndex].quantity + guestItem.quantity,
            };
        } else {
            merged.push(guestItem);
        }
    });
    return merged;
}


export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { isAuthenticated, user, token, isLoading: authIsLoading } = useAuthState();
    const prevIsAuthenticatedRef = useRef(isAuthenticated);

    // Effect 1: Загрузка корзины при инициализации и при изменении статуса аутентификации (логин/логаут)
    useEffect(() => {
        if (authIsLoading) {
            // Ждем, пока AuthContext определит статус пользователя
            return;
        }

        const currentIsAuthenticated = isAuthenticated;
        const previousIsAuthenticated = prevIsAuthenticatedRef.current;

        const initializeCart = async () => {
            dispatch({ type: 'CART_OPERATION_START' });
            try {
                if (currentIsAuthenticated && user && token) {
                    // Пользователь АВТОРИЗОВАН
                    console.log('[CartContext] User is authenticated. User ID:', user.id);
                    // Пытаемся загрузить корзину с сервера
                    let serverCart = await cartService.fetchUserCart(user.id, token);
                    //const serverCart = { items: [] }; // ЗАГЛУШКА

                    let serverCartItems = [];
                    serverCart.items.forEach(item => {productService.getProductById(item.id)
                        .then(product => {
                            serverCartItems.push({...product, quantity: item.quantity})
                        })
                        .catch(err => console.error(err))
                    });
                    console.log('[CartContext] Server cart items:', serverCartItems);
                    console.log('[CartContext] Server cart items:', serverCart.items.map(item => {
                        return {
                            ...item,
                        }
                    }))

                    serverCart = { items: serverCartItems }

                    console.log('[CartContext] Fetched server cart (simulated):', serverCart);


                    if (!previousIsAuthenticated && currentIsAuthenticated) { // Это сценарий ЛОГИНА
                        console.log('[CartContext] Login detected.');
                        const guestCart = loadGuestCartFromStorage();
                        console.log('[CartContext] Guest cart from localStorage:', guestCart);

                        if (guestCart.items.length > 0) {
                            const mergedItems = mergeCarts(serverCart.items, guestCart.items);
                            console.log('[CartContext] Merged cart:', mergedItems);
                            await cartService.saveUserCart(user.id, mergedItems, token);
                            console.log('[CartContext] Saved merged cart to server (simulated).');
                            dispatch({ type: 'SET_CART_ITEMS', payload: { items: mergedItems } });
                            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
                            console.log('[CartContext] Guest cart cleared from localStorage.');
                        } else {
                            dispatch({ type: 'SET_CART_ITEMS', payload: { items: serverCart.items } });
                        }
                    } else {
                        // Обычная загрузка для уже авторизованного пользователя (например, обновление страницы)
                        dispatch({ type: 'SET_CART_ITEMS', payload: { items: serverCart.items } });
                    }
                } else {
                    // Пользователь НЕ АВТОРИЗОВАН (гость)
                    console.log('[CartContext] User is a guest.');
                    if (previousIsAuthenticated && !currentIsAuthenticated) { // Это сценарий ЛОГАУТА
                        console.log('[CartContext] Logout detected. Clearing cart state.');
                        dispatch({ type: 'CLEAR_CART' }); // Очищаем состояние. Эффект сохранения ниже запишет пустую корзину в localStorage.
                    } else {
                        // Гость (первичная загрузка или уже гость)
                        const guestCart = loadGuestCartFromStorage();
                        console.log('[CartContext] Loaded guest cart from localStorage:', guestCart);
                        dispatch({ type: 'SET_CART_ITEMS', payload: { items: guestCart.items } });
                    }
                }
            } catch (error) {
                console.error("[CartContext] Error during cart initialization/auth change:", error);
                dispatch({ type: 'CART_OPERATION_FAILURE', payload: { error: error.message || 'Failed to initialize cart' } });
            }
        };

        initializeCart();
        prevIsAuthenticatedRef.current = currentIsAuthenticated;

    }, [isAuthenticated, user, token, authIsLoading, dispatch]);


    // Effect 2: Сохранение изменений корзины в localStorage (для гостей) или на сервере (для авторизованных)
    useEffect(() => {
        if (authIsLoading || state.isLoading) {
            // Не сохраняем, если идет процесс аутентификации или другая операция с корзиной
            return;
        }

        // Этот флаг нужен, чтобы избежать сохранения при самой первой установке state.items из Effect 1.
        // Мы хотим сохранять только "настоящие" изменения от пользователя или после мержа.
        if (initialState.items === state.items && state.items.length === 0 && !prevIsAuthenticatedRef.current && !isAuthenticated) {
            // Пропускаем начальное сохранение пустой корзины для гостя, если она и так была пуста
            return;
        }


        if (isAuthenticated && user && token) {
            // Авторизованный пользователь: сохраняем на сервер
            // Проверяем, что state.items не является начальным пустым массивом,
            // который мог быть установлен до загрузки настоящей корзины.
            if(state.items !== initialState.items) {
                console.log('[CartContext] Auth user: Saving cart to server (simulated):', state.items);
                cartService.saveUserCart(user.id, state.items, token)
                   .then(() => console.log('[CartContext] Cart saved to server successfully.'))
                   .catch(err => console.error('[CartContext] Failed to save cart to server:', err));
            }
        } else {
            // Гость: сохраняем в localStorage
            console.log('[CartContext] Guest user: Saving cart to localStorage:', state.items);
            localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify({ items: state.items }));
        }
    }, [state.items, isAuthenticated, user, token, authIsLoading, state.isLoading]);


    // Действия, которые можно вызывать
    const addItem = (product, quantity = 1) => {
        dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    };

    const updateQuantity = (productId, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    };

    const removeItem = (productId) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
    };

    const clearCart = async () => {
        // Для авторизованного пользователя можно добавить очистку на сервере
        if (isAuthenticated && user && token) {
            dispatch({ type: 'CART_OPERATION_START' });
            try {
                await cartService.saveUserCart(user.id, [], token);
                console.log('[CartContext] Cleared cart on server (simulated).');
                dispatch({ type: 'CLEAR_CART' }); // Очищаем локальное состояние
                dispatch({ type: 'CART_OPERATION_SUCCESS' });
            } catch (error) {
                console.error("[CartContext] Failed to clear cart on server:", error);
                dispatch({ type: 'CART_OPERATION_FAILURE', payload: { error: error.message || 'Failed to clear server cart' } });
            }
        } else {
            dispatch({ type: 'CLEAR_CART' }); // Для гостя просто очищаем локальное состояние, Effect 2 сохранит в localStorage
        }
    };

    return (
        <CartStateContext.Provider value={state}>
            <CartDispatchContext.Provider value={{ addItem, updateQuantity, removeItem, clearCart, dispatch }}>
                {children}
            </CartDispatchContext.Provider>
        </CartStateContext.Provider>
    );
}

export function useCartState() {
    const context = useContext(CartStateContext);
    if (context === undefined) {
        throw new Error('useCartState must be used within a CartProvider');
    }
    return context;
}

export function useCartDispatch() {
    const context = useContext(CartDispatchContext);
    if (context === undefined) {
        throw new Error('useCartDispatch must be used within a CartProvider');
    }
    return context;
}
