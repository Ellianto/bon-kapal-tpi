import React from 'react'
import firebase, {firestore, firedb} from '../firebase'

import DatePicker from './DatePicker'
import Button from './Button'

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
		};
	}

	populateDates(month, year, update=false) {
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
			// TODO: Fix this
			let currDate = this.state.newDate;

			while (currDate > dates.length) {
				currDate--;
			}

			this.setState({
				newDate: currDate,
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

		items.dates = this.populateDates(thisMonth, thisYear, true);

		this.setState({
			[e.target.name]: parseInt(e.target.value),
			items: items,
		});
	}

	fetchData(e){
		e.preventDefault();

		const startDate = new Date(this.state.startYear, this.state.startMonth, this.state.startDate);
		const endDate = new Date(this.state.endYear, this.state.endMonth, this.state.endDate);

		const monthAlias = ['', 'jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'ags', 'sep', 'okt', 'nov', 'des'];

		const dateOverflow = startDate > endDate;
		const specificDate = startDate === endDate;

		// TODO: Implement Data Fetching and React Table here

		if(dateOverflow){
			alert("Mohon masukkan tanggal yang benar! Batas awal harus lebih awal daripada batas akhir!");
		} else if(specificDate){
			
		} else {

		}
	}

	render() {
		return (
			<div id="dataDisplay" className = "container">
				<form className = 'form-horizontal'>
					<div className = "container">
						<div className = "mx-auto text-center">
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
					<div className = "container">
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
					<Button className= "btn btn-primary btn-lg btn-block" text = "Tampilkan"
						onClick ={this.fetchData}
					/>
				</form>
			</div>
		);
	}
}