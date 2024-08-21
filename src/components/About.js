import React from "react";
import '../styles/main.scss';
import campus_image from "../imgs/campus.webp";

export default function About() {
    return (
        <section className="about-section">
            <a id="about" className="anchor"/>
            <div className="about-container">
                <h2 className="about-title">About Me 🧑🏻</h2>
                <div className="about-content">
                    <div className="img-container">
                        <img className="programmer-svg" src={campus_image} alt="programmer logo"/>
                    </div>
                    <div className="biography">
                        <div className="biography-entry">
                            <h3 className="biography-h2">Web Developer based in <br/>
                                <span className="biography-h2-span">Oregon, USA📍</span>
                            </h3>
                            <p className="biography-p">I am a recent Computer Science Graduate from
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