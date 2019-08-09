import React from 'react';

import {Box, Grid, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip,} from '@material-ui/core'
import {green, red} from '@material-ui/core/colors'
import {TrendingUp, TrendingDown, TrendingFlat} from '@material-ui/icons'

export default class PrintableTable extends React.Component {
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

        inputString.unshift('Rp. ');

        return inputString.join('');
    }
    
    render() {
        return (
            <Box>
                <Box m={2}>
                    <Grid container justify='flex-start' alignContent='space-around' spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h5' align='left' display='inline' style={{ marginRight: 6 }}>
                                Pembukuan Kapal {decodeURIComponent(this.props.shownShip)}
                            </Typography>

                            {
                                this.props.greenSum > this.props.redSum ?
                                    <Chip label={'Profit : ' + (this.formatCurrency(this.props.greenSum - this.props.redSum))} icon={<TrendingUp />} style={{ backgroundColor: green[300] }} />
                                    :
                                    (
                                        this.props.redSum > this.props.greenSum ?
                                            <Chip label={'Defisit : ' + (this.formatCurrency(this.props.redSum - this.props.greenSum))} icon={<TrendingDown />} style={{ backgroundColor: red['A200'] }} />
                                            :
                                            <Chip label={'Stagnan'} icon={<TrendingFlat />} />
                                    )
                            }
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant='subtitle1' align='left'> Pemasukan : </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant='subtitle1' align='right' style={{ color: green[700] }}> {this.formatCurrency(this.props.greenSum)} </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant='subtitle1' align='left'> Pengeluaran : </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant='subtitle1' align='right' style={{ color: red['A700'] }}> {this.formatCurrency(this.props.redSum)} </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell align='center' width='10%'> <Typography variant='body1'> <b> TANGGAL     </b> </Typography> </TableCell>
                            <TableCell align='center' width='40%'> <Typography variant='body1'> <b> KETERANGAN  </b> </Typography> </TableCell>
                            <TableCell align='center' width='25%'> <Typography variant='body1'> <b> DEBIT       </b> </Typography> </TableCell>
                            <TableCell align='center' width='25%'> <Typography variant='body1'> <b> KREDIT      </b> </Typography> </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            this.props.aggrData.map(([key, value]) => {
                                return value.map((doc) => {
                                    return (
                                        <TableRow key={doc.docId}>
                                            <TableCell align='center'> {this.props.printDate(key)} </TableCell>
                                            <TableCell align='center'> {decodeURIComponent(doc.info)} </TableCell>
                                            <TableCell align='right'>  {doc.type === 'i' ? this.formatCurrency(doc.amount) : '-'} </TableCell>
                                            <TableCell align='right'>  {doc.type === 'o' ? this.formatCurrency(doc.amount) : '-'} </TableCell>
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
                                    <b> {this.formatCurrency(this.props.greenSum)} </b>
                                </Typography>
                            </TableCell>
                            <TableCell align='right'>
                                <Typography variant='body1' style={{ color: red['A700'] }}>
                                    <b> {this.formatCurrency(this.props.redSum)} </b>
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        );
    }
}
