import React from 'react';

import {firestore} from '../firebase';

import {Grid, Typography, TextField, Button} from '@material-ui/core';

export default class AddShip extends React.Component {
    constructor(props){
        super(props);

        this.handleStringChange = this.handleStringChange.bind(this);
        this.addShip = this.addShip.bind(this);

        this.state = {
            shipName : '',
            snackBarMessage : '',
            snackBarOpen : false,
        };
    }

    addShip(){
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
        this.setState({
            [e.target.name]: encodeURIComponent(e.target.value),
        });
    }

    render(){
        return(
            <React.Fragment>
                <Grid container direction='row' justify='space-around' alignItems='center' spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant='h5' align='center'> Tambahkan Kapal </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField required fullWidth id='shipName' name='shipName' label='Nama Kapal' type='text' variant='outlined'
                            helperText='Nama Kapal yang ingin ditambahkan'
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
            </React.Fragment>
        );
    }
};
