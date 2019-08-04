import React from 'react';
import {Redirect, Route, Switch, withRouter } from 'react-router-dom';

import { Box, Button, Snackbar, SnackbarContent, Fade, LinearProgress, AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import { Home, MobileOff } from '@material-ui/icons';

import { fireAuth } from '../firebase';

import AddShip from './AddShip';
import DataDisplay from './DataDisplay';
import HomePage from './HomePage';
import InputForm from './InputForm';
import LoginPage from './LoginPage';
import MakeBook from './MakeBook';
import RecentEntry from './RecentEntry';

class App extends React.Component{
    constructor(){
        super();

        this.handleSnackBarClose = this.handleSnackBarClose.bind(this);

        this.state = {
            isLoading : false,
            snackBarOpen : false,
            snackBarMessage : '',
            user : null,
        }

        this.openSnackBar = (message, reload = false) => {
            this.setState({
                snackBarOpen : true,
                snackBarMessage : message,
                isLoading: false,
            });

            if(reload){
                setTimeout(() => window.location.reload(), 2500);
            }
        }

        this.showProgressBar = () => {
            this.setState({
                isLoading: true,
            });
        }

        this.closeProgressBar = () => {
            this.setState({
                isLoading: false,
            });
        }
    }

    componentDidMount(){
        fireAuth.onAuthStateChanged((user) => {
            if(user){
                this.setState({
                    user : user,
                    isLoading : false,
                }); 
            } else {
                this.setState({
                    user : null,
                });
            }
        })
    }

    handleSnackBarClose(event, reason) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({
            snackBarMessage: '',
            snackBarOpen: false,
        });
    }

    render(){
        return(
            <React.Fragment>
                <div style={{ flexGrow: 1 }}>
                    <AppBar>
                        <Toolbar>
                            {
                                this.state.user ?
                                <IconButton size='medium' color='secondary' edge='start' onClick={() => fireAuth.signOut()}>
                                    <MobileOff />
                                </IconButton>
                                :
                                <IconButton disabled color='inherit' size='medium' edge='start' style={{ padding: 24 }} />
                        }
                        <Typography variant='h5' align='center' style={{ flexGrow: 1 }}>
                                Bon Kapal
                        </Typography>
                            {
                                this.state.user ?
                                    <IconButton size='medium' color='secondary' edge='end' onClick={(e) => { this.props.history.push('/home'); }}> <Home /> </IconButton>
                                :
                                <IconButton disabled color='inherit' size='medium' edge='end' style={{ padding: 24 }} />
                            }
                        </Toolbar>
                        <Fade in={this.state.isLoading} style={{ transitionDelay: this.state.isLoading ? '500ms' : '0ms' }}>
                            <LinearProgress color='secondary' />
                        </Fade>
                    </AppBar>
                </div>
                <Snackbar
                    autoHideDuration={2000}
                    key={this.state.snackBarMessage}
                    open={this.state.snackBarOpen}
                    onClose={this.handleSnackBarClose}
                    ContentProps={{ 'aria-describedby': 'message' }}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <SnackbarContent
                        key={this.state.snackBarMessage}
                        message={<span id='message'> {this.state.snackBarMessage} </span>}
                        action={[<Button key='close' size='small' color='secondary' onClick={this.handleSnackBarClose}> TUTUP </Button>]}
                    />
                </Snackbar>
                <Box marginTop={12}/>
                <Switch>
                    {
                        this.state.user ? 
                        <React.Fragment>
                            <Route exact path='/home'       render={props => <HomePage    {...props} navLinks={this.navLinks} />} />
                            <Route exact path='/recent'     render={props => <RecentEntry {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar} />} />
                            <Route exact path='/add_bon'    render={props => <InputForm   {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar} />} />
                            <Route exact path='/show'       render={props => <DataDisplay {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar} />} />
                            <Route exact path='/add_ship'   render={props => <AddShip     {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar} />} />
                            <Route exact path='/print'      render={props => <MakeBook    {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar} />} />
                            <Route render={props => <Redirect {...props} to='/home' />} />
                        </React.Fragment>
                        : 
                        <Route render={props => <LoginPage {...props} user={this.state.user} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar} />} />
                    }
                </Switch>
            </React.Fragment>
        );
    }
}

export default withRouter(App);