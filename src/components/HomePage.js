import React from 'react';

import {Box, Grid, Card, Typography, CardContent, Button, Zoom} from '@material-ui/core';
import {Home, NoteAdd, PlaylistAdd, Search, Print} from '@material-ui/icons';

export default class HomePage extends React.Component {
    render(){
        const navLinks = [
            {
                id: 'home',
                link: '/home',
                icon: <Home />,
                mainText: 'Home',
                helpText: 'Halaman Utama',
                descText: '',
            },
            null,
            {
                id: 'addBon',
                link: '/add_bon',
                icon: <NoteAdd />,
                mainText: 'Tambah Bon',
                helpText: 'Tambahkan Bon baru',
                descText: 'Halaman untuk menambahkan bon baru. Bon-bon yang ditambahkan harus terikat pada suatu kapal. Pastikan anda sudah menambahkan kapal terlebih dahulu',
            },
            {
                id: 'addShip',
                link: '/add_ship',
                icon: <PlaylistAdd />,
                mainText: 'Tambah Kapal',
                helpText: 'Tambahkan Kapal Baru',
                descText: 'Halaman untuk mendaftarkan kapal baru. Pastikan anda sudah menambahkan kapal yang anda inginkan sebelum menambahkan bon terkait kapal tersebut.',
            },
            null,
            {
                id: 'show',
                link: '/show',
                icon: <Search />,
                mainText: 'Tampilkan Bon',
                helpText: 'Cari berdasarkan tanggal',
                descText: 'Halaman untuk mencari bon. Di halaman ini, anda bisa menampilkan kumpulan bon dari kapal tertentu pada tanggal/bulan/tahun tertentu',
            },
            {
                id: 'print',
                link: '/print',
                icon: <Print />,
                mainText: 'Pembukuan',
                helpText: 'Rekap Tahunan/Bulanan',
                descText: 'Halaman untuk menampilkan hasil rekap tahunan/bulanan untuk kapal yang dicari dalam bentuk tabel yang rapi. Tabel tersebut kemudian dapat dicetak/diprint'
            },
        ];

        return (
            <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                <Grid container direction='row' justify='space-evenly' alignItems='stretch' spacing={3}>
                    {navLinks.map((item, idx) => {
                        if (idx > 0 && item !== null) {
                            return (
                                <Grid item xs={12} md={6} key={item.id}>
                                    <Zoom in style={{ transitionDelay: (idx * 85).toString() + 'ms' }}>
                                        <Card onClick={(e) => { this.props.history.push(item.link); }}>
                                            <CardContent>
                                                <Typography variant='h5' component='p' align='center'> {item.mainText} </Typography>
                                                <Typography variant='body2' align='justify' component='p' style={{ marginBottom: 8, marginTop: 8 }}>
                                                    {item.descText}
                                                </Typography>
                                                <Button variant='outlined' fullWidth size='small'> Pergi ke halaman </Button>
                                            </CardContent>
                                        </Card>
                                    </Zoom>
                                </Grid>
                            );
                        }
                        return null;
                    })}
                </Grid>
            </Box>
        );
    }
};
