import React from 'react';

import Navbar from './Navbar'
import InputForm from './InputForm'
import DataDisplay from './DataDisplay'

//TODO: Use Material UI Components

export default class App extends React.Component{
    render(){
        return(
            <React.Fragment>
                <Navbar />
                <div className = "container mt-5">
                    <DataDisplay />
                    <InputForm />
                </div>
            </React.Fragment>
        );
    }
}