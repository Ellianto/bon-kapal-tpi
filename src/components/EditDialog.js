import React from 'react';

import {DialogContent, DialogTitle, DialogActions, Button, TextField, InputAdornment, Grid} from '@material-ui/core';

export default class EditDialog extends React.Component{
    constructor(props) {
        super(props);
        
        this.formatCurrency = this.formatCurrency.bind(this);
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

        return inputString.join('');
    }

    render(){
        return(
            <React.Fragment>
                <DialogTitle> Ubah Data </DialogTitle>

                <DialogContent dividers={true}>
                    <Grid container direction='row' justify='space-evenly' alignItems='center' spacing={2}>
                        <Grid item>
                            <TextField fullWidth id='docInfo' name='docInfo' label='Keterangan' type='text' required style={{ width: '100%' }}
                                variant='outlined'
                                helperText='Ubah keterangan bon (max 35 karakter)'
                                value={decodeURIComponent(this.props.docInfo)}
                                onChange={this.props.stringChange}
                                inputProps={{
                                    maxLength: 35,
                                }}
                            />
                        </Grid>

                        <Grid item>
                            <TextField fullWidth id='docAmount' name='docAmount' label='Jumlah' type='text' required style={{ width: '100%' }}
                                variant='outlined'
                                helperText='Ubah jumlah uang di bon'
                                onChange={this.props.intChange}
                                value={this.formatCurrency(this.props.docAmount)}
                                InputProps={{
                                    startAdornment: <InputAdornment position='start'> Rp. </InputAdornment>,
                                    inputProps: {
                                        maxLength: 14,
                                        pattern: "[0-9]{1,12}"
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button color='secondary' onClick={this.props.closeDialog} >
                        Batal
                    </Button>
                    <Button color='primary' onClick={this.props.editData}>
                        Ubah Bon
                    </Button>
                </DialogActions>
            </React.Fragment>
        );
    }
}