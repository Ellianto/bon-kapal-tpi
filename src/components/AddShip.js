import React from 'react';

import {firestore} from '../firebase';

import {Grid, Typography, TextField, Button, Box} from '@material-ui/core';

export default class AddShip extends React.Component {
    constructor(props){
        super(props);

        this.handleStringChange = this.handleStringChange.bind(this);
        this.addShip = this.addShip.bind(this);
        this.formatDate = this.formatDate.bind(this);

        this.state = {
            shipName : '',
        };
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

    addShip(){
        this.props.showProgressBar();

        const shipName = this.state.shipName;

        if(shipName === ''){
            this.props.openSnackBar('Isi nama kapal terlebih dahulu!');
            return;
        }

        const shipRef = firestore.collection('ship').doc(shipName);

        shipRef.get().then((docSnapshot) => {
            if(docSnapshot.exists){
                this.props.openSnackBar('Nama tersebut sudah digunakan! Pilih nama kapal baru');
            } else {

                shipRef.set({
                    lastUp: (new Date()).valueOf(),
                    isum: 0,
                    osum: 0,
                    lastBook: '',
                }, {merge : true}).then(() => {
                    this.setState({
                        shipName : '',
                    });

                    this.props.openSnackBar('Kapal berhasil ditambahkan!');
                });
            }
        }).catch((err) => {
            console.error(err);
            this.props.openSnackBar('Terjadi kesalahan! Coba lagi dalam beberapa saat!');            
        });
    }

    handleStringChange(e) {
        let shipName = e.target.value;

        if(shipName.startsWith('.')){
            shipName = shipName.slice(1);
        }
        else if(shipName.startsWith('..')){
            shipName = shipName.slice(2);
        }
        else if ((shipName.startsWith('__') && shipName.endsWith('__'))) {
            shipName = shipName.slice(2, shipName.length - 3);            
        }

        this.setState({
            [e.target.name]: encodeURIComponent(shipName),
        });
    }

    render(){
        return (
            <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                <Grid container direction='row' justify='space-around' alignItems='center' spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant='h5' align='center'> Tambahkan Kapal </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField required fullWidth id='shipName' name='shipName' label='Nama Kapal' type='text' variant='outlined'
                            helperText='Max 20 char'
                            value={decodeURIComponent(this.state.shipName)}
                            onChange={this.handleStringChange}
                            style={{ width: '100%' }}
                            inputProps={{
                                maxLength: 20,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button fullWidth variant='contained' color='primary' size='large' onClick={this.addShip} disabled={this.state.shipName === '' ? true : false}>
                            Tambahkan Kapal
                            </Button>
                    </Grid>
                </Grid>
            </Box>
        );                 
    }
};
