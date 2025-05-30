import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext'; // Если понадобится для проверки прав

// Компонент для отображения одной строки товара (можно вынести в отдельный файл, если станет сложным)
const ProductRow = ({ product, onDelete }) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`edit/${product.id}`); // Используем относительный путь
    };

    const handleDelete = async () => {
        if (window.confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
            try {
                await productService.deleteProduct(product.id);
                alert('Товар успешно удален!');
                onDelete(product.id); // Сообщаем родительскому компоненту об удалении
            } catch (error) {
                console.error('Ошибка при удалении товара:', error);
                alert(`Не удалось удалить товар: ${error.message}`);
            }
        }
    };

    return (
        <tr>
            <td>{product.id}</td>
            <td>
                {product.imageUrl && product.imageUrl.length > 0 ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                ) : (
                    <span className="text-muted">Нет фото</span>
                )}
            </td>
            <td>{product.name}</td>
            <td>{product.category || 'N/A'}</td>
            <td>{product.price} {product.currency}</td>
            <td>{product.stockQuantity}</td>
            <td>{product.tags && product.tags.join(', ')}</td>
            <td>
                <button onClick={handleEdit} className="btn btn-sm btn-outline-primary me-2">
                    <i className="bi bi-pencil-fill"></i> Редактировать
                </button>
                <button onClick={handleDelete} className="btn btn-sm btn-outline-danger">
                    <i className="bi bi-trash-fill"></i> Удалить
                </button>
            </td>
        </tr>
    );
};


function ProductListPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // const { user } = useAuth(); // Если нужны проверки на роль пользователя

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await productService.getProducts();
            setProducts(data || []); // Убедимся, что products всегда массив
        } catch (err) {
            console.error("Ошибка загрузки списка товаров:", err);
            setError(err.message || 'Не удалось загрузить список товаров.');
            setProducts([]); // В случае ошибки устанавливаем пустой массив
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleProductDeleted = (deletedProductId) => {
        setProducts(prevProducts => prevProducts.filter(p => p._id !== deletedProductId));
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка товаров...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <h4>Ошибка загрузки товаров!</h4>
                <p>{error}</p>
                <button onClick={fetchProducts} className="btn btn-primary">Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="card shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Список товаров</h5>
                <Link to="new" className="btn btn-success">
                    <i className="bi bi-plus-circle-fill me-2"></i>Добавить товар
                </Link>
            </div>
            <div className="card-body">
                {products.length === 0 && !isLoading && (
                    <div className="text-center py-5">
                        <p className="lead">Товары пока не добавлены.</p>
                        <Link to="new" className="btn btn-primary btn-lg">
                            <i className="bi bi-plus-lg me-2"></i>Создать первый товар
                        </Link>
                    </div>
                )}
                {products.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Фото</th>
                                <th>Название</th>
                                <th>Категория</th>
                                <th>Цена</th>
                                <th>На складе</th>
                                <th>Теги</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map(product => (
                                <ProductRow key={product._id} product={product} onDelete={handleProductDeleted} />
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Можно добавить пагинацию, если товаров много */}
        </div>
    );
}

export default ProductListPage;