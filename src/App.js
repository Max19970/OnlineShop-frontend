import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsListPage from './pages/ProductsListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import OrderDetailsPage from './pages/OrderDetailsPage'; // <-- Импортируем новую страницу
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <Header />
                        <main className="container mt-4" style={{ flex: 1 }}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/products" element={<ProductsListPage />} />
                                <Route path="/product/:productId" element={<ProductDetailsPage />} />
                                <Route path="/cart" element={<CartPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />

                                {/* Защищенные маршруты */}
                                <Route
                                    path="/profile"
                                    element={<ProtectedRoute element={<ProfilePage />} />}
                                />
                                <Route
                                    path="/order-details/:orderId" // <-- Новый маршрут
                                    element={<ProtectedRoute element={<OrderDetailsPage />} />}
                                />
                                <Route
                                    path="/admin/*"
                                    element={
                                        <ProtectedRoute
                                            element={<AdminPage />}
                                            allowedRoles={['admin']}
                                        />
                                    }
                                />
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;