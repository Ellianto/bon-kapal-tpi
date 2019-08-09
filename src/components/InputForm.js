import React from 'react'

import {getShipsMethod, addBonMethod} from '../firebase';

import {TextField, InputAdornment, Button, Grid, Typography, Box} from '@material-ui/core';

import {green, red} from '@material-ui/core/colors';

export default class InputForm extends React.Component {
    constructor(props) {
        super(props);

        this.formatCurrency = this.formatCurrency.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleStringChange = this.handleStringChange.bind(this);
        this.handleIntChange = this.handleIntChange.bind(this);
        this.notProperlyFilled = this.notProperlyFilled.bind(this);

        this.handleFirebaseErrors = this.handleFirebaseErrors.bind(this);

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

        const dateFormat = `${thisYear}-${thisMonth}-${thisDate}`;

        this.state = {
            ship: '',
            info: '',
            amount: '0',
            transaction: 'pengeluaran',
            date: dateFormat,
            shipList : [],
            isLoading : false,
        };

    }

    handleFirebaseErrors(err){
        console.error(err.code);
        this.props.openSnackBar(err.message);
    }

    componentDidMount(){
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
                ship: shipName,
            });

            this.props.closeProgressBar();
        }).catch(this.handleFirebaseErrors);
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

        this.setState({
            isLoading : true,
        });

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

        const params = {
            shipName: this.state.ship,
            year : inputDate.substring(0, 4),
            month : inputDate.substring(4, 6),
            fullDate : inputDate,
            isIncome: this.state.transaction === 'pemasukan',
            amount: parseInt(this.state.amount, 10),
            info : this.state.info.trim(),
        }

        addBonMethod(params).then(result => {
            if (result.data.transactionSuccess) {
                this.props.openSnackBar(result.data.message);
                this.setState({
                    transaction: 'pengeluaran',
                    info: '',
                    amount: '0',
                    isLoading : false,
                });
            }
        }).catch(this.handleFirebaseErrors);
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
                        <Button fullWidth variant='contained' style={{backgroundColor : this.state.transaction === 'pemasukan' ? green[300] : red['A200']}} size='large' onClick={this.handleSubmit} disabled={this.notProperlyFilled() || this.state.isLoading ? true : false}>
                            Tambahkan Bon
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}