import React, {useState} from "react";
import '../styles/main.scss'

export default function Navbar() {
    const [handleClick, setHandleClick] = useState(false)

    const click = () => setHandleClick(!handleClick);

    console.log(handleClick)

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
                <button onClick={click} className="hidden-nav-button button-one" aria-controls="primary-navigation" aria-expanded={handleClick}>
                    <svg className="hamburger" viewBox="0 0 100 100" width="100">
                        <rect className="line top" width="80" height="10" x="10" y="25" rx="5"></rect>
                        <rect className="line middle" width="80" height="10" x="10" y="45" rx="5"></rect>
                        <rect className="line bottom" width="80" height="10" x="10" y="65" rx="5"></rect>
                    </svg>
                </button>
            </nav>
        </header>
    )
}