import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

import HomePage from './HomePage'
import AddShip from './AddShip'
import InputForm from './InputForm'
import DataDisplay from './DataDisplay'
import RecentEntry from './RecentEntry'
import CustomAppBar from './CustomAppBar'

import {Box, Snackbar, SnackbarContent, Button} from '@material-ui/core';
import { History, Search, NoteAdd, PlaylistAdd, Home } from '@material-ui/icons';

//TODO: Login & Home Page
//TODO: Implement better caching policy
//TODO: Enable offline access

export default class App extends React.Component{
    constructor(){
        super();

        this.handleSnackBarClose = this.handleSnackBarClose.bind(this);

        this.state = {
            snackBarOpen : false,
            snackBarMessage : '',
        }

        this.openSnackBar = (message, reload = false) => {
            this.setState({
                snackBarOpen : true,
                snackBarMessage : message,
            });

            if(reload){
                setTimeout(() => window.location.reload(), 2500);
            }
        }

        this.navLinks = [
            {
                id: 'home',
                link: '/',
                icon: <Home />,
                mainText: 'Home',
                helpText: 'Halaman Utama',
                descText: '',
            },
            null,
            {
                id: 'recent',
                link: '/recent',
                icon: <History />,
                mainText: 'Bon Terbaru',
                helpText: '10 Bon Terbaru',
                descText: 'Halaman untuk menampilkan 10 bon terakhir yang disimpan. Dari halaman ini, anda bisa memantau langsung penambahan bon-bon baru',
            },
            {
                id: 'show',
                link: '/show',
                icon: <Search />,
                mainText: 'Tampilkan Bon',
                helpText: 'Cari berdasarkan tanggal',
                descText: 'Halaman untuk mencari bon. Di halaman ini, anda bisa menampilkan kumpulan bon dari kapal tertentu pada tanggal/bulan/tahun tertentu',
            },
            null,
            {
                id: 'addBon',
                link: '/add_bon',
                icon: <NoteAdd />,
                mainText: 'Tambah Bon',
                helpText: 'Tambahkan Bon baru',
                descText: 'Halaman untuk menambahkan bon baru. Bon-bon yang ditambahkan harus terikat pada suatu kapal. Pastikan anda sudah menambahkan kapal terlebih dahulu',
            },
            {
                id: 'addShip',
                link: '/add_ship',
                icon: <PlaylistAdd />,
                mainText: 'Tambah Kapal',
                helpText: 'Tambahkan Kapal Baru',
                descText: 'Halaman untuk mendaftarkan kapal baru. Pastikan anda sudah menambahkan kapal yang anda inginkan sebelum menambahkan bon terkait kapal tersebut.',
            },
        ];
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
            <Router>
                <CustomAppBar navLinks={this.navLinks}/>
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
                <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                    <Switch>
                        <Route path='/' exact render={props => <HomePage {...props} navLinks={this.navLinks} />} />
                        <Route path='/add_bon' exact render={props => <InputForm {...props} openSnackBar={this.openSnackBar} />} />
                        <Route path='/show' exact render={props => <DataDisplay {...props} openSnackBar={this.openSnackBar} />} />
                        <Route path='/add_ship' exact render={props => <AddShip {...props} openSnackBar={this.openSnackBar} />} />
                        <Route path='/recent' exact component={RecentEntry}/>
                    </Switch>
                </Box>
            </Router>
        );
    }
}