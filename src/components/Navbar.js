import React from "react";
import '../styles/main.scss'

export default function Navbar() {
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
            </nav>
        </header>
    )
}