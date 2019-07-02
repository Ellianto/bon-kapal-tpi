import React from 'react'

export default class NavBar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-expand-md bg-primary navbar-dark">
                <h3 className="navbar-brand"> Bon Kapal TPI </h3>

                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="collapsibleNavbar">
                    <ul className="navbar-nav">
                        <li className="nav-item mx-md-3 mx-auto">
                            <a className="nav-link" href="#inputField"> <strong> Input Data </strong> </a>
                        </li>
                        <li className="nav-item mx-md-3 mx-auto">
                            <a className="nav-link" href="#dataDisplay"> <strong> Tampilkan Data </strong> </a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}
