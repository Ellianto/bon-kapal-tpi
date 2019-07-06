import React from 'react'
import firebase, {firestore} from '../firebase'

import DatePicker from './DatePicker'
import Button from './Button'
import ExpandableTable from './ExpandableTable'

export default class DataDisplay extends React.Component {
	constructor(props){
		super(props);

		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleMonthOrYearChange = this.handleMonthOrYearChange.bind(this);
		this.fetchData = this.fetchData.bind(this);

		const now = new Date();
		const dateObj = {
			date: now.getDate(),
			month: now.getMonth() + 1,
			year: now.getFullYear(),
			items : {
				dates: this.populateDates(now.getMonth() + 1, now.getFullYear()),
				months: this.populateMonths(),
				years: this.populateYears(now.getFullYear()),
			}
		};

		this.dateNames = {
			start :{
				date : 'startDate',
				month : 'startMonth',
				year : 'startYear',
			},
			end :{
				date : 'endDate',
				month : 'endMonth',
				year : 'endYear',
			},
		}

		this.state = {
		   startDate : dateObj.date,
		   startMonth : dateObj.month,
		   startYear : dateObj.year,
		   startItems : dateObj.items,
		   endDate : dateObj.date,
		   endMonth : dateObj.month,
		   endYear : dateObj.year,
		   endItems : dateObj.items,
		   tableItems : [],
		};
	}

	populateDates(month, year, update=false, start=true) {
		let dates = [];
		let maxDates = 31;

		let _30DayMonths = month === 4 ||
			month === 6 ||
			month === 9 ||
			month === 11;

		let monthIsFebruary = month === 2;

		if (_30DayMonths) {
			maxDates = 30;
		} else if (monthIsFebruary) {
			let isLeapYear = new Date(year, 1, 29).getMonth() === 1;

			if (isLeapYear) {
				maxDates = 29;
			} else {
				maxDates = 28;
			}
		}

		for (let i = 1; i <= maxDates; i++) {
			dates.push({
				text: i,
				value: i,
			});
		}

		if (update) {
			const dateState = start ? 'startDate' : 'endDate';
			let currDate = start ? this.state.startDate : this.state.endDate;

			while (currDate > dates.length) {
				currDate--;
			}

			this.setState({
				[dateState] : currDate,
			});
		}

		return dates;
	}

	populateMonths() {
		const months = [
			{
				text: "Januari",
				value: 1,
			},
			{
				text: "Februari",
				value: 2,
			},
			{
				text: "Maret",
				value: 3,
			},
			{
				text: "April",
				value: 4,
			},
			{
				text: "Mei",
				value: 5,
			},
			{
				text: "Juni",
				value: 6,
			},
			{
				text: "Juli",
				value: 7,
			},
			{
				text: "Agustus",
				value: 8,
			},
			{
				text: "September",
				value: 9,
			},
			{
				text: "Oktober",
				value: 10,
			},
			{
				text: "November",
				value: 11,
			},
			{
				text: "Desember",
				value: 12,
			},
		];

		return months;
	}

	populateYears(currYear) {
		let years = [];

		for (let ctr = 0; ctr <= 30; ctr++) {
			let calcYear = currYear - ctr;

			years.push({
				text: calcYear,
				value: calcYear,
			});
		}

		return years;
	}

	handleDateChange(e) {
		this.setState({
		   [e.target.name]: parseInt(e.target.value),
		});
	}

	handleMonthOrYearChange(e){
		let thisMonth = 0;
		let thisYear = 0;
		let items = {
			dates: [],
			months: this.state.startItems.months,
			years: this.state.startItems.years,
		};

		if (e.target.name.toLowerCase().includes('month')) {
			thisMonth = parseInt(e.target.value);
			thisYear = this.state.startYear;
		} else {
			thisYear = parseInt(e.target.value);
			thisMonth = this.state.startMonth;
		}

		const isStartDate = e.target.name.toLowerCase().includes('start') ? true : false;
		const stateName = isStartDate ? 'startItems' : 'endItems';

		items.dates = this.populateDates(thisMonth, thisYear, true, isStartDate);

		this.setState({
			[e.target.name]: parseInt(e.target.value),
			[stateName]: items,
		});
	}

	fetchData(e){
		e.preventDefault();

		const startDate = this.state.startDate;
		const startMonth = this.state.startMonth;
		const startYear = this.state.startYear;

		const endDate = this.state.endDate;
		const endMonth = this.state.endMonth;
		const endYear = this.state.endYear;

		const startTime = new Date(startYear, startMonth-1, startDate);
		const endTime = new Date(endYear, endMonth-1, endDate);

		const timeOverflow = startTime > endTime;
		const specificDate = startTime.valueOf() === endTime.valueOf();

		const dbRefStart = ((startYear * 10000) + (startMonth * 100) + (startDate)).toString();
		const dbRefEnd = ((endYear * 10000) + (endMonth * 100) + (endDate)).toString();

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
			const singleRef = firestore.collection('data').doc(dbRefStart);

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
				.where(firebase.firestore.FieldPath.documentId(), '>=', dbRefStart)
				.where(firebase.firestore.FieldPath.documentId(), '<=', dbRefEnd);

			console.log(dbRefStart);
			console.log(dbRefEnd);

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
			<div>
				<div id="dataDisplay" className="container">
					<form className='form-horizontal'>
						<div className="container">
							<div className="mx-auto text-center">
								<label htmlFor="start">
									<h3> Batas Awal </h3>
								</label>
							</div>
							<DatePicker
								name={this.dateNames.start}
								dateValue={this.state.startDate}
								monthValue={this.state.startMonth}
								yearValue={this.state.startYear}
								onDateChange={this.handleDateChange}
								onMonthOrYearChange={this.handleMonthOrYearChange}
								items={this.state.startItems}
							/>
						</div>
						<div className="container">
							<div className="mx-auto text-center">
								<label htmlFor="end">
									<h3> Batas Akhir </h3>
								</label>
							</div>
							<DatePicker
								name={this.dateNames.end}
								dateValue={this.state.endDate}
								monthValue={this.state.endMonth}
								yearValue={this.state.endYear}
								onDateChange={this.handleDateChange}
								onMonthOrYearChange={this.handleMonthOrYearChange}
								items={this.state.endItems}
							/>
						</div>
						<Button className="btn btn-primary btn-lg btn-block" text="Tampilkan"
							onClick={this.fetchData}
						/>
					</form>
				</div>
				<div className = "container">
					<ExpandableTable items={this.state.tableItems}/>
				</div>
			</div>
		);
	}
}