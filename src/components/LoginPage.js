import React from 'react'
import {Redirect} from 'react-router-dom'

import {fireAuth} from '../firebase';

import {Grid, TextField, Button, Box} from '@material-ui/core';

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        
        this.handleStringChange = this.handleStringChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);

        this.state = {
            uname : '',
            passwd : '',
        }
    }

    handleStringChange(e){
        this.setState({
            [e.target.name] : encodeURIComponent(e.target.value),
        });
    }

    handleLogin(){
        const user_name = this.state.uname;
        const pass_word = this.state.passwd;

        this.props.showProgressBar();

        fireAuth.signInWithEmailAndPassword(decodeURIComponent(user_name), decodeURIComponent(pass_word))
        .catch((err) => {
            this.props.openSnackBar('Terjadi kesalahan ketika login! Coba lagi dalam beberapa saat!');
        });
    }

    render() {
        return (
            <Grid container px={2} py={4} direction='row' justify='space-around' alignItems='center'>
                <Grid item md={4} />
                <Box mx='auto' px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                    <Grid item container direction='row' justify='space-evenly' alignItems='center' spacing={2} md={4}>
                        <Grid item xs={12}>
                            <TextField fullWidth id='user_name' name='uname' label='Username' type='text' required style={{ width: '100%' }}
                                variant='outlined'
                                onChange={this.handleStringChange}
                                value={decodeURIComponent(this.state.uname)}
                                inputProps={{
                                    pattern: '[\w\d@\.]',
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth id='pass_word' name='passwd' label='Password' type='password' required style={{ width: '100%' }}
                                variant='outlined'
                                onChange={this.handleStringChange}
                                value={decodeURIComponent(this.state.passwd)}
                                inputProps={{
                                    pattern: '[\w\d]'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth variant='contained' size='medium' color='primary' onClick={this.handleLogin} disabled={this.state.uname === '' || this.state.passwd === '' ? true : false}>
                                Login
                        </Button>
                        </Grid>
                    </Grid>
                </Box>
                <Grid item md={4} />
            </Grid>
        );
    }
};
