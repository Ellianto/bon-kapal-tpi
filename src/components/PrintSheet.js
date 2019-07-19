import React from 'react';
import ReactToPrint from 'react-to-print';

import firebase, {firestore} from '../firebase'

import { Box, Grid, TextField, Chip, Button, Typography, Table, TableHead, TableBody, TableRow, TableCell,} from '@material-ui/core';
import { TrendingDown, TrendingUp, TrendingFlat } from '@material-ui/icons';
import { green, red } from '@material-ui/core/colors';

class PrintableTable extends React.Component{
    render(){
        return(
            <Box>
                <Box m={2}>
                    <Grid container justify='flex-start' alignContent='space-around' spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h5' align='left' display='inline' style={{marginRight : 6}}>
                                Pembukuan Kapal {decodeURIComponent(this.props.shownShip)}
                            </Typography>

                            {
                                this.props.greenSum > this.props.redSum ?
                                    <Chip label={'Profit : ' + (this.props.formatCurrency(this.props.redSum - this.props.greenSum))} icon={<TrendingUp />} style={{ backgroundColor: green[300] }} />
                                    :
                                    (
                                        this.props.redSum > this.props.greenSum ?
                                            <Chip label={'Defisit : ' + (this.props.formatCurrency(this.props.redSum - this.props.greenSum))} icon={<TrendingDown />} style={{ backgroundColor: red['A200'] }} />
                                            :
                                            <Chip label={'Stagnan'} icon={<TrendingFlat />} />
                                    )
                            }

                            <Typography variant='h6' align='left'>
                                Periode {this.props.printDate(this.props.formatDate())}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant='subtitle1' align='left'> Pemasukan : </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant='subtitle1' align='right' style={{ color: green[700] }}> {this.props.formatCurrency(this.props.greenSum)} </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant='subtitle1' align='left'> Pengeluaran : </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant='subtitle1' align='right' style={{ color: red['A700'] }}> {this.props.formatCurrency(this.props.redSum)} </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Table size='small'>
                    <TableHead>
                        <TableCell align='center' width='10%'> <Typography variant='body1'> <b> TANGGAL     </b> </Typography> </TableCell>
                        <TableCell align='center' width='40%'> <Typography variant='body1'> <b> KETERANGAN  </b> </Typography> </TableCell>
                        <TableCell align='center' width='25%'> <Typography variant='body1'> <b> DEBIT       </b> </Typography> </TableCell>
                        <TableCell align='center' width='25%'> <Typography variant='body1'> <b> KREDIT      </b> </Typography> </TableCell>
                    </TableHead>

                    <TableBody>
                        {
                            this.props.aggrData.map(([key, value]) => {
                                return value.map((doc) => {
                                    return (
                                        <TableRow key={doc.docId}>
                                            <TableCell align='center'> {this.props.printDate(key)} </TableCell>
                                            <TableCell align='center'> {decodeURIComponent(doc.info)} </TableCell>
                                            <TableCell align='right'>  {doc.type === 'i' ? this.props.formatCurrency(doc.amount) : '-'} </TableCell>
                                            <TableCell align='right'>  {doc.type === 'o' ? this.props.formatCurrency(doc.amount) : '-'} </TableCell>
                                        </TableRow>
                                    );
                                });
                            })
                        }
                        <TableRow>
                            <TableCell align='center' colSpan={2}>
                                <Typography variant='body1'>
                                    <b> Total </b>
                                </Typography>
                            </TableCell>
                            <TableCell align='right'>
                                <Typography variant='body1' style={{ color: green[700] }}>
                                    <b> {this.props.formatCurrency(this.props.greenSum)} </b>
                                </Typography>
                            </TableCell>
                            <TableCell align='right'>
                                <Typography variant='body1' style={{ color: red['A700'] }}>
                                    <b> {this.props.formatCurrency(this.props.redSum)} </b>
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        );
    }
}


export default class PrintSheet extends React.Component {
    constructor(props) {
        super(props);

        this.closeBook = this.closeBook.bind(this);
        this.printDate = this.printDate.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);
        this.handleStringChange = this.handleStringChange.bind(this);

        this.state = {
            aggrData: [],
            greenSum: 0,
            redSum: 0,
            startDate: '',
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

    formatCurrency(numString) {
        let inputString = numString.toString().split('');
        let upperLimit = Math.floor(numString.toString().length / 3);
        let ctr = 1;

        while (ctr <= upperLimit) {
            inputString.splice((-3 * ctr) - ctr + 1, 0, '.');
            ctr++;
        }

        if (inputString[0] === '.') {
            inputString.shift();
        }

        inputString.unshift('Rp. ');

        return inputString.join('');
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
                    .where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
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

            return [bonQuery.docs, iDocs.docs, oDocs.docs, shipData.isum, shipData.osum, startDate];

        }).then(([dateArr, iArr, oArr, greenSum, redSum, startDate]) => {
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
                    startDate: startDate,
                });

                this.props.openSnackBar('Tutup Buku Berhasil! Membuka buku baru...');
            }
        }).catch((err) => {
            console.error(err.message);
            this.props.openSnackBar('Gagal Tutup Buku! Coba lagi dalam beberapa saat!');
        })
    }

    handleStringChange(e) {
        this.setState({
            [e.target.name]: encodeURIComponent(e.target.value),
            submitted: false,
        });
    }

    render() {
        return (
            <React.Fragment>
                <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                    <Grid container justify='flex-start' alignItems='stretch' spacing={2}>
                        <Grid item xs={12}>
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
                        <Grid item xs={12}>
                            <Button fullWidth variant='contained' color='primary' size='large' onClick={this.closeBook} disabled={this.state.shipName === '' ? true : false}>
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