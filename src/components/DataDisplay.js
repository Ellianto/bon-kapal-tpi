import React from 'react'
import firebase, {firestore} from '../firebase'

import ExpandableTable from './ExpandableTable'
import {Grid, TextField, Button} from '@material-ui/core'

export default class DataDisplay extends React.Component {
	constructor(props){
		super(props);

		this.fetchData = this.fetchData.bind(this);
		this.formatDate = this.formatDate.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);

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

	handleDateChange(e) {
		this.setState({
			[e.target.name]: e.target.value,
		});
	}

	fetchData(e){
		e.preventDefault();

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
			alert("Mohon masukkan tanggal yang benar! Batas awal harus lebih awal daripada batas akhir!");
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
			});
		}
	}

	render() {
		return (
			<React.Fragment>
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
						<ExpandableTable items={this.state.tableItems} />
					</Grid>
				</Grid>
			</React.Fragment>
		);
	}
}