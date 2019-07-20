import React from 'react';
import ReactToPrint from 'react-to-print';

import firebase, {firestore} from '../firebase'
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

    componentDidMount() {
        this.props.showProgressBar();
        const shipRef = firestore.collection('ship');

        shipRef.get().then((querySnapshot) => {
            let shipList = [];

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => shipList.push(doc.id));
            }

            this.setState({
                shipList: shipList,
                shipName: shipList.length === 0 ? '' : shipList[0],
            });

            this.props.closeProgressBar();
        });
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
        const bookArr = this.state.bookList;
        const chosenId = this.state.bookId;

        const chosenBook = bookArr.find((book) => {
            return book.endDate === chosenId;
        });

        const shipName = this.state.shipName;
        const shipRef = firestore.collection('ship').doc(shipName);

        let bonRef;

        if (chosenBook.startDate === '') {
            bonRef = shipRef.collection('bon')
                .where(firebase.firestore.FieldPath.documentId(), '<=', chosenBook.endDate);
        } else {
            bonRef = shipRef.collection('bon')
                .where(firebase.firestore.FieldPath.documentId(), '>', chosenBook.startDate)
                .where(firebase.firestore.FieldPath.documentId(), '<=', chosenBook.endDate);
        }

        bonRef.get().then(async(querySnapshot) => {
            const iQuery = bonRef.firestore.collectionGroup('i');
            const oQuery = bonRef.firestore.collectionGroup('o');
           
            const [iDocs, oDocs] = await Promise.all([
                iQuery.get(),
                oQuery.get(),
            ]);

            const dateArr = querySnapshot.docs;
            const iArr = iDocs.docs;
            const oArr = oDocs.docs;

            let tempMap = new Map();

            for (const dateDoc of dateArr) {
                let dateList = [];
                const dateKey = dateDoc.id;

                for (const iData of iArr) {
                    if (iData.ref.parent.parent.id === dateKey) {
                        const data = iData.data();
                        const docId = iData.id;

                        dateList.push({
                            docId: docId,
                            type: 'i',
                            info: data.info,
                            amount: data.amount,
                        });
                    }
                }

                for (const oData of oArr) {
                    if (oData.ref.parent.parent.id === dateKey) {
                        const data = oData.data();
                        const docId = oData.id;

                        dateList.push({
                            docId: docId,
                            type: 'o',
                            info: data.info,
                            amount: data.amount,
                        });
                    }
                }

                tempMap.set(dateKey, dateList);
            };

            this.setState({
                aggrData: Array.from(tempMap),
                greenSum: chosenBook.isum,
                redSum: chosenBook.osum,
                shownShip: shipName,
                submitted: true,
                openDialog: false,
            });

            this.props.openSnackBar('Menampilkan buku...');
        }).catch((err) => {
            console.error(err.message);
            this.props.openSnackBar('Terjadi kesalahan ketika menampilkan buku! Coba lagi dalam beberapa saat!');
        })
    }

    closeBook() {
        this.props.showProgressBar();

        const shipName = this.state.shipName;

        const shipRef = firestore.collection('ship').doc(shipName);
        const bookRef = shipRef.collection('book');

        firestore.runTransaction(async (transaction) => {
            const shipDoc = await transaction.get(shipRef);

            const shipData = shipDoc.data();

            const startDate = shipData.lastBook;
            const endDate = this.formatDate();

            let bonRef;

            if (startDate === '') {
                bonRef = shipRef.collection('bon')
                    .where(firebase.firestore.FieldPath.documentId(), '<=', endDate);
            } else {
                bonRef = shipRef.collection('bon')
                    .where(firebase.firestore.FieldPath.documentId(), '>', startDate)
                    .where(firebase.firestore.FieldPath.documentId(), '<=', endDate);
            }

            const bonQuery = await bonRef.get();

            if (bonQuery.empty) {
                transaction.set(shipRef, shipData);
                return [[], [], [], 0, 0, startDate];
            }

            const iQuery = bonRef.firestore.collectionGroup('i');
            const oQuery = bonRef.firestore.collectionGroup('o');

            const [iDocs, oDocs] = await Promise.all([
                iQuery.get(),
                oQuery.get(),
            ]);

            transaction.set(bookRef.doc(endDate), {
                startDate: startDate,
                endDate: endDate,
                isum: shipData.isum,
                osum: shipData.osum,

            }, { merge: true });

            transaction.set(shipRef, {
                isum: 0,
                osum: 0,
                lastUp: (new Date()).valueOf(),
                lastBook: endDate,
            }, { merge: true });

            return [bonQuery.docs, iDocs.docs, oDocs.docs, shipData.isum, shipData.osum];

        }).then(([dateArr, iArr, oArr, greenSum, redSum]) => {
            if (dateArr.length === 0) {
                this.setState({
                    submitted: true,
                });

                this.props.openSnackBar('Tidak ada bon yang bisa di rekap!');
            } else {
                let tempMap = new Map();

                for (const dateDoc of dateArr) {
                    let dateList = [];
                    const dateKey = dateDoc.id;

                    for (const iData of iArr) {
                        if (iData.ref.parent.parent.id === dateKey) {
                            const data = iData.data();
                            const docId = iData.id;

                            dateList.push({
                                docId: docId,
                                type: 'i',
                                info: data.info,
                                amount: data.amount,
                            });
                        }
                    }

                    for (const oData of oArr) {
                        if (oData.ref.parent.parent.id === dateKey) {
                            const data = oData.data();
                            const docId = oData.id;

                            dateList.push({
                                docId: docId,
                                type: 'o',
                                info: data.info,
                                amount: data.amount,
                            });
                        }
                    }

                    tempMap.set(dateKey, dateList);
                };

                this.setState({
                    aggrData: Array.from(tempMap),
                    greenSum: greenSum,
                    redSum: redSum,
                    shownShip: shipName,
                    submitted: true,
                    openDialog: false,
                });

                this.props.openSnackBar('Tutup Buku Berhasil! Membuka buku baru...');
            }
        }).catch((err) => {
            console.error(err.message);
            this.props.openSnackBar('Gagal Tutup Buku! Coba lagi dalam beberapa saat!');
        });
    }

    handleStringChange(e) {
        this.setState({
            [e.target.name]: encodeURIComponent(e.target.value),
            submitted: false,
        });
    }

    handleDialogOpen(e){
        const shipName = this.state.shipName;

        const booksRef = firestore.collection('ship').doc(shipName).collection('book');

        booksRef.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
                const bookArr = [];

                querySnapshot.forEach((book) => {
                    const data = book.data();
                    
                    bookArr.push({
                        startDate : data.startDate,
                        endDate : data.endDate,
                        isum : data.isum,
                        osum : data.osum,
                    })
                });

                this.setState({
                    bookList : bookArr,
                    bookId : bookArr[0].endDate,
                    openDialog: true,
                });
            }
        }).catch((err) => {
            this.props.openSnackBar('Terjadi kesalahan ketika mengambil daftar buku! Silahkan coba lagi!');
        });
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
                            <Button fullWidth variant='contained' color='primary' size='large' onClick={this.handleDialogOpen} disabled={this.state.shipName === '' ? true : false}>
                                Tampilkan Buku
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
                            <Button fullWidth variant='contained' color='primary' size='large' onClick={() => this.closeBook()} disabled={this.state.shipName === '' ? true : false}>
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
                                            trigger={() => <Button fullWidth color='primary' size='large' style={{marginBottom: 8}}> Cetak Buku </Button>}
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