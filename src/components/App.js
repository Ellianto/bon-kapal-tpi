import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

import AddShip from './AddShip'
import HomePage from './HomePage'
import InputForm from './InputForm'
import MakeBook from './MakeBook'
import DataDisplay from './DataDisplay'
import RecentEntry from './RecentEntry'
import Navbar from './CustomAppBar'

import {Snackbar, SnackbarContent, Button} from '@material-ui/core';
import {History, Search, NoteAdd, PlaylistAdd, Home, Print } from '@material-ui/icons';

//TODO: Login Page
//TODO: Implement better caching policy
//TODO: Enable offline access
//TODO: Make a 404 Page

export default class App extends React.Component{
    constructor(){
        super();

        this.handleSnackBarClose = this.handleSnackBarClose.bind(this);

        this.state = {
            isLoading : false,
            snackBarOpen : false,
            snackBarMessage : '',
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
            {
                id: 'print',
                link: '/print',
                icon: <Print />,
                mainText: 'Tutup Buku',
                helpText: 'Rekap Tahunan/Bulanan',
                descText: 'Halaman untuk menampilkan hasil rekap tahunan/bulanan untuk kapal yang dicari dalam bentuk tabel yang rapi. Tabel tersebut kemudian dapat dicetak/diprint'
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
                <Navbar isLoading={this.state.isLoading} navLinks={this.navLinks}/>
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
                <Switch>
                    <Route exact path='/'         render={props => <HomePage    {...props} navLinks={this.navLinks} />} />
                    <Route exact path='/add_bon'  render={props => <InputForm   {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar}/> } />
                    <Route exact path='/show'     render={props => <DataDisplay {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar}/> } />
                    <Route exact path='/add_ship' render={props => <AddShip     {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar}/> } />
                    <Route exact path='/print'    render={props => <MakeBook  {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} openSnackBar={this.openSnackBar}/> }/>
                    <Route exact path='/recent'   render={props => <RecentEntry {...props} showProgressBar={this.showProgressBar} closeProgressBar={this.closeProgressBar} /> } />
                </Switch>
            </Router>
        );
    }
}