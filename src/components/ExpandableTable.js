import React from 'react';
import {Table, TableHead, TableBody, TableRow, TableCell, Button} from '@material-ui/core';

//TODO: Do theming here

class ExpandableRow extends React.Component{
    constructor(props){
        super(props);

        this.readableKey = this.readableKey.bind(this);
        this.toggleIRow = this.toggleIRow.bind(this);
        this.toggleORow = this.toggleORow.bind(this);

        this.state = {
            iExpand : false,
            oExpand : false,
        }

        this.formatter = new Intl.NumberFormat('en-US', {
            style : 'currency', 
            currency : 'IDR',
        });
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
                <Button size = "large" variant="contained" color="primary" disabled>
                    -
                </Button>
            );
        } else {
            iButton = (
                <Button size="large" variant="contained" color="primary" onClick={this.toggleIRow}> 
                    {this.formatter.format(this.props.item.isum)} 
                </Button>
            );
        }

        if(this.props.item.osum === 0){
            oButton = (
                <Button size="large" variant = "contained" color="secondary" disabled>
                    -
                </Button>
            );
        } else {
            oButton = (
                <Button size="large" variant="contained" color="secondary" onClick={this.toggleORow}> 
                    {this.formatter.format(this.props.item.osum)} 
                </Button>
            );
        }

        return(
            <React.Fragment>
                <TableRow>
                    <TableCell> {this.readableKey(this.props.idx)} </TableCell>
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
                            <TableRow>
                                <TableCell>
                                    {data.info}
                                </TableCell>
                                <TableCell colSpan={2}>
                                    {this.formatter.format(data.amount)}
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
                            <TableRow>
                                <TableCell>
                                    {data.info}
                                </TableCell>
                                <TableCell colSpan={2}>
                                    {this.formatter.format(data.amount)}
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
            <Table>
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