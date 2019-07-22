import React from 'react'

import firebase, {firestore} from '../firebase'
import BillCard from './BillCard'
import EditDialog from './EditDialog';

import {Box, Grid, TextField, Button, Dialog, Typography} from '@material-ui/core'

export default class DataDisplay extends React.Component {
	constructor(props){
		super(props);

		this.displayDialog = this.displayDialog.bind(this);
		this.closeDialog = this.closeDialog.bind(this);
		this.fetchData = this.fetchData.bind(this);
		this.editData = this.editData.bind(this);
		this.deleteData = this.deleteData.bind(this);
		this.reloadList = this.reloadList.bind(this);
		this.handleIntChange = this.handleIntChange.bind(this);
		this.handleStringChange = this.handleStringChange.bind(this);

		const now = new Date();
		const yearNow = now.getFullYear();
		const monthNow = now.getMonth() + 1;

		this.years = [];

		for(let i = 0; i <= 20; i++){
			this.years.push(yearNow - i);
		}

		this.months = [
			{
				value : 1,
				name : 'Januari',
			},
			{
				value : 2,
				name : 'Februari',
			},
			{
				value : 3,
				name : 'Maret',
			},
			{
				value : 4,
				name : 'April',
			},
			{
				value : 5,
				name : 'Mei',
			},
			{
				value : 6,
				name : 'Juni',
			},
			{
				value : 7,
				name : 'Juli',
			},
			{
				value : 8,
				name : 'Agustus',
			},
			{
				value : 9,
				name : 'September',
			},
			{
				value : 10,
				name : 'Oktober',
			},
			{
				value : 11,
				name : 'November',
			},
			{
				value : 12,
				name : 'Desember',
			},
		];

		this.state = {
			shipName : '',
			chosenYear : yearNow,
			chosenMonth: monthNow,
			items : [],
			shipList : [],
			shownShip: '',
			modalOpen: false,
			type: '',
			docId: '',
			docInfo: '',
			docDate: '',
			docAmount: '0',
			docOldInfo: '',
			docOldAmount: '0',
			submitted : false,
		};
	}

	componentDidMount() {

		this.props.showProgressBar();

		const shipRef = firestore.collection('ship');

		shipRef.get().then((querySnapshot) => {
			let shipList = [];

			if (!querySnapshot.empty) {
				querySnapshot.forEach((doc) => shipList.push(doc.id));
			}

			this.setState({
				shipList: shipList,
				shipName: shipList.length === 0 ? '' : shipList[0],
			});

			this.props.closeProgressBar();
		});
	}

	displayDialog(doc, date, type) {
		const data = doc.data();

		this.setState({
			type: type,
			docId: doc.id,
			docInfo: data.info,
			docDate: date,
			docAmount: data.amount.toString(),
			docOldInfo: data.info,
			docOldAmount: data.amount.toString(),
			modalOpen: true,
		});
	}

	closeDialog() {
		this.setState({
			modalOpen: false,
			type: '',
			docId: '',
			docInfo: '',
			docDate: '',
			docAmount: '0',
			docOldInfo: '',
			docOldAmount: '0',
		});
	}

	fetchData(){
		this.props.showProgressBar();

		const shipName = this.state.shipName;

		const theYear = this.state.chosenYear.toString();
		let theMonth = '0' + this.state.chosenMonth.toString();

		if(theMonth.length > 2){
			theMonth = theMonth.substring(1);
		}

		const startDate = theYear + theMonth + '01';
		const endDate = theYear + theMonth + '31';

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
 

		const multiRef = firestore.collection('ship').doc(shipName).collection('bon')
						.where(firebase.firestore.FieldPath.documentId(), '>=', startDate)
						.where(firebase.firestore.FieldPath.documentId(), '<=', endDate);

		multiRef.get().then((querySnapshot) => {
			const promiseArr = querySnapshot.docs.map(populateMap);
			return Promise.all(promiseArr);
		}).then((boolArr) => {
			if (!boolArr.includes(false)) {
				this.setState({
					items : Array.from(docMap),
					shownShip : shipName,
					submitted : true,
				});
				this.props.closeProgressBar();
			} else {
				throw new Error('Terjadi kesalahan! Coba lagi dalam beberapa saat!');
			}

		}).catch((err) => {
			console.error(err.message);
			this.props.openSnackBar('Terjadi kesalahan! Coba lagi dalam beberapa saat!');
		});
	}

	editData() {
		this.props.showProgressBar();

		const oldInfo = this.state.docOldInfo;
		const oldAmount = parseInt(this.state.docOldAmount, 10);

		const newInfo = this.state.docInfo;
		const newAmount = parseInt(this.state.docAmount, 10);

		const noChange = oldInfo === newInfo && oldAmount === newAmount;

		if(noChange) {
			this.setState({
				modalOpen: false,
				type: '',
				docId: '',
				docInfo: '',
				docDate: '',
				docAmount: '0',
				docOldInfo: '',
				docOldAmount: '0',
			});

			return;
		}

		let amountDiff = 0;
		let add = false;

		if (oldAmount > newAmount) {
			amountDiff = oldAmount - newAmount;
		} else {
			amountDiff = newAmount - oldAmount;
			add = true;
		}

		const shipName = this.state.shownShip;

		const docDate = this.state.docDate;
		const dateType = docDate + this.state.type;
		const type = this.state.type;

		const now = (new Date()).valueOf();
		const docYear = docDate.substring(0, 4);
		const docMonth = parseInt(docDate.substring(4, 6), 10);
		const docFullDate = docDate.substring(0, 8);

		const shipRef = firestore.collection('ship').doc(shipName);
		const aggregationRef = shipRef.collection('aggr').doc(docYear);
		const dateRef = shipRef.collection('bon').doc(docFullDate);
		const docRef = dateRef.collection(type).doc(this.state.docId);
		const recentRef = firestore.collection('recent').doc('entry');

		firestore.runTransaction(async (transaction) => {
			const [shipDoc, aggregationDoc, dateDoc, editDoc, recentDoc] = await Promise.all([
				transaction.get(shipRef),
				transaction.get(aggregationRef),
				transaction.get(dateRef),
				transaction.get(docRef),
				transaction.get(recentRef),
			]);

			let shipValue = shipDoc.data();
			let aggregationValue = aggregationDoc.data();
			let recentArr = recentDoc.data().entries;
			let dateValue = dateDoc.data();
			let docValue = editDoc.data();

			if (!aggregationDoc.exists || !recentDoc.exists || !dateDoc.exists || !editDoc.exists || !shipDoc.exists) {
				throw new Error('Document not found');
			}

			docValue.info = newInfo;

			if (add) {
				docValue.amount += amountDiff;

				if (type === 'i') {
					shipValue.isum += amountDiff;
					aggregationValue.isum += amountDiff;
					aggregationValue.months[docMonth].isum += amountDiff;
					dateValue.isum += amountDiff;
				} else if (type === 'o') {
					shipValue.osum += amountDiff;
					aggregationValue.osum += amountDiff;
					aggregationValue.months[docMonth].osum += amountDiff;
					dateValue.osum += amountDiff;
				}
			} else {
				docValue.amount -= amountDiff;

				if (type === 'i') {
					shipValue.isum -= amountDiff;
					aggregationValue.isum -= amountDiff;
					aggregationValue.months[docMonth].isum -= amountDiff;
					dateValue.isum -= amountDiff;
				} else if (type === 'o') {
					shipValue.osum -= amountDiff;
					aggregationValue.osum -= amountDiff;
					aggregationValue.months[docMonth].osum -= amountDiff;
					dateValue.osum -= amountDiff;
				}
			}

			shipValue.lastUp = now;
			aggregationValue.lastUp = now;
			dateValue.lastUp = now;
			docValue.lastUp = now;

			function findEntry(entry) {
				return entry.ref === dateType && entry.ship === shipName;
			}

			const entryIndex = recentArr.findIndex(findEntry);

			if (entryIndex >= 0) {
				recentArr[entryIndex] = {
					amount: newAmount,
					info: newInfo,
					lastUp: now,
					ref: recentArr[entryIndex].ref,
					ship : this.state.shownShip,
				};
			}

			transaction.set(recentRef, { entries: recentArr }, { merge: true });
			transaction.set(shipRef, shipValue, {merge : true});
			transaction.set(aggregationRef, aggregationValue, { merge: true });
			transaction.set(dateRef, dateValue, { merge: true });
			transaction.set(docRef, docValue, { merge: true });

			return Promise.resolve(true);
		}).then(() => {
			console.log('Edit success!');
			this.setState({
				modalOpen: false,
				type: '',
				docId: '',
				docInfo: '',
				docDate: '',
				docAmount: '0',
				docOldInfo: '',
				docOldAmount: '0',
			});

			this.props.openSnackBar('Data berhasil diubah!');
			this.reloadList();
		}).catch((err) => {
			console.error(err.message);
			this.props.openSnackBar('Terjadi kesalahan! Coba lagi dalam beberapa saat');
		});
	}

	deleteData(docId, date, type) {
		this.props.showProgressBar();

		const documentFullDate = date.substring(0, 8);
		const documentYear = documentFullDate.substring(0, 4);
		const documentMonth = documentFullDate.substring(4, 6);

		const documentString = documentFullDate + type;

		const lastUp = (new Date()).valueOf();

		const recentRef = firestore.collection('recent').doc('entry');
		const shipRef = firestore.collection('ship').doc(this.state.shownShip);
		const aggregationRef = shipRef.collection('aggr').doc(documentYear);
		const dateRef = shipRef.collection('bon').doc(documentFullDate);
		const docRef = dateRef.collection(type).doc(docId);

		firestore.runTransaction(async (transaction) => {
			const [recentDoc, shipDoc, aggregationDoc, dateDoc, chosenDoc] = await Promise.all([
				transaction.get(recentRef),
				transaction.get(shipRef),
				transaction.get(aggregationRef),
				transaction.get(dateRef),
				transaction.get(docRef),
			]);

			if (!recentDoc.exists || !aggregationDoc.exists || !chosenDoc.exists || !shipDoc.exists) {
				throw new Error('Invalid Document');
			}

			let recentArr = recentDoc.data().entries;
			let shipValue = shipDoc.data();
			let aggregationValue = aggregationDoc.data();
			let dateValue = dateDoc.data();
			let docValue = chosenDoc.data();

			if (type === 'i') {
				shipValue.isum -= docValue.amount;
				aggregationValue.isum -= docValue.amount;
				aggregationValue.months[parseInt(documentMonth, 10)].isum -= docValue.amount;
				dateValue.isum -= docValue.amount;
			} else {
				shipValue.osum -= docValue.amount;
				aggregationValue.osum -= docValue.amount;
				aggregationValue.months[parseInt(documentMonth, 10)].osum -= docValue.amount;
				dateValue.osum -= docValue.amount;
			}

			aggregationValue.lastUp = lastUp;
			dateValue.lastUp = lastUp;
			shipValue.lastUp = lastUp;

			function findDocument(entry) {
				return entry.ref === documentString;
			}

			const entryIndex = recentArr.findIndex(findDocument);

			if (entryIndex >= 0) {
				recentArr.splice(entryIndex, 1);
			}

			transaction.update(shipRef, shipValue);
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
			this.props.openSnackBar('Data berhasil dihapus!');
			this.reloadList();
		}).catch((err) => {
			console.error(err.message);
			this.props.openSnackBar('Terjadi kesalahan! Coba lagi dalam beberapa saat');
		});
	}

	reloadList(){
		this.setState({
			tableItems : [],
		});

		setTimeout(this.fetchData(), 1000);
	}

	handleIntChange(e) {
		this.setState({
			[e.target.name]: e.target.value == null || e.target.value === '' ? '0' : parseInt(e.target.value.replace(/\./g, ''), 10).toString(),
			submitted : false,
		});
	}

	handleStringChange(e) {
		this.setState({
			[e.target.name]: encodeURIComponent(e.target.value),
			submitted : false,
		});
	}

	render() {
		return (
			<React.Fragment>
				<Dialog
					maxWidth='sm'
					open={this.state.modalOpen}
					onClose={this.closeDialog}
				>
					<EditDialog
						docInfo={this.state.docInfo}
						docAmount={this.state.docAmount}
						stringChange={this.handleStringChange}
						intChange={this.handleIntChange}
						editData={this.editData}
						closeDialog={this.closeDialog}
					/>
				</Dialog>
				<Box m={4} px={2} py={4} borderRadius={16} border={1} borderColor='grey.500'>
					<Grid container direction='row' justify='space-evenly' alignItems='center' spacing={6}>
						<Grid container item direction='row' justify='space-around' alignItems='center' spacing={3} xs={12}>
							<Grid item xs={12} md={4}>
								<TextField required fullWidth select id='shipSelect' name='shipName' label='Nama Kapal' variant='outlined'
									helperText='Nama Kapal yang ingin dicari bonnya'
									value={decodeURIComponent(this.state.shipName)}
									onChange={this.handleStringChange}
									style={{ width: '100%' }}
									SelectProps={{
										native: true,
									}}
								>
									{
										this.state.shipList.length === 0 ?
											<option value=''> </option>
											:
											this.state.shipList.map((ship) => (
												<option value={decodeURIComponent(ship)} key={ship}>
													{decodeURIComponent(ship)}
												</option>
											))
									}
								</TextField>
							</Grid>
							<Grid item xs={12} md={4}>
								<TextField required fullWidth select id='yearSelect' name='chosenYear' label='Tahun' variant='outlined'
									helperText='Tahun dari bon yang ingin dicari'
									value={this.state.chosenYear}
									onChange={this.handleIntChange}
									style={{ width: '100%' }}
									SelectProps={{
										native: true,
									}}
								>
									{
										this.years.map((year) => (
											<option value={year} key={year}>
												{year}
											</option>
										))
									}
								</TextField>
							</Grid>
							<Grid item xs={12} md={4}>
								<TextField required fullWidth select id='monthSelect' name='chosenMonth' label='Bulan' variant='outlined'
									helperText='Bulan dari bon yang ingin dicari'
									value={this.state.chosenMonth}
									onChange={this.handleIntChange}
									style={{ width: '100%' }}
									SelectProps={{
										native: true,
									}}
								>
									{
										this.months.map((month) => (
											<option value={month.value} key={month.name}>
												{month.name}
											</option>
										))
									}
								</TextField>
							</Grid>
						</Grid>
						<Grid item xs={12}>
							<Button fullWidth variant='contained' color='primary' size='large' onClick={this.fetchData} disabled={this.state.shipName === '' ? true : false}>
								Cari Bon
								</Button>
						</Grid>
					</Grid>
				</Box>
				<Grid container justify='center' alignItems='stretch' spacing={3} xs={12}>
					{
						this.state.items.length === 0 ?
							(
								this.state.submitted ?
									<Typography variant='h5'> Tidak ditemukan bon dengan kriteria tersebut </Typography>
									: null
							)
							:
							this.state.items.map((mapObj) => (
								<Grid item xs={12} md={4} key={mapObj[0]}>
									<BillCard
										itemKey={mapObj[0]}
										itemValue={mapObj[1]}
										displayDialog={this.displayDialog}
										deleteData={this.deleteData}
									/>
								</Grid>
							))
					}
				</Grid>
			</React.Fragment>
		);
	}
}