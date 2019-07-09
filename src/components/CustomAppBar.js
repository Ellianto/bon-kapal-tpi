import React from 'react'

import {Drawer, ListItemIcon, ListItem, List, ListItemText, AppBar, Toolbar, IconButton, Typography} from '@material-ui/core';
import {Home, Search, Menu, AddCircle} from '@material-ui/icons';
import {styled} from '@material-ui/styles';

const AppTitle = styled(Typography)({
    flexGrow : 1,
})

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDrawer = this.toggleDrawer.bind(this);

        this.state = {
            drawerOpen: false,
        };

        this.navLinks = [
            {
                id: 'home',
                link: '/home',
                icon: <Home />,
                mainText: 'Bon Terbaru',
                helpText: '10 Bon Terbaru',
            },
            {
                id: 'add',
                link: '/add',
                icon: <AddCircle />,
                mainText: 'Tambahkan Bon',
                helpText: 'Tambah Bon baru',
            },
            {
                id: 'show',
                link: '/show',
                icon: <Search />,
                mainText: 'Tampilkan Bon',
                helpText: 'Cari berdasarkan tanggal',
            },
        ];
    }

    toggleDrawer() {
        this.setState({
            drawerOpen: !this.state.drawerOpen,
        });
    }

    render() {
        return (
            <div>
                <AppBar position='static'>
                    <Toolbar>
                        <IconButton disabled color='inherit' size='medium' edge='start' style={{padding : 24}}/>
                        <AppTitle variant='h5' align='center'>
                            Bon Kapal TPI
                        </AppTitle>
                        <IconButton size='medium' color='secondary' edge='end' onClick={this.toggleDrawer}>
                            <Menu />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer open={this.state.drawerOpen} onClose={this.toggleDrawer} anchor='right'>
                    <div role='presentation' onClick={this.toggleDrawer}>
                        <List>
                            {
                                this.navLinks.map((listItem) => (
                                    <ListItemLink href={listItem.link} key={listItem.id}>
                                        <ListItemIcon> {listItem.icon} </ListItemIcon>
                                        <ListItemText primary={listItem.mainText} secondary={listItem.helpText}/>
                                    </ListItemLink>
                                ))
                            }
                        </List>
                    </div>
                </Drawer>
            </div>
        );
    }
}

const CustomAppBar = styled(Navbar)({
    flexGrow: 1,
});

export default CustomAppBar;