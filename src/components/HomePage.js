import React from 'react';

import {Box, Grid, Card, Typography, CardContent, Button, Zoom} from '@material-ui/core';

export default class HomePage extends React.Component {
    render(){
        return (
            <Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
                <Grid container direction='row' justify='space-evenly' alignItems='stretch' spacing={3}>
                    {this.props.navLinks.map((item, idx) => {
                        if (idx > 0 && item !== null) {
                            return (
                                <Grid item xs={12} md={4} key={item.id}>
                                    <Zoom in style={{ transitionDelay: (idx * 85).toString() + 'ms' }}>
                                        <Card onClick={(e) => { this.props.history.push(item.link); }}>
                                            <CardContent>
                                                <Typography variant='h5' component='p'> {item.mainText} </Typography>
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
