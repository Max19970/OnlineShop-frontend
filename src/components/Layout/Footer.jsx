import React from 'react';

function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer mt-auto py-3 bg-light">
            <div className="container text-center">
                <span className="text-muted">© {currentYear} ТехноМарт. Все права защищены.</span>
            </div>
        </footer>
    );
}

export default Footer;