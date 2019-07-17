import React from 'react';

import {firestore} from '../firebase';

import {Divider, List, ListItem, ListItemText, Grid, Typography} from '@material-ui/core';
import {red, green} from '@material-ui/core/colors';

//Reimplement this with List
export default class RecentEntry extends React.Component{
    constructor(props){
        super(props);

        this.renderListEntry = this.renderListEntry.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);

        this.state = {
            recentEntries : [],
        };
    }

    componentDidMount(){
        firestore.collection('recent').doc('entry').onSnapshot((docSnapshot) => {
            if(docSnapshot.exists){
                this.setState({
                    recentEntries: docSnapshot.data().entries,
                });
            }
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

        inputString.unshift('Rp. ');

        return inputString.join('');
    }

    renderListEntry(entry){
        const year = entry.ref.substring(0, 4);
        const month= entry.ref.substring(4, 6);
        const date = entry.ref.substring(6, 8);
        const type = entry.ref.substring(8);

        const shipName = entry.ship;

        const amount = entry.amount;
        const info = entry.info;

        return(
            <React.Fragment>
                <ListItem disableGutters key={entry.lastUp}
                    style={{
                        paddingLeft: 8,
                        paddingRight: 8,
                        background: type === 'i' ? green[300] : red['A200']
                    }}
                >
                    <ListItemText
                        primary={
                            <React.Fragment>
                                <Typography variant='h6' align='left' display='block'>
                                    {this.formatCurrency(amount)}
                                </Typography>
                                <Typography variant='body2' align='left' display='block' style={{paddingTop : 8, paddingBottom:8}}>
                                    {decodeURIComponent(info)}
                                </Typography>
                            </React.Fragment>
                        }
                        secondary={`${date}/${month}/${year} | ${decodeURIComponent(shipName)}`}
                        secondaryTypographyProps={{ variant: 'button', align: 'left', display: 'block' }}
                    />
                </ListItem>
                <Divider component='li' />
            </React.Fragment>
        );
    }

    render(){
        return(
            <Grid container justify='center' alignItems='center' spacing={3}>
                <Grid item xs={12} md={4}/>
                <Grid container item xs={12} md={4}>
                    <Grid item xs={12}>
                        <Typography variant='h5' align='center'> Bon-Bon Terbaru </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            this.state.recentEntries.length === 0 ?
                            <Typography variant='h6' align='center'> Belum ada bon baru </Typography>
                            :
                            <List dense style={{ width: '100%' }}>
                                {
                                    this.state.recentEntries.map((entry) => this.renderListEntry(entry))
                                }
                            </List>
                        }
                    </Grid>
                </Grid>         
                <Grid item xs={12} md={4}/>
            </Grid>
        );
    }
}

/*
    <Grid container direction='row' justify='space-evenly' alignItems='center' spacing={6}>
        <Grid item xs={12}>
            <Typography variant='h5' align='center'>
                Bon-Bon Paling Baru
            </Typography>
        </Grid>

        <Grid item xs={12}>
            <Table size='small' padding='none'>
                <TableHead>
                    <TableCell align='center'> Tanggal </TableCell>
                    <TableCell align='center'> Keterangan  </TableCell>
                    <TableCell align='center' style={{ minWidth: 85}}> Jumlah </TableCell>
                </TableHead>
                <TableBody>
                    {
                        this.state.recentEntries.length === 0 ?
                        <TableCell colSpan={3} align='center'>
                            <Typography variant='h6'>
                                    <em> Tidak ada bon baru </em>
                            </Typography>
                        </TableCell>
                        :
                        this.state.recentEntries.map(this.renderRowEntry)
                    }
                </TableBody>
            </Table>
        </Grid>
    </Grid>
*/