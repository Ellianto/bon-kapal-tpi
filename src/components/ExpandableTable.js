import React from 'react';
import {Table, TableHead, TableBody, TableRow, TableCell, Button, Typography} from '@material-ui/core';
import {green, red} from '@material-ui/core/colors'

// TODO: Beautify and find 'dynamic viewport-based sizing' solution

class ExpandableRow extends React.Component{
    constructor(props){
        super(props);

        this.readableKey = this.readableKey.bind(this);
        this.toggleIRow = this.toggleIRow.bind(this);
        this.toggleORow = this.toggleORow.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);

        this.state = {
            iExpand : false,
            oExpand : false,
        }
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

    toggleIRow(){
        this.setState({
            iExpand : !this.state.iExpand,
        });
    }

    toggleORow(){
        this.setState({
            oExpand : !this.state.oExpand,
        });
    }

    readableKey(key){
        const year = parseInt(key.substring(0, 4), 10);
        const month = parseInt(key.substring(4, 6), 10);
        const date = parseInt(key.substring(6), 10);

        const dateFormat = new Date(year, month-1, date);

        return dateFormat.toLocaleDateString();
    }

    render(){
        let iButton;
        let oButton;

        if(this.props.item.isum === 0){
            iButton = (
                <Button size="small" color="secondary" disabled>
                    <Typography variant='overline' align='center'>
                        -
                    </Typography>
                </Button>
            );
        } else {
            iButton = (
                <Button size="small" color="primary" onClick={this.toggleIRow}> 
                    <Typography variant='caption' align='center'>
                        {this.formatCurrency(this.props.item.isum)}
                    </Typography>
                </Button>
            );
        }

        if(this.props.item.osum === 0){
            oButton = (
                <Button size="small" color="secondary" disabled>
                    <Typography variant='overline' align='center'>
                        -
                    </Typography>
                </Button>
            );
        } else {
            oButton = (
                <Button size="small" color="secondary" onClick={this.toggleORow}> 
                    <Typography variant='caption' align='center'>
                        {this.formatCurrency(this.props.item.osum)} 
                    </Typography>
                </Button>
            );
        }

        return(
            <React.Fragment>
                <TableRow>
                    <TableCell> 
                        <Typography variant='overline' align='left'>
                            {this.readableKey(this.props.idx)}    
                        </Typography>    
                    </TableCell>
                    <TableCell>
                        {iButton}
                    </TableCell>
                    <TableCell>
                        {oButton}
                    </TableCell>
                </TableRow>
                {
                    this.state.iExpand ? 
                    this.props.item.i.map((doc) => {
                        const data = doc.data();

                        return (
                            <TableRow style={{ background: green[300] }}>
                                <TableCell>
                                    <Typography variant='caption'>
                                        {data.info}
                                    </Typography>
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <Typography variant='caption'>
                                        {this.formatCurrency(data.amount)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        );
                    }) 
                    : null
                }
                {
                    this.state.oExpand ? 
                    this.props.item.o.map((doc) => {
                        const data = doc.data();

                        return (
                            <TableRow style={{ background: red['A100'] }}>
                                <TableCell>
                                    <Typography variant='caption'>
                                        {data.info}
                                    </Typography>
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <Typography variant='caption'>
                                        {this.formatCurrency(data.amount)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        );
                    })  
                    : null
                }
            </React.Fragment>
        );
    }
}


export default class ExpandableTable extends React.Component{
    render(){
        return(
            <Table size='small' padding='none'>
                <TableHead>
                    <TableRow>
                        <TableCell> Tanggal </TableCell>
                        <TableCell> Pemasukan </TableCell>
                        <TableCell> Pengeluaran </TableCell>
                    </TableRow>
                </TableHead>
                
                <TableBody>
                    {
                    this.props.items.size === 0 ?
                    <TableRow> 
                        <TableCell colSpan={3}> Tidak ada data untuk ditampilkan </TableCell>    
                    </TableRow>
                    :    
                    this.props.items.map((value) => {
                        return (
                            <ExpandableRow 
                                key = {value[0]}
                                idx = {value[0]}
                                item = {value[1]}
                            />
                        );
                    })}
                </TableBody>
            </Table>
        );
    }
}