import React, {useCallback} from "react";
import '../styles/main.scss';
import campus_image from "../imgs/campus.webp";
import UseIntersectionObserver from "../hooks/useIntersectionObserver";
import {isVisible} from "@testing-library/user-event/dist/utils";
import useIntersectionObserver from "../hooks/useIntersectionObserver";



export default function About() {
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
        <section className="about-section">
            <a id="about" className="anchor"/>
            <div className="about-container">
                <h2 ref={(el) => (elementsRef.current[0] = el)} className="about-title hidden">About Me 🧑🏻</h2>
                <div className="about-content">
                    <div ref={(el) => (elementsRef.current[1] = el)} className="img-container hidden">
                        <img className="programmer-svg" src={campus_image} alt="programmer logo"/>
                    </div>
                    <div className="biography">
                        <div className="biography-entry">
                            <h3 ref={(el) => (elementsRef.current[2] = el)} className="biography-h2 hidden">Web Developer based in <br/>
                                <span className="biography-h2-span">Oregon, USA📍</span>
                            </h3>
                            <p ref={(el) => (elementsRef.current[3] = el)} className="biography-p hidden">I am a recent Computer Science Graduate from
                                Oregon State University. During my time at
                                university I found my passion in Web
                                Development and since then I have strived to develop
                                engaging, responsive, and quality web applications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}