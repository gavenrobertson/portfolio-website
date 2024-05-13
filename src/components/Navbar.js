import React, {useState} from "react";
import '../styles/main.scss'

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);

    const handleMenuClick = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header>
            <nav className="nav">
                <h3 className="nav-logo-header">gaven robertson</h3>
                <ul className="nav-list">
                    <li className="nav-menu-item">Home</li>
                    <li className="nav-menu-item">About</li>
                    <li className="nav-menu-item">Projects</li>
                    <li className="nav-menu-item">Contact</li>
                </ul>
                <div className={`menu-btn ${menuOpen ? 'open' : ''}`} onClick={handleMenuClick}>
                    <div className="menu-btn__burger"></div>
                </div>
            </nav>

            <div className={`mobile-nav ${menuOpen ? 'mobile-open' : 'mobile-closed'}`}>
                <ul className="mobile-nav-list">
                    <li className="mobile-nav-menu-item">Home</li>
                    <li className="mobile-nav-menu-item">About</li>
                    <li className="mobile-nav-menu-item">Projects</li>
                    <li className="mobile-nav-menu-item">Contact</li>
                </ul>
            </div>

        </header>
    )
}