import React from "react";
import '../styles/main.scss';

export default function Contact() {
    return ( 
    <section id="contact" className="contact-section">
        <div className="contact-container">
            <div className="contact-information-container">
                <h2 className="contact-header">Contact Me 🤳</h2>
                    <div className="contact-center">
                        <div className="location-container">
                            <div className="location-information">
                                <h3 className="info-header">Location 🗺️</h3>
                                <p className="info-des">Oregon, USA</p>
                            </div>
                        </div>
                        <div className="email-container">
                            <div className="email-information">
                                <h3 className="info-header">Email ✉️</h3>
                                <p className="info-des">gaven.robertson@gmail.com</p>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </section> 
    )
}