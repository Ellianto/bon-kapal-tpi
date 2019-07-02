import React from 'react';
import '../css/App.css';

import Navbar from './Navbar'
import InputForm from './InputForm'
import DataDisplay from './DataDisplay'

export default class App extends React.Component{
    render(){
        return(
            <React.Fragment>
                <Navbar />
                <div className = "container mt-5">
                    <InputForm />
                    <DataDisplay />
                </div>
            </React.Fragment>
        );
    }
}