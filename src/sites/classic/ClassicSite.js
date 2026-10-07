import Home from "./components/Home";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

// The original gavenrobertson.dev site, reachable through the portal in the bottom-right corner.
export default function ClassicSite() {
    return (
        <div className="classic-site">
            <Navbar/>
            <Home/>
            <About/>
            <Projects/>
            <Contact/>
            <Footer/>
        </div>
    );
}
