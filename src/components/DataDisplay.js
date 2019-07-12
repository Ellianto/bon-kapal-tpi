import React from 'react'
import firebase, {firestore} from '../firebase'

import ExpandableTable from './ExpandableTable'
import {Grid, TextField, Button, Snackbar, SnackbarContent} from '@material-ui/core'

//TODO: Implement Loading UI

export default class DataDisplay extends React.Component {
	constructor(props){
		super(props);

		this.fetchData = this.fetchData.bind(this);
		this.formatDate = this.formatDate.bind(this);
		this.reloadTable = this.reloadTable.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleSnackBarOpen = this.handleSnackBarOpen.bind(this);
		this.handleSnackBarClose = this.handleSnackBarClose.bind(this);

		this.state = {
		   	startDate : this.formatDate(),
			endDate: this.formatDate(),
			snackBarOpen : false,
			snackBarMessage : '',
		   	tableItems : [],
		};
	}


	formatDate() {
		const now = new Date();

		let thisYear = now.getFullYear().toString();
		let thisMonth = (now.getMonth() + 1).toString();
		let thisDate = now.getDate().toString();

		if (thisMonth.length === 1) {
			thisMonth = '0' + thisMonth;
		}

		if (thisDate.length === 1) {
			thisDate = '0' + thisDate;
		}

		return `${thisYear}-${thisMonth}-${thisDate}`;
	}

	fetchData(){
		const startDate = this.state.startDate.replace(/-/g, '');

		const startDateValue = new Date(
			parseInt(startDate.substring(0, 4), 10),
			parseInt(startDate.substring(4, 6), 10) - 1,
			parseInt(startDate.substring(6), 10)
		);

		const endDate = this.state.endDate.replace(/-/g, '');

		const endDateValue = new Date(
			parseInt(endDate.substring(0, 4), 10),
			parseInt(endDate.substring(4, 6), 10) - 1,
			parseInt(endDate.substring(6), 10)
		);

		const timeOverflow = startDateValue.valueOf() > endDateValue.valueOf();
		const specificDate = startDateValue.valueOf() === endDateValue.valueOf();
		
		let docMap = new Map();

		const populateMap = async (doc) => {
			const [iCollection, oCollection] = await Promise.all([
				doc.ref.collection('i').get(),
				doc.ref.collection('o').get(),
			]);

			docMap.set(doc.id, {
				...doc.data(),
				i: iCollection.size === 0 ? [] : iCollection.docs,
				o: oCollection.size === 0 ? [] : oCollection.docs,
			});

			return Promise.resolve(true);
		};

		if(timeOverflow){
			this.setState({
				snackBarOpen : true,
				snackBarMessage : 'Masukkan Tanggal yang benar!',
			});
		} else if(specificDate){
			const singleRef = firestore.collection('data').doc(startDate);

			singleRef.get().then((doc) => {
				if(doc.exists){
					return populateMap(doc);
				}

				return Promise.resolve(false);
			}).then((docExists) => {
				if(docExists){
					this.setState({
						tableItems: Array.from(docMap),
					});
				}
			}).catch((err) => {
				console.error(err);
				this.setState({
					snackBarOpen: true,
					snackBarMessage: 'Terjadi kesalahan! Coba lagi!',
				});
			});
		} else {
			const multiRef = firestore.collection('data')
				.where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
				.where(firebase.firestore.FieldPath.documentId(), '<=', endDate);

			multiRef.get().then((querySnapshot) => {
				const promiseArr = querySnapshot.docs.map(populateMap);
				return Promise.all(promiseArr);
			}).then((boolArr) => {
				if(!boolArr.includes(false)){
					this.setState({
						tableItems: Array.from(docMap),
					});
				}
			}).catch((err) => {
				console.error(err);
				this.setState({
					snackBarOpen: true,
					snackBarMessage: 'Terjadi kesalahan! Coba lagi!',
				});
			});
		}
	}

	handleDateChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}

	handleSnackBarClose(event, reason) {
		if (reason === 'clickaway') {
			return;
		}

		this.setState({
			snackBarMessage: '',
			snackBarOpen: false,
		});
	}

	handleSnackBarOpen(msg){
		this.setState({
			snackBarOpen : true,
			snackBarMessage : msg,
		});
	}

	reloadTable(){
		this.setState({
			tableItems : [],
		});

		setTimeout(this.fetchData(), 1000);
	}

	render() {
		return (
			<React.Fragment>
				<Snackbar
					autoHideDuration={2000}
					key={this.state.snackBarMessage}
					open={this.state.snackBarOpen}
					onClose={this.handleSnackBarClose}
					ContentProps={{ 'aria-describedby': 'message' }}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
				>
					<SnackbarContent
						key={this.state.snackBarMessage}
						message={<span id='message'> {this.state.snackBarMessage} </span>}
						action={[<Button key='close' size='small' color='secondary' onClick={this.handleSnackBarClose}> TUTUP </Button>]}
					/>
				</Snackbar>

				<Grid container direction='row' justify='space-evenly' alignItems='center' spacing={6}>
					<Grid container item direction='row' justify='space-around' alignItems='center' spacing={3} xs={12}>
						<Grid item xs={12} md={6}>
							<TextField fullWidth id='startDate' name='startDate' label='Tanggal Awal (mm/dd/yyyy)' type='date' required style={{ width: '100%' }}
								variant='outlined'
								helperText='Masukkan tanggal awal'
								value={this.state.startDate}
								onChange={this.handleDateChange}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField fullWidth id='endDate' name='endDate' label='Tanggal Akhir (mm/dd/yyyy)' type='date' required style={{ width: '100%' }}
								variant='outlined'
								helperText='Masukkan tanggal akhir'
								value={this.state.endDate}
								onChange={this.handleDateChange}
							/>
						</Grid>
					</Grid>
					<Grid item xs={12}>
						<Button variant='contained' color='primary' size='medium' onClick={this.fetchData} fullWidth>
							Cari Bon
						</Button>
					</Grid>
					<Grid item xs={12}>
						<ExpandableTable 
							items={this.state.tableItems} 
							openSnackBar={this.handleSnackBarOpen} 
							reloadTable={this.reloadTable} 
						/>
					</Grid>
				</Grid>
			</React.Fragment>
		);
	}
}