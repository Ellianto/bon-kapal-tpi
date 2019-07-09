import React from 'react';

import {firestore} from '../firebase';

import {Table, TableRow, TableCell, TableHead, TableBody, Grid, Typography} from '@material-ui/core';
import {red, green} from '@material-ui/core/colors';

// TODO: Beautify and find 'dynamic viewport-based sizing' solution


export default class RecentEntry extends React.Component{
    constructor(props){
        super(props);

        this.renderRowEntry = this.renderRowEntry.bind(this);

        this.state = {
            recentEntries : [],
        };
    }

    componentDidMount(){
        firestore.collection('recent').doc('entry').onSnapshot((docSnapshot) => {
            this.setState({
                recentEntries : docSnapshot.data().entries,
            });
        });
    }

    formatCurrency(inputNumber) {
        let inputString = inputNumber.toString().split('');
        let upperLimit = Math.floor(inputNumber.toString().length / 3);
        let ctr = 1;

        while (ctr <= upperLimit) {
            inputString.splice((-3 * ctr) - ctr + 1, 0, '.');
            ctr++;
        }

        if (inputString[0] === '.') {
            inputString.shift();
        }

        return 'Rp. ' + inputString.join('');
    }

    renderRowEntry(entry){
        const info = entry.info;
        const amount = entry.amount;
        const reference = entry.ref;

        const year = reference.substring(0,4);
        const month = reference.substring(4,6);
        const date = reference.substring(6,8);
        const transactionType = reference.substring(8);

        const style = {
            background: transactionType === 'i' ? green[300] : red['A100'],
        }

        return(
            <TableRow key={reference} style={style}>
                <TableCell> {`${date}/${month}/${year}`} </TableCell>
                <TableCell> {info} </TableCell>
                <TableCell> {this.formatCurrency(amount)} </TableCell>
            </TableRow>
        );
    }

    render(){
        return(
            <Grid container direction='row' justify='space-evenly' alignItems='center' spacing={6}>
                <Grid item xs={12}>
                    <Typography variant='h5' align='center'>
                        Bon-Bon Paling Baru
                    </Typography>
                </Grid>
                
                <Grid item xs={12}>
                    <Table size='small' padding='none'>
                        <TableHead>
                            <TableCell> Tanggal </TableCell>
                            <TableCell> Keterangan  </TableCell>
                            <TableCell> Jumlah </TableCell>
                        </TableHead>
                        <TableBody>
                            {this.state.recentEntries.map(this.renderRowEntry)}
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
        )
    }
}