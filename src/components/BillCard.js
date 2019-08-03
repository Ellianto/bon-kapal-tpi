import React from 'react';

import {Card, CardHeader, CardContent, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Badge, Typography} from '@material-ui/core'
import {ExpandMore, Edit, DeleteForever} from '@material-ui/icons';
import {green, red} from '@material-ui/core/colors'

class CustomExpansionPanel extends React.Component {
    render(){
        const type = this.props.type;
        const style = this.props.style;
        const itemKey = this.props.itemKey;
        const itemArr = this.props.itemArr;

        return(
            <ExpansionPanel style={style}>
                <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                    <Badge badgeContent={itemArr.length} max={999} color='primary'>
                        <Typography> {type === 'i' ? 'Pemasukan ' : 'Pengeluaran'} </Typography>
                    </Badge>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ padding: 2 }}>
                    <List dense style={{ width: '100%'}}>
                        {
                            itemArr.map((doc) => {
                                const data = doc[1];

                                return (
                                    <ListItem disableGutters style={{paddingLeft:16}} key={doc[0]}>
                                        <ListItemText primary={decodeURIComponent(data.info)} secondary={this.props.formatCurrency(data.amount)}/>
                                        <ListItemSecondaryAction style={{ right: 4 }}>
                                            <IconButton size='small' onClick={() => {
                                                return this.props.displayDialog(doc, itemKey, type);
                                            }}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton size='small' onClick={() => {
                                                return this.props.deleteData(doc[0], itemKey, type);
                                            }}>
                                                <DeleteForever />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })
                        }
                    </List>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }
}

export default class BillCard extends React.Component {
    constructor(props){
        super(props);

        this.formatDate = this.formatDate.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);
    }

    formatDate(dateString) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const date = dateString.substring(6);

        return `${date}/${month}/${year}`;
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

    render(){
        const itemKey = this.props.itemKey;
        const itemValue = this.props.itemValue;

        return(
            <Card>
                <CardHeader
                    disableTypography
                    title={
                        <Typography style={{width:'100%'}} variant='h5' align='center'>
                            {this.formatDate(itemKey)}
                        </Typography>
                    }
                    subheader={
                        <React.Fragment>
                            <Typography style={{width:'100%'}} variant='caption' align='left' display='block'>
                                Masuk  : {this.formatCurrency(itemValue.isum)}
                            </Typography>
                            <Typography style={{width:'100%'}} variant='caption' align='left' display='block'>
                                Keluar : {this.formatCurrency(itemValue.osum)}
                            </Typography>
                        </React.Fragment>
                    }
                />
                <CardContent>
                    <CustomExpansionPanel type='i'
                        itemKey={itemKey} 
                        itemArr={itemValue.i} 
                        style={{background:green[300]}} 
                        deleteData={this.props.deleteData}
                        formatCurrency={this.formatCurrency}
                        displayDialog={this.props.displayDialog}
                    />
                    
                    <CustomExpansionPanel type='o'
                        itemKey={itemKey}
                        itemArr={itemValue.o}
                        style={{background:red['A200']}}
                        deleteData={this.props.deleteData}
                        formatCurrency={this.formatCurrency}
                        displayDialog={this.props.displayDialog}
                    />
                </CardContent>
            </Card>
        );
    }
};
