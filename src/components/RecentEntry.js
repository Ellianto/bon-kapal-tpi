import React from 'react';

import {getRecentMethod} from '../firebase';

import {Divider, List, ListItem, ListItemText, Grid, Typography, Box} from '@material-ui/core';
import {red, green} from '@material-ui/core/colors';

export default class RecentEntry extends React.Component{
    constructor(props){
        super(props);

        this.renderListEntry = this.renderListEntry.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);

        this.handleFirebaseErrors = this.handleFirebaseErrors.bind(this);

        this.state = {
            recentEntries : [],
            loaded : false,
        };
    }

    handleFirebaseErrors(err) {
        console.error(err.code);
        this.props.openSnackBar(err.message);
    }

    componentDidMount(){
        this.props.showProgressBar();

        getRecentMethod({}).then(result => {
            if(result.data.resultArray.length > 0){
                this.setState({
                    recentEntries : result.data.resultArray,
                    loaded : true,
                });
            }

            this.props.closeProgressBar();
        }).catch(this.handleFirebaseErrors);
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
        return (
            <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500' alignSelf='center'>
                <Grid container justify='center' alignItems='center' spacing={3}>
                    <Grid item xs={12} md={2} />
                    <Grid container item xs={12} md={8}>
                        <Grid item xs={12}>
                            <Typography variant='h5' align='center'> Bon-Bon Terbaru </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            {
                                this.state.loaded ? 
                                    this.state.recentEntries.length === 0 ?
                                    <Typography variant='h6' align='center'> Belum ada bon baru </Typography>
                                    :
                                    <List dense style={{ width: '100%' }}>
                                        {
                                            this.state.recentEntries.map((entry) => this.renderListEntry(entry))
                                        }
                                    </List>
                                :
                                null
                            }
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={2} />
                </Grid>
            </Box>
        );
    }
}