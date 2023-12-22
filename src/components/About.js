import React from "react";
import '../styles/main.scss';
import osu_img from "../imgs/osu-img.jpg";

export default function About() {
    return (
        <section className="about-section">
            <div className="about-container">
                <div className="about-content">
                    <div className="education">
                        <h2 className="about-heading">Education</h2>
                        <div className="education-entry">
                            <img className="osu_img" src={osu_img}/>
                            <h3>Oregon State University<br/>
                                B.S. Computer Science</h3>
                        </div>
                    </div>
                    <div className="biography">
                        <h2 className="about-heading">About Me</h2>
                        <div className="biography-entry">
                            <p>loremomaomoagiomomoame foeo easfejsnafjgjnjgaseg <br/>
                               lroemgasun usn uesg uag nseug n n guaseng geunag <br/>
                               sigesamngasoegmie asngimseia  igmi ga im ia i ae.
                               </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}