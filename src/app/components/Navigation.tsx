import React from "react";
import Link from "next/link";

export default function Navigation() {
    return (
        <header className="topnav">
            <div className="container topnav-inner">
                <Link className="brand" href="#top">
                    <span className="brand-dot" />
                    <span>eshaan.bajpai</span>
                </Link>
                <nav>
                    <ul className="nav-links">
                        <li><Link href="#work">Work</Link></li>
                        <li><Link href="#play">Playground</Link></li>
                        <li><Link href="#experience">Experience</Link></li>
                        <li><Link href="#says">References</Link></li>
                        <li><Link href="#about">About</Link></li>
                    </ul>
                </nav>
                <Link className="nav-cta" href="#book">Let's connect →</Link>
            </div>
        </header>
    );
}
