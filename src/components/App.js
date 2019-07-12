import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

import InputForm from './InputForm'
import DataDisplay from './DataDisplay'
import RecentEntry from './RecentEntry'
import CustomAppBar from './CustomAppBar'

import {Box} from '@material-ui/core';
import { borders, spacing } from '@material-ui/system';

//TODO: Login Page
//TODO: Implement better caching policy
//TODO: Enable offline access

export default class App extends React.Component{
    render(){
        return(
            <Router>
                <CustomAppBar />
                <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                    <Switch>
                        <Route path='/add' component={InputForm} />
                        <Route path='/show' component={DataDisplay} />
                        <Route component={RecentEntry} />
                    </Switch>
                </Box>
            </Router>
        );
    }
}