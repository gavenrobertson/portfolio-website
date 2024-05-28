import React, {useState} from "react";
import { Link } from 'react-scroll';
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
                    <li className="nav-menu-item">
                        <Link to="home" smooth={true} duration={50}>
                            Home
                        </Link>
                    </li>
                    <li className="nav-menu-item">
                        <Link to="about" smooth={true} duration={50}>
                            About
                        </Link>
                    </li>
                    <li className="nav-menu-item">
                        <Link to="projects" smooth={true} duration={50}>
                            Projects
                        </Link>
                    </li>
                    <li className="nav-menu-item">
                        <Link to="contact" smooth={true} duration={50}>
                            Contact
                        </Link>
                    </li>
                </ul>
                <div className={`menu-btn ${menuOpen ? 'open' : ''}`} onClick={handleMenuClick}>
                    <div className="menu-btn__burger"></div>
                </div>
            </nav>

            <div className={`mobile-nav ${menuOpen ? 'mobile-open' : 'mobile-closed'}`}>
                <ul className="mobile-nav-list">
                    <li className="nav-menu-item">
                        <Link onClick={handleMenuClick} to="home" smooth={true} duration={50}>
                            Home
                        </Link>
                    </li>
                    <li className="nav-menu-item">
                        <Link onClick={handleMenuClick} to="about" smooth={true} duration={50} offset={-40}>
                            About
                        </Link>
                    </li>
                    <li className="nav-menu-item">
                        <Link onClick={handleMenuClick} to="projects" smooth={true} duration={50} offset={-40}>
                            Projects
                        </Link>
                    </li>
                    <li className="nav-menu-item">
                        <Link onClick={handleMenuClick} to="contact" smooth={true} duration={50}>
                            Contact
                        </Link>
                    </li>
                </ul>
            </div>

        </header>
    )
}