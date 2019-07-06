import React from 'react'
import {firestore} from '../firebase.js';

import TransactionPicker from './TransactionPicker'
import DatePicker from './DatePicker'
import Button from './Button'
import TextInput from './TextInput'
import NumberInput from './NumberInput'

export default class InputForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleIntChange = this.handleIntChange.bind(this);
        this.handleStringChange = this.handleStringChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleMonthOrYearChange = this.handleMonthOrYearChange.bind(this);

        const now = new Date();
        const thisDate = now.getDate();
        const thisMonth = now.getMonth() + 1;
        const thisYear = now.getFullYear();

        this.state = {
            transaction: 'pemasukan',
            newDate : thisDate,
            newMonth: thisMonth,
            newYear: thisYear,
            info: '',
            amount: 0,
            items: {
                dates: this.populateDates(thisMonth, thisYear),
                months: this.populateMonths(),
                years: this.populateYears(thisYear),
            }
        };

        this.inputName = {
            date: "newDate",
            month: "newMonth",
            year: "newYear",
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

    handleSubmit(e) {
        e.preventDefault();

        const thisDate = this.state.newDate;
        const thisMonth = this.state.newMonth;
        const thisYear = this.state.newYear;

        const now = new Date();
        const inputDate = new Date(thisYear, thisMonth-1, thisDate);

        const timeOverflow = inputDate > now;

        if(timeOverflow){
            alert("Masukkan Tanggal yang benar! Maksimal adalah tanggal hari ini!");
            return;
        }

        const thisAmount = this.state.amount;
        const timeNow = now.valueOf();

        const newEntry = {
            amount: thisAmount,
            info: this.state.info,
            lastUp : timeNow,
        };

        const thisTrans = this.state.transaction;
        const isIncome = thisTrans === 'pemasukan';

        const refPath = ((thisYear * 10000) + (thisMonth * 100) + (thisDate)).toString();
        const endPath = isIncome ? 'i' : 'o';

        const recentRef = firestore.collection('recent').doc('entry');

        const aggregationRef = firestore.collection('aggr').doc(thisYear.toString());

        const dateRef = firestore.collection('data').doc(refPath);
        const newRef = dateRef.collection(endPath).doc();

        firestore.runTransaction(async (transaction) => {

            const [aggregationDoc, recentDoc, dateDoc] = await Promise.all([
                transaction.get(aggregationRef), 
                transaction.get(recentRef),
                transaction.get(dateRef),
            ]);

            let aggregationValue;

            if(aggregationDoc.exists){
                aggregationValue = aggregationDoc.data();
            } else {
                let newArr = [];

                for(let i = 0; i <= 13; i++){
                    newArr.push({
                        isum : 0,
                        osum : 0,
                    });
                }

                aggregationValue = {
                    isum : 0,
                    osum : 0,
                    lastUp : 0,
                    months : newArr,
                };
            }

            let dateEntry = dateDoc.exists ? dateDoc.data() : { isum: 0, osum: 0, lastUp: 0 };
            let recentArr = recentDoc.exists ? recentDoc.data().entries : [];

            const newLength = recentArr.unshift({ ref: refPath + endPath, ...newEntry});

            if (newLength > 10) {
                recentArr.pop();
            }

            if(isIncome){
                dateEntry.isum += thisAmount;
                aggregationValue.isum += thisAmount;
                aggregationValue.months[thisMonth].isum += thisAmount;
            } else {
                dateEntry.osum += thisAmount;
                aggregationValue.osum += thisAmount;
                aggregationValue.months[thisMonth].osum += thisAmount;
            }

            dateEntry.lastUp = timeNow;
            aggregationValue.lastUp = timeNow;

            transaction.set(aggregationRef, aggregationValue, {merge : true});
            transaction.set(recentRef, {entries : recentArr}, {merge : true});
            transaction.set(dateRef, dateEntry, {merge: true});
            transaction.set(newRef, newEntry, {merge: true});

            return Promise.resolve(true);
        }).then(() => {
            alert("Data Berhasil Disimpan!");

            this.setState({
                transaction: 'pemasukan',
                newDate: now.getDate(),
                newMonth: now.getMonth() + 1,
                newYear: now.getFullYear(),
                info: '',
                amount: 0,
                items: {
                    dates: this.populateDates(now.getMonth() + 1, now.getFullYear(), false),
                    months: this.populateMonths(),
                    years: this.populateYears(now.getFullYear()),
                }
            });
        }).catch((err) => {
            console.error(err);
        });
    }

    handleStringChange(e) {
        this.setState({
            [e.target.name]: encodeURIComponent(e.target.value),
        });
    }

    handleDateChange(e) {
        this.setState({
            [e.target.name]: parseInt(e.target.value),
        });
    }

    handleMonthOrYearChange(e) {
        let thisMonth = 0;
        let thisYear = 0;
        let items = {
            dates: [],
            months: this.state.items.months,
            years: this.state.items.years,
        };

        if (e.target.name.toLowerCase().includes('month')) {
            thisMonth = parseInt(e.target.value);
            thisYear = this.state.newYear;
        } else {
            thisYear = parseInt(e.target.value);
            thisMonth = this.state.newMonth;
        }

        items.dates = this.populateDates(thisMonth, thisYear, true);

        this.setState({
            [e.target.name]: parseInt(e.target.value),
            items: items,
        });
    }

    handleIntChange(e){
        this.setState({
            [e.target.name] : (e.target.value > 0 ? parseInt(e.target.value.toString(), 10) : 0),
        });
    }

    render() {
        return (
            <div className="jumbotron bg-secondary">
                <form className="form-horizontal">
                    <TransactionPicker name="transaction" title="Jenis Transaksi"
                        value={this.state.transaction}
                        onChange={this.handleStringChange}
                    />

                    <DatePicker
                        name={this.inputName}
                        dateValue={this.state.newDate}
                        monthValue={this.state.newMonth}
                        yearValue={this.state.newYear}
                        onDateChange={this.handleDateChange}
                        onMonthOrYearChange={this.handleMonthOrYearChange}
                        items={this.state.items}
                    />

                    <TextInput name="info" placeholder="Masukkan Keterangan di sini" title="Keterangan"
                        maxLength={50}
                        value={decodeURIComponent(this.state.info)}
                        onChange={this.handleStringChange}
                    />

                    <NumberInput name="amount" title="Jumlah"
                        min={0}
                        max={9999999999}
                        value={this.state.amount}
                        step={1000}
                        onChange={this.handleIntChange}
                    />

                    <Button className="btn btn-primary btn-lg col-12" text="Konfirmasi"
                        onClick={this.handleSubmit}
                    />
                </form>
            </div>
        );
    }
}