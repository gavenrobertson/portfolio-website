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
                            <p>I am recent Computer Science Graduate and have spent the last four years studying and further my knowledge in Computer Science.
                                I found Web Development early on in University and became so interested in design and the overall complex problems that could occur.
                                Since then I have gotten the opportunity to work in several project teams on campus and even had the opportunity to work in Hanoi, Vietnam as a Front-end Engineer Intern.
                                I beyond excited to start the next steps in my career and contribute to a team equally as passionate!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}