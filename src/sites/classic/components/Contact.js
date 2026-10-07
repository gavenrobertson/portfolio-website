import React, {useCallback} from "react";
import '../styles/main.scss';
import useIntersectionObserver from "../hooks/useIntersectionObserver";

export default function Contact() {
    const handleIntersect = useCallback((entry, isVisible) => {
        if (isVisible) {
            entry.target.classList.add('show');
        }
    }, []);

    // Use the custom hook
    const elementsRef = useIntersectionObserver(handleIntersect, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    return (
        <section id="sections" className="contact-section">
            <span id="contact" className="anchor"/>
            <div className="contact-container">
                <div className="contact-information-container">
                    <h2 ref={(el) => (elementsRef.current[0] = el)} className="contact-header hidden">Contact Me 🤳</h2>
                    <div className="contact-center">
                        <div className="location-container">
                            <div ref={(el) => (elementsRef.current[1] = el)} className="location-information hidden">
                                <h3 className="info-header">Location 🗺️</h3>
                                <p className="info-des">Oregon, USA</p>
                            </div>
                        </div>
                        <div ref={(el) => (elementsRef.current[2] = el)} className="email-container hidden">
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