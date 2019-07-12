import React from 'react'

import {firestore} from '../firebase';

import {TextField, InputAdornment, Button, Grid, Typography, Snackbar, SnackbarContent} from '@material-ui/core';

//TODO: Implement Loading UI

export default class InputForm extends React.Component {
    constructor(props) {
        super(props);

        this.formatCurrency = this.formatCurrency.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleIntChange = this.handleIntChange.bind(this);
        this.handleStringChange = this.handleStringChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleSnackBarClose = this.handleSnackBarClose.bind(this);

        this.transactionChoices = [
        {
            text : 'Pemasukan',
            value: 'pemasukan',
        },
        {
            text : 'Pengeluaran',
            value: 'pengeluaran',
        }
        ];

        this.state = {
            info: '',
            amount: '0',
            snackBarOpen : false,
            snackBarMessage : '',
            transaction: 'pemasukan',
            date: this.formatDate(),
        };
    }

    formatDate(){
        const now = new Date();

        let thisYear = now.getFullYear().toString();
        let thisMonth = (now.getMonth() + 1).toString();
        let thisDate = now.getDate().toString();

        if(thisMonth.length === 1){
            thisMonth = '0' + thisMonth;
        }

        if(thisDate.length === 1){
            thisDate = '0' + thisDate;
        }

        return `${thisYear}-${thisMonth}-${thisDate}`;
    }

    formatCurrency(numString){
        let inputString = numString.split('');
        let upperLimit = Math.floor(numString.length / 3);
        let ctr = 1;

        while (ctr <= upperLimit) {
            inputString.splice((-3 * ctr) - ctr + 1, 0, '.');
            ctr++;
        }

        if(inputString[0] === '.'){
            inputString.shift();
        }

        return inputString.join('');
    }

    handleSubmit(e) {
        e.preventDefault();

        if(this.state.info === ''){
            this.setState({
                snackBarMessage : 'Pastikan keterangan tidak kosong!',
                snackBarOpen : true,
            });

            return;
        }

        const now = new Date();
        const timeNow = now.valueOf();
        
        const inputDate = this.state.date.replace(/-/g, '');

        const inputDateValue = new Date(
            parseInt(inputDate.substring(0,4),10),
            parseInt(inputDate.substring(4,6),10) - 1,
            parseInt(inputDate.substring(6),10)
        ).setHours(0, 0, 0, 0);

        const timeOverflow = inputDateValue.valueOf() > timeNow;

        if(timeOverflow){
            this.setState({
                snackBarMessage: 'Pastikan tanggal yang dimasukkan benar!',
                snackBarOpen: true,
            });

            return;
        }

        const thisAmount = parseInt(this.state.amount, 10);

        const newEntry = {
            amount: thisAmount,
            info: this.state.info,
            lastUp : timeNow,
        };

        const thisTrans = this.state.transaction;
        const isIncome = thisTrans === 'pemasukan';
        const endPath = isIncome ? 'i' : 'o';

        const recentRef = firestore.collection('recent').doc('entry');

        const aggregationRef = firestore.collection('aggr').doc(inputDate.substring(0, 4));

        const dateRef = firestore.collection('data').doc(inputDate);
        const newRef = dateRef.collection(endPath).doc();

        firestore.runTransaction(async (transaction) => {
            const [aggregationDoc, recentDoc, dateDoc] = await Promise.all([
                transaction.get(aggregationRef), 
                transaction.get(recentRef),
                transaction.get(dateRef),
            ]);

            let aggregationValue;

            if(aggregationDoc.exists){
                aggregationValue = aggregationDoc.data();
            } else {
                let newArr = [];

                for(let i = 0; i <= 13; i++){
                    newArr.push({
                        isum : 0,
                        osum : 0,
                    });
                }

                aggregationValue = {
                    isum : 0,
                    osum : 0,
                    lastUp : 0,
                    months : newArr,
                };
            }

            let dateEntry = dateDoc.exists ? dateDoc.data() : { isum: 0, osum: 0, lastUp: 0 };
            let recentArr = recentDoc.exists ? recentDoc.data().entries : [];

            const newLength = recentArr.unshift({ ref: inputDate + endPath, ...newEntry});

            if (newLength > 10) {
                recentArr.pop();
            }

            const thisMonth = parseInt(inputDate.substring(4, 6), 10);

            if(isIncome){
                dateEntry.isum += thisAmount;
                aggregationValue.isum += thisAmount;
                aggregationValue.months[thisMonth].isum += thisAmount;
            } else {
                dateEntry.osum += thisAmount;
                aggregationValue.osum += thisAmount;
                aggregationValue.months[thisMonth].osum += thisAmount;
            }

            dateEntry.lastUp = timeNow;
            aggregationValue.lastUp = timeNow;

            transaction.set(aggregationRef, aggregationValue, {merge : true});
            transaction.set(recentRef, {entries : recentArr}, {merge : true});
            transaction.set(dateRef, dateEntry, {merge: true});
            transaction.set(newRef, newEntry, {merge: true});

            return Promise.resolve(true);
        }).then(() => {
            this.setState({
                transaction: 'pemasukan',
                date : this.formatDate(),
                info: '',
                amount: '0',
                snackBarMessage: 'Data Berhasil Disimpan!',
                snackBarOpen: true,
            });
        }).catch((err) => {
            console.error(err);
            this.setState({
                snackBarMessage: 'Terjadi kesalahan ketika menyimpan data! Coba lagi dalam beberapa saat',
                snackBarOpen: true,
            });
        });
    }

    handleDateChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    handleStringChange(e) {
        this.setState({
            [e.target.name]: encodeURIComponent(e.target.value),
        });
    }

    handleIntChange(e){
        this.setState({
            [e.target.name]: e.target.value == null || e.target.value === '' ? '0' : parseInt(e.target.value.replace(/\./g, ''), 10).toString(),
        });
    }

    handleSnackBarClose(event, reason){
        if(reason === 'clickaway'){
            return;
        }

        this.setState({
            snackBarMessage : '',
            snackBarOpen : false,
        });
    }

    render() {
        return (
            <React.Fragment>
                <Snackbar
                    key={this.state.snackBarMessage}
                    autoHideDuration={3000}
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
                
                <form>
                    <Grid container direction='row' justify='space-around' alignItems='center' spacing={3} >
                        <Grid item xs={12}>
                            <Typography variant='h5' align='center'> Tambahkan Bon </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth select id='transactionSelect' name='transaction' label='Jenis Transaksi' helperText='Pemasukan/Pengeluaran' required style={{ width: '100%' }}
                                variant='outlined'
                                value={this.state.transaction}
                                onChange={this.handleStringChange}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                {
                                    this.transactionChoices.map((choice) => (
                                        <option value={choice.value} key={choice.value}>
                                            {choice.text}
                                        </option>
                                    ))
                                }
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField fullWidth id='dateInput' name='date' label='Tanggal (mm/dd/yyyy)' type='date' required style={{ width: '100%' }}
                                variant='outlined'
                                helperText='Masukkan tanggal yang tertera di bon'
                                value={this.state.date}
                                onChange={this.handleDateChange}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth id='info' name='info' label='Keterangan' type='text' required style={{ width: '100%' }}
                                variant='outlined'
                                helperText='Masukkan keterangan bon (max 35 karakter)'
                                value={decodeURIComponent(this.state.info)}
                                onChange={this.handleStringChange}
                                inputProps={{
                                    maxLength: 35,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField fullWidth id='amount' name='amount' label='Jumlah' type='text' required style={{ width: '100%'}}
                                variant='outlined'
                                helperText='Masukkan jumlah uang di bon'
                                onChange={this.handleIntChange}
                                value={this.formatCurrency(this.state.amount)}
                                InputProps={{
                                    startAdornment: <InputAdornment position='start'> Rp. </InputAdornment>,
                                    inputProps: {
                                        maxLength: 14,
                                        pattern: "[0-9]{1,12}"
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button variant='contained' color='primary' onClick={this.handleSubmit} size='large' fullWidth>
                                Konfirmasi
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </React.Fragment>
        );
    }
}