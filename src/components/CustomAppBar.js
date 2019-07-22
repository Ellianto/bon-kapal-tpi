import React from 'react'

import {Fade, LinearProgress, Drawer, Divider, ListItemIcon, ListItem, List, ListItemText, AppBar, Toolbar, IconButton, Typography} from '@material-ui/core';
import {Menu, MobileOff} from '@material-ui/icons';
import { fireAuth } from '../firebase';

export default class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDrawer = this.toggleDrawer.bind(this);

        this.state = {
            drawerOpen: false,
        };
    }

    toggleDrawer() {
        this.setState({
            drawerOpen: !this.state.drawerOpen,
        });
    }

    render() {
        return (
            <div style={{flexGrow : 1}}>
                <AppBar position='static'>
                    <Toolbar>
                        {
                            this.props.user ? 
                            <IconButton size='medium' color='secondary' edge='start' onClick={() => {
                                fireAuth.signOut();
                            }}> 
                                <MobileOff /> 
                            </IconButton>
                            :
                            <IconButton disabled color='inherit' size='medium' edge='start' style={{ padding: 24 }} />
                        }
                        <Typography variant='h5' align='center' style={{flexGrow: 1}}>
                            Bon Kapal
                        </Typography>
                        {
                            this.props.user ?
                            <IconButton size='medium' color='secondary' edge='end' onClick={this.toggleDrawer}> <Menu /> </IconButton>
                            :
                            <IconButton disabled color='inherit' size='medium' edge='end' style={{ padding: 24 }} />
                        }
                    </Toolbar>
                    <Fade in={this.props.isLoading} style={{transitionDelay : this.props.isLoading ? '500ms' : '0ms'}}>
                        <LinearProgress color='secondary' />
                    </Fade>
                </AppBar>
                <Drawer open={this.state.drawerOpen} onClose={this.toggleDrawer} anchor='right'>
                    <div role='presentation' onClick={this.toggleDrawer}>
                        <List>
                            {
                                this.props.navLinks.map((listItem, idx) => {
                                    if(listItem === null){
                                        return (
                                            <Divider variant='middle' key={`null${idx}`}/>
                                        );
                                    } else {
                                        return (
                                            <ListItem button component='a' href={listItem.link} key={listItem.id}>
                                                <ListItemIcon> {listItem.icon} </ListItemIcon>
                                                <ListItemText primary={listItem.mainText} secondary={listItem.helpText} />
                                            </ListItem>
                                        );
                                    }
                                })
                            }
                        </List>
                    </div>
                </Drawer>
            </div>
        );
    }
}