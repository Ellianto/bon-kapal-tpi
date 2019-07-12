import React from 'react';

import {firestore} from '../firebase';
import EditDialog from './EditDialog';

import {Dialog, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography, IconButton, Box} from '@material-ui/core';
import {green, red} from '@material-ui/core/colors'
import { Edit, DeleteForever } from '@material-ui/icons';

class ExpandableRow extends React.Component{
    constructor(props){
        super(props);

        this.readableKey = this.readableKey.bind(this);
        this.toggleIRow = this.toggleIRow.bind(this);
        this.toggleORow = this.toggleORow.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);
        this.renderExpandableRow = this.renderExpandableRow.bind(this);

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

    renderExpandableRow(doc, params){   
        const data = doc.data();

        return (
            <TableRow style={params.style} key = {doc.id}>
                <TableCell align ='left'>
                    <Typography variant='caption'>
                        {decodeURIComponent(data.info)}
                    </Typography>
                </TableCell>
                <TableCell align='center' style={{minWidth:105}}>
                    <Typography variant='caption'>
                        {this.formatCurrency(data.amount)}
                    </Typography>
                </TableCell>
                <TableCell align='center' style={{minWidth:105}}>
                    <Box justify='space-around'>
                        <IconButton size='small' onClick={() => {
                            return this.props.displayDialog(doc, this.props.idx, params.type);
                        }}>
                            <Edit />
                        </IconButton>
                        <IconButton size='small' onClick={() => {
                            return this.props.removeData(doc.id, this.props.idx, params.type);
                        }}>
                            <DeleteForever />
                        </IconButton>
                    </Box>
                </TableCell>
            </TableRow>
        );
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
                    <TableCell align='left'> 
                        <Typography variant='caption'>
                            {this.readableKey(this.props.idx)}    
                        </Typography>    
                    </TableCell>
                    <TableCell align='center'>
                        {iButton}
                    </TableCell>
                    <TableCell align='center'>
                        {oButton}
                    </TableCell>
                </TableRow>
                {
                    this.state.iExpand ? 
                    this.props.item.i.map((doc) => {
                        return this.renderExpandableRow(doc, { type : 'i', style : {background: green[300] }});
                    }) 
                    : null
                }
                {
                    this.state.oExpand ? 
                    this.props.item.o.map((doc) => {
                        return this.renderExpandableRow(doc, { type: 'o', style: { background: red['A200'] } });
                    })   
                    : null
                }
            </React.Fragment>
        );
    }
}

export default class ExpandableTable extends React.Component{
    constructor(props){
        super(props);

        this.editData = this.editData.bind(this);
        this.removeData = this.removeData.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.displayDialog = this.displayDialog.bind(this);
        this.handleIntChange = this.handleIntChange.bind(this);
        this.handleStringChange = this.handleStringChange.bind(this);

        this.state = {
            modalOpen: false,
            docId: '',
            docInfo: '',
            docAmount: '0',
            docOldInfo: '',
            docOldAmount: '0',
            type: '',
            docDate : '',
        }
    }

    editData(){
        const docDate = this.state.docDate;

        const oldInfo = this.state.docOldInfo;
        const oldAmount = parseInt(this.state.docOldAmount, 10);

        const newInfo = this.state.docInfo;
        const newAmount = parseInt(this.state.docAmount, 10);

        const noChange = oldInfo === newInfo && oldAmount === newAmount;

        if(noChange){
            this.setState({
                modalOpen: false,
                docId: '',
                docInfo: '',
                docAmount: '0',
                docOldInfo: '',
                docOldAmount: '0',
                type: '',
                docDate: '',
            });
            
            return;
        }
        
        let amountDiff = 0;
        let add = false;

        if(oldAmount > newAmount){
            amountDiff = oldAmount - newAmount;
        } else {
            amountDiff = newAmount - oldAmount;
            add = true;
        }

        const dateType = docDate + this.state.type;

        const now = (new Date()).valueOf();
        const docYear = docDate.substring(0,4);
        const docMonth = parseInt(docDate.substring(4,6), 10);
        const docFullDate = docDate.substring(0,8);

        const aggregationRef = firestore.collection('aggr').doc(docYear);
        const recentRef = firestore.collection('recent').doc('entry');
        const dateRef = firestore.collection('data').doc(docFullDate);
        const docRef = dateRef.collection(this.state.type).doc(this.state.docId);

        firestore.runTransaction(async(transaction) => {
            const [aggregationDoc, recentDoc, dateDoc, editDoc] = await Promise.all([
                transaction.get(aggregationRef),
                transaction.get(recentRef),
                transaction.get(dateRef),
                transaction.get(docRef),
            ]);

            if(!aggregationDoc.exists || !recentDoc.exists || !dateDoc.exists || !editDoc.exists){
                throw 'Document not found';
            }

            let aggregationValue = aggregationDoc.data();
            let recentArr = recentDoc.data().entries;
            let dateValue = dateDoc.data();
            let docValue = editDoc.data();

            docValue.info = newInfo;

            if(add){
                docValue.amount += amountDiff;

                if(this.state.type === 'i'){
                    aggregationValue.isum += amountDiff;
                    aggregationValue.months[docMonth].isum += amountDiff;
                    dateValue.isum += amountDiff;
                } else if(this.state.type === 'o'){
                    aggregationValue.osum += amountDiff;
                    aggregationValue.months[docMonth].osum += amountDiff;
                    dateValue.osum += amountDiff;
                }
            } else {
                docValue.amount -= amountDiff;

                if (this.state.type === 'i') {
                    aggregationValue.isum -= amountDiff;
                    aggregationValue.months[docMonth].isum -= amountDiff;
                    dateValue.isum -= amountDiff;
                } else if (this.state.type === 'o') {
                    aggregationValue.osum -= amountDiff;
                    aggregationValue.months[docMonth].osum -= amountDiff;
                    dateValue.osum -= amountDiff;
                }
            }

            aggregationValue.lastUp = now;
            dateValue.lastUp = now;
            docValue.lastUp = now;

            function findEntry(entry){
                return entry.ref === dateType;
            }

            const entryIndex = recentArr.findIndex(findEntry);

            if(entryIndex >= 0){
                recentArr[entryIndex] = {
                    amount : newAmount,
                    info : newInfo,
                    lastUp : now,
                    ref : recentArr[entryIndex].ref,
                }
            }
            
            transaction.set(recentRef, {entries : recentArr}, {merge : true});
            transaction.set(aggregationRef, aggregationValue, { merge: true });
            transaction.set(dateRef, dateValue, { merge: true });
            transaction.set(docRef, docValue, { merge: true });

            return Promise.resolve(true);
        }).then(() => {
            console.log('Edit success!');
            this.setState({
                modalOpen: false,
                docId: '',
                docInfo: '',
                docAmount: '0',
                docOldInfo: '',
                docOldAmount: '0',
                type: '',
                docDate: '',
            });

            this.props.openSnackBar('Data berhasil diubah!');
            this.props.reloadTable();
        }).catch((err) => {
            console.error(err);

            this.props.openSnackBar('Terjadi kesalahan! Coba lagi dalam beberapa saat');
        });
    }

    removeData(docId, docIndex, type) {
        const documentFullDate = docIndex.substring(0, 8);
        const documentYear = documentFullDate.substring(0, 4);
        const documentMonth = documentFullDate.substring(4, 6);

        const documentString = documentFullDate + type;

        const lastUp = (new Date()).valueOf();

        const recentRef = firestore.collection('recent').doc('entry');
        const aggregationRef = firestore.collection('aggr').doc(documentYear);
        const dateRef = firestore.collection('data').doc(documentFullDate);
        const docRef = dateRef.collection(type).doc(docId);

        firestore.runTransaction(async (transaction) => {
            const [recentDoc, aggregationDoc, dateDoc, chosenDoc] = await Promise.all([
                transaction.get(recentRef),
                transaction.get(aggregationRef),
                transaction.get(dateRef),
                transaction.get(docRef),
            ]);

            if (!recentDoc.exists || !aggregationDoc.exists || !chosenDoc.exists) {
                throw 'Invalid Document';
            }

            let aggregationValue = aggregationDoc.data();
            let recentArr = recentDoc.data().entries;
            let dateValue = dateDoc.data();
            let docValue = chosenDoc.data();

            if (type === 'i') {
                aggregationValue.isum -= docValue.amount;
                aggregationValue.months[parseInt(documentMonth, 10)].isum -= docValue.amount;
                dateValue.isum -= docValue.amount;
            } else {
                aggregationValue.osum -= docValue.amount;
                aggregationValue.months[parseInt(documentMonth, 10)].osum -= docValue.amount;
                dateValue.osum -= docValue.amount;
            }

            aggregationValue.lastUp = lastUp;
            dateValue.lastUp = lastUp;

            function findDocument(entry) {
                return entry.ref === documentString;
            }

            const entryIndex = recentArr.findIndex(findDocument);

            if (entryIndex >= 0) {
                recentArr.splice(entryIndex, 1);
            }

            transaction.update(aggregationRef, aggregationValue);
            transaction.update(recentRef, { entries: recentArr });
            transaction.delete(docRef);

            if (dateValue.isum === 0 && dateValue.osum === 0) {
                transaction.delete(dateRef);
            } else {
                transaction.update(dateRef, dateValue);
            }

            return Promise.resolve(true);
        }).then(() => {
            console.log('Delete Success!');

            this.props.openSnackBar('Data berhasil dihapus!');
            this.props.reloadTable();
        }).catch((err) => {
            console.error(err);

            this.props.openSnackBar('Terjadi kesalahan! Coba lagi dalam beberapa saat');
        });
    }

    closeDialog() {
        this.setState({
            modalOpen: false,
            docDate : '',
            docId: '',
            docInfo: '',
            docAmount: '0',
            docOldInfo : '',
            docOldAmount: '0',
            type: '',
        });
    }

    displayDialog(doc, date, type){
        const data = doc.data();

        this.setState({
            modalOpen : true,
            docDate : date,
            docId : doc.id,
            docInfo : data.info,
            docAmount : data.amount.toString(),
            docOldInfo : data.info,
            docOldAmount : data.amount.toString(),
            type : type,
        });
    }

    handleIntChange(e) {
        this.setState({
            [e.target.name]: e.target.value == null || e.target.value === '' ? '0' : parseInt(e.target.value.replace(/\./g, ''), 10).toString(),
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
                <Table size='small' padding='none'>
                    <TableHead>
                        <TableRow>
                            <TableCell align = 'center'> Tanggal </TableCell>
                            <TableCell align = 'center'> Pemasukan </TableCell>
                            <TableCell align = 'center'> Pengeluaran </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            this.props.items.length === 0 ?
                            <TableRow>
                                    <TableCell colSpan={3} align='center'> 
                                        <Typography variant='h6'> 
                                            <em> Tidak ada data untuk ditampilkan </em> 
                                        </Typography>
                                    </TableCell>
                            </TableRow>
                            :
                            this.props.items.map((value) => {
                                return (
                                    <ExpandableRow
                                        key={value[0]}
                                        idx={value[0]}
                                        item={value[1]}
                                        removeData={this.removeData}
                                        displayDialog={this.displayDialog}
                                    />
                                );
                            })
                        }
                    </TableBody>
                </Table>
                <Dialog
                    maxWidth='sm'
                    open={this.state.modalOpen}
                    onClose={this.closeDialog}
                >
                    <EditDialog 
                        docId={this.state.docId}
                        docInfo={this.state.docInfo}
                        docAmount={this.state.docAmount} 
                        docOldAmount={this.state.docOldAmount}
                        type={this.state.type} 
                        editData={this.editData}
                        closeDialog={this.closeDialog}
                        handleIntChange={this.handleIntChange}
                        handleStringChange={this.handleStringChange}
                    />
                </Dialog>
            </React.Fragment>
        );
    }
}