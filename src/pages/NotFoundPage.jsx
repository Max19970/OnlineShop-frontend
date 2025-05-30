import React from 'react';
import { Link } from 'react-router-dom'; // Импортируем Link для навигации

function NotFoundPage() {
    return (
        <div className="container text-center py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <i className="bi bi-emoji-frown display-1 text-warning mb-4"></i> {/* Иконка Bootstrap */}
                    {/* Или можно использовать более тематическую иконку, например: */}
                    {/* <i className="bi bi-sign-stop display-1 text-danger mb-4"></i> */}
                    {/* <i className="bi bi-binoculars-fill display-1 text-info mb-4"></i> */}


                    <h1 className="display-4 fw-bold mb-3">Ой! Страница не найдена</h1>
                    <p className="lead text-muted mb-4">
                        Похоже, мы не можем найти страницу, которую вы ищете.
                        Возможно, она была перемещена, удалена или вы просто ошиблись в адресе.
                    </p>
                    <p className="mb-4">
                        Не волнуйтесь, вы можете вернуться на главную или попробовать поискать что-то другое.
                    </p>
                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                        <Link to="/" className="btn btn-primary btn-lg px-4 gap-3">
                            <i className="bi bi-house-door-fill me-2"></i>
                            На главную
                        </Link>
                        {/* Можно добавить кнопку для поиска, если у вас есть функционал поиска */}
                        {/*
                        <Link to="/search" className="btn btn-outline-secondary btn-lg px-4">
                            <i className="bi bi-search me-2"></i>
                            Поиск
                        </Link>
                        */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;