import React from 'react'

import {firestore} from '../firebase';

import {TextField, InputAdornment, Button, Grid, Typography, Box} from '@material-ui/core';

//TODO: Implement Loading UI

export default class InputForm extends React.Component {
    constructor(props) {
        super(props);

        this.formatDate = this.formatDate.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleStringChange = this.handleStringChange.bind(this);
        this.handleIntChange = this.handleIntChange.bind(this);
        this.notProperlyFilled = this.notProperlyFilled.bind(this);

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
            ship: '',
            info: '',
            amount: '0',
            transaction: 'pengeluaran',
            date: this.formatDate(),
            shipList : [],
        };
    }

    componentDidMount(){
        this.props.showProgressBar();

        const shipRef = firestore.collection('ship');
        
        shipRef.get().then((querySnapshot) => {
            let shipList = [];

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => shipList.push(doc.id));
            }

            this.setState({
                shipList : shipList,
                ship : shipList[0],
            });

            this.props.closeProgressBar();
        });
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
		this.props.showProgressBar();

        if(this.state.info === ''){
            this.props.openSnackBar('Pastikan keterangan tidak kosong!');
            return;
        }

        if(this.state.ship === ''){
            this.props.openSnackBar('Pilih Kapal terlebih dahulu!');
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
            this.props.openSnackBar('Pastikan tanggal yang dimasukkan benar!');
            return;
        }

        const shipName = this.state.ship;

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
        const shipRef = firestore.collection('ship').doc(shipName);
        const aggregationRef = shipRef.collection('aggr').doc(inputDate.substring(0, 4));
        const dateRef = shipRef.collection('bon').doc(inputDate);
        const newRef = dateRef.collection(endPath).doc();

        firestore.runTransaction(async (transaction) => {
            const [recentDoc, shipDoc, aggregationDoc, dateDoc] = await Promise.all([
                transaction.get(recentRef),
                transaction.get(shipRef),
                transaction.get(aggregationRef),
                transaction.get(dateRef),
            ]);

            let aggregationValue;

            if(aggregationDoc.exists){
                aggregationValue = aggregationDoc.data();
            } else {
                let newArr = [];

                for(let i = 0; i < 13; i++){
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

            let shipValue = shipDoc.data();
            let dateValue = dateDoc.exists ? dateDoc.data() : { isum: 0, osum: 0, lastUp: 0 };
            let recentArr = recentDoc.exists ? recentDoc.data().entries : [];

            const newLength = recentArr.unshift({ ship : shipName, ref: inputDate + endPath, ...newEntry});

            if (newLength > 10) {
                recentArr.pop();
            }

            const thisMonth = parseInt(inputDate.substring(4, 6), 10);

            if(isIncome){
                shipValue.isum += thisAmount;
                dateValue.isum += thisAmount;
                aggregationValue.isum += thisAmount;
                aggregationValue.months[thisMonth].isum += thisAmount;
            } else {
                shipValue.osum += thisAmount;
                dateValue.osum += thisAmount;
                aggregationValue.osum += thisAmount;
                aggregationValue.months[thisMonth].osum += thisAmount;
            }

            shipValue.lastUp = timeNow;
            dateValue.lastUp = timeNow;
            aggregationValue.lastUp = timeNow;

            transaction.set(shipRef, shipValue, {merge : true});
            transaction.set(aggregationRef, aggregationValue, {merge : true});
            transaction.set(recentRef, {entries : recentArr}, {merge : true});
            transaction.set(dateRef, dateValue, {merge: true});
            transaction.set(newRef, newEntry, {merge: true});

            return Promise.resolve(true);
        }).then(() => {
            this.setState({
                transaction: 'pengeluaran',
                date : this.formatDate(),
                info: '',
                amount: '0',
            });

            this.props.openSnackBar('Bon berhasil ditambahkan!');
        }).catch((err) => {
            console.error(err.message);
            this.props.openSnackBar('Terjadi kesalahan ketika menyimpan bon! Coba lagi dalam beberapa saat');
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

    notProperlyFilled(){
        return this.state.amount === '0' || this.state.info === '' || this.state.ship === '';
    }

    render() {
        return (
            <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                <Grid container direction='row' justify='space-around' alignItems='center' spacing={3} >
                    <Grid item xs={12}>
                        <Typography variant='h5' align='center'> Tambahkan Bon </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField required fullWidth select id='transactionSelect' name='transaction' label='Jenis Transaksi' variant='outlined'
                            helperText='Pemasukan/Pengeluaran'
                            value={this.state.transaction}
                            onChange={this.handleStringChange}
                            style={{ width: '100%' }}
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
                        <TextField required fullWidth select id='shipSelect' name='ship' label='Pilih Kapal' variant='outlined'
                            helperText='Kapal yang berkaitan dengan bon ini'
                            value={decodeURIComponent(this.state.ship)}
                            onChange={this.handleStringChange}
                            style={{ width: '100%' }}
                            SelectProps={{
                                native: true,
                            }}
                        >
                            {
                                this.state.shipList.length === 0 ? 
                                <option value = ''> </option>
                                :
                                this.state.shipList.map((ship) => (
                                    <option value={decodeURIComponent(ship)} key={ship}>
                                        {decodeURIComponent(ship)}
                                    </option>
                                ))
                            }

                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField required fullWidth id='dateInput' name='date' label='Tanggal (mm/dd/yyyy)' type='date' variant='outlined'
                            helperText='Masukkan tanggal yang tertera di bon'
                            value={this.state.date}
                            onChange={this.handleDateChange}
                            style={{ width: '100%' }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField required fullWidth id='info' name='info' label='Keterangan' type='text' variant='outlined'
                            helperText='Masukkan keterangan bon (max 35 karakter)'
                            value={decodeURIComponent(this.state.info)}
                            onChange={this.handleStringChange}
                            style={{ width: '100%' }}
                            inputProps={{
                                maxLength: 35,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField required fullWidth id='amount' name='amount' label='Jumlah' type='text' variant='outlined'
                            helperText='Masukkan jumlah uang di bon'
                            value={this.formatCurrency(this.state.amount)}
                            onChange={this.handleIntChange}
                            style={{ width: '100%' }}
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
                        <Button fullWidth variant='contained' color='primary' size='large' onClick={this.handleSubmit} disabled={this.notProperlyFilled() ? true : false}>
                            Tambahkan Bon
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}