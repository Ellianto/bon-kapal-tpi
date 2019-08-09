import React from 'react';

import {addShipMethod} from '../firebase';

import {Grid, Typography, TextField, Button, Box} from '@material-ui/core';

export default class AddShip extends React.Component {
    constructor(props){
        super(props);

        this.handleStringChange = this.handleStringChange.bind(this);
        this.addShip = this.addShip.bind(this);

        this.state = {
            shipName : '',
            isLoading : false,
        };
    }

    addShip(){
        this.setState({
            isLoading: true,
        });
        this.props.showProgressBar();

        const shipName = this.state.shipName;

        if(shipName === ''){
            this.props.openSnackBar('Isi nama kapal terlebih dahulu!');
            return;
        }

        addShipMethod({shipName : shipName}).then(result => {
            this.setState({
                shipName : '',
                isLoading : false,
            });
            this.props.openSnackBar(result.data.responseText);
        }).catch(err => {
            console.error(err.code);
            this.props.openSnackBar(err.message);
            this.setState({
                isLoading: false,
            });
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
