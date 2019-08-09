import React from 'react'

import {getShipsMethod, deleteBonMethod, getBonsMethod, editBonMethod} from '../firebase'
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

		this.handleFirebaseErrors = this.handleFirebaseErrors.bind(this);

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
			isLoading : false,
		};
	}

	handleFirebaseErrors(err) {
		console.error(err.code);
		this.props.openSnackBar(err.message);

		this.setState({
			isLoading: false,
		});
	}

	componentDidMount() {
		this.setState({
			isLoading: true,
		});
		this.props.showProgressBar();

		getShipsMethod({}).then(result => {
			let shipList = [];
			let shipName = '';

			if (!result.data.isEmpty) {
				shipName = result.data.shipList[0];
				shipList = result.data.shipList;
			}

			this.setState({
				shipList: shipList,
				shipName: shipName,
				isLoading : false,
			});

			this.props.closeProgressBar();
		}).catch(this.handleFirebaseErrors);
	}

	displayDialog(doc, date, type) {
		const data = doc[1];

		this.setState({
			type: type,
			docId: doc[0],
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
		this.setState({
			isLoading: true,
		});

		this.props.showProgressBar();

		const shipName = this.state.shipName;

		const theYear = this.state.chosenYear.toString();
		let theMonth = '0' + this.state.chosenMonth.toString();

		if(theMonth.length > 2){
			theMonth = theMonth.substring(1);
		}

		const params = {
			shipName : shipName,
			startDate: theYear + theMonth + '01',
			endDate: theYear + theMonth + '31',
		};

		getBonsMethod(params).then(result => {
			this.setState({
				items : result.data.bons.sort((a,b) => a[0]-b[0]),
				shownShip : shipName,
				submitted : true,
				isLoading : false,
			});

			this.props.closeProgressBar();
		}).catch(this.handleFirebaseErrors);
	}

	editData() {
		this.setState({
			isLoading: true,
		});

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
				isLoading : false,
			});

			return;
		}

		const params = {
			shipName: this.state.shownShip,
			documentDate: this.state.docDate.substring(0, 8),
			transactionType: this.state.type,
			documentId : this.state.docId,
			isAdd: oldAmount < newAmount,
			newInfo : newInfo,
			newAmount : newAmount,
		};

		editBonMethod(params).then(result => {
			this.setState({
				modalOpen: false,
				type: '',
				docId: '',
				docInfo: '',
				docDate: '',
				docAmount: '0',
				docOldInfo: '',
				docOldAmount: '0',
				isLoading : false,
			});

			this.props.openSnackBar(result.data.responseText);
			this.reloadList();
		}).catch(this.handleFirebaseErrors);
	}

	deleteData(docId, date, type) {
		this.setState({
			isLoading: true,
		});
		this.props.showProgressBar();

		const params = {
			documentId : docId,
			transactionType : type,
			documentDate: date.substring(0, 8),
			shipName : this.state.shownShip,
		};

		deleteBonMethod(params).then(result => {
			this.props.openSnackBar(result.data.responseText);
			this.setState({
				isLoading: false,
			});
			this.reloadList();
		}).catch(this.handleFirebaseErrors);
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