import React from 'react';
import ReactToPrint from 'react-to-print';

import {getShipsMethod, getBooksMethod, addBookMethod, openBookMethod} from '../firebase'
import PrintableTable from './PrintableTable'

import { Box, Grid, TextField, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';

export default class MakeBook extends React.Component {
    constructor(props) {
        super(props);

        this.openBook = this.openBook.bind(this);
        this.closeBook = this.closeBook.bind(this);
        this.printDate = this.printDate.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.handleStringChange = this.handleStringChange.bind(this);
        this.handleDialogOpen = this.handleDialogOpen.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);

        this.handleFirebaseErrors = this.handleFirebaseErrors.bind(this);

        this.state = {
            bookList: [],
            bookId : '',
            aggrData: [],
            greenSum: 0,
            redSum: 0,
            shipList: [],
            shipName: '',
            shownShip: '',
            submitted: false,
        }
    }

    handleFirebaseErrors(err){
        console.error(err.code);
        this.props.openSnackBar(err.message);
    }

    componentDidMount() {
        this.props.showProgressBar();

        getShipsMethod({}).then(result => {
            let shipList = [];
            let shipName = '';

            if (!result.data.isEmpty) {
                shipName = result.data.shipList[0];
                shipList = result.data.shipList;
            }

            this.setState({
                shipList: shipList,
                shipName: shipName,
            });

            this.props.closeProgressBar();
        }).catch(this.handleFirebaseErrors);
    }

    printDate(dateString) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const date = dateString.substring(6);

        return `${date}/${month}/${year}`;
    }

    formatDate() {
        const now = new Date();

        let thisYear = now.getFullYear().toString();
        let thisMonth = (now.getMonth() + 1).toString();
        let thisDate = now.getDate().toString();

        if (thisMonth.length === 1) {
            thisMonth = '0' + thisMonth;
        }

        if (thisDate.length === 1) {
            thisDate = '0' + thisDate;
        }

        return `${thisYear}${thisMonth}${thisDate}`;
    }

    openBook(){
        this.props.showProgressBar();

        const bookArr = this.state.bookList;
        const chosenId = this.state.bookId;

        const chosenBook = bookArr.find((book) => {
            return book.endDate === chosenId;
        });

        const shipName = this.state.shipName;

        const params = {
            shipName : shipName,
            chosenBook : chosenBook,
        };

        openBookMethod(params).then(result => {
            this.setState({
                aggrData: result.data.resultData,
                greenSum: chosenBook.isum,
                redSum: chosenBook.osum,
                shownShip: shipName,
                submitted: true,
                openDialog: false,
            });

            this.props.closeProgressBar();
        }).catch(this.handleFirebaseErrors);
    }

    closeBook() {
        this.props.showProgressBar();

        const shipName = this.state.shipName;

        const params = {
            shipName : shipName,
        };

        addBookMethod(params).then(result => {
            let newState = {submitted : true};
            let newMessage = 'Tidak ada bon yang bisa di rekap!';

            if(!result.data.isEmpty){
                newState = {
                    submitted : true,
                    aggrData : result.data.resultData,
                    greenSum : result.data.incomeSum,
                    redSum : result.data.expenseSum,
                    shownShip : shipName,
                    openDialog : false,
                };

                newMessage = 'Tutup Buku Berhasil! Membuka buku baru...';
            }

            this.setState(newState);
            this.props.openSnackBar(newMessage);
        }).catch(this.handleFirebaseErrors);
    }

    handleStringChange(e) {
        this.setState({
            [e.target.name]: encodeURIComponent(e.target.value),
            submitted: false,
        });
    }

    handleDialogOpen(e){
        this.props.showProgressBar();

        const params = {
            shipName :  this.state.shipName,
        }

        getBooksMethod(params).then(result => {
            if(result.data.books.length > 0){
                this.setState({
                    bookList: result.data.books,
                    bookId: result.data.books[0].endDate,
                    openDialog: true,
                });
            }

            this.props.closeProgressBar();
        }).catch(this.handleFirebaseErrors);
    }

    handleDialogClose(e){
        this.setState({
            openDialog : false,
            bookId : '',
            bookList : [],
        });
    }

    render() {
        return (
            <React.Fragment>
                <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                    <Grid container justify='flex-start' alignItems='stretch' spacing={2}>
                        <Grid item xs={12} md={8}>
                            <TextField required fullWidth select id='shipSelect' name='shipName' label='Nama Kapal' variant='outlined'
                                helperText='Nama Kapal yang ingin direkap bonnya'
                                value={decodeURIComponent(this.state.shipName)}
                                onChange={this.handleStringChange}
                                style={{ width: '100%' }}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                {
                                    this.state.shipList.length === 0 ?
                                        <option value=''> </option>
                                        :
                                        this.state.shipList.map((ship) => (
                                            <option value={decodeURIComponent(ship)} key={ship}>
                                                {decodeURIComponent(ship)}
                                            </option>
                                        ))
                                }
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button fullWidth variant='contained' color='primary' size='large' onClick={this.handleDialogOpen} disabled={this.state.shipName === '' ? true : false} style={{height : 56}}>
                                Tampilkan Buku-Buku
                            </Button>
                            <Dialog open={this.state.openDialog} onClose={this.handleDialogClose}>
                                <DialogTitle>
                                    Pilih Buku untuk Dibuka
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Pilih buku yang ingin dibuka dari kapal {decodeURIComponent(this.state.shipName)}
                                    </DialogContentText>
                                    <TextField required fullWidth select id='bookSelect' name='bookId' variant='outlined'
                                        helperText='Periode Buku yang ingin dibuka'
                                        value={this.state.bookId}
                                        onChange={this.handleStringChange}
                                        style={{ width: '100%' }}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        {
                                            this.state.bookList.length === 0 ?
                                                <option value=''> Belum ada buku untuk kapal ini </option>
                                                :
                                                this.state.bookList.map((book) => (
                                                    <option value={book.endDate} key={book.endDate}>
                                                        {`Periode ${this.printDate(book.endDate)}`}
                                                    </option>
                                                ))
                                        }
                                    </TextField>
                                </DialogContent>
                                <DialogActions>
                                    <Button color='secondary' onClick={this.handleDialogClose}> Batal </Button>
                                    <Button color='primary' onClick={this.openBook} disabled={this.state.bookId === '' ? true : false}> Tampilkan Buku </Button>
                                </DialogActions>
                            </Dialog>
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth variant='contained' color='primary' size='large' onClick={() => this.closeBook()} disabled={this.state.shipName === '' ? true : false} style={{ height: 56 }}>
                                Tutup Buku
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                <Box m={4} p={4}>
                    {
                        this.state.submitted ?
                            (
                                this.state.aggrData.length === 0 ?
                                    <Typography variant='h5' align='center'> Tidak ada rekap untuk periode ini </Typography>
                                    :
                                    <React.Fragment>
                                        <ReactToPrint
                                            content={() => this.componentRef}
                                            trigger={() => <Button fullWidth variant='contained' color='primary' size='large' style={{ marginBottom: 8 , height: 56}}> Cetak Buku </Button>}
                                        />
                                        <PrintableTable
                                            ref={el => (this.componentRef = el)}
                                            printDate={this.printDate}
                                            formatDate={this.formatDate}
                                            formatCurrency={this.formatCurrency}
                                            greenSum={this.state.greenSum}
                                            redSum={this.state.redSum}
                                            aggrData={this.state.aggrData}
                                            shownShip={this.state.shownShip}
                                        />
                                    </React.Fragment>
                            )
                            : null
                    }
                </Box>
            </React.Fragment>
        );
    }
};