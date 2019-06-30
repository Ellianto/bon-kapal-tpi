import React from 'react';
import './App.css';
import firebase, {firestore} from './firebase.js';

class NavBar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-expand-md bg-light navbar-light fixed-top">
                <a className="navbar-brand"> Bon Kapal TPI </a>

                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="collapsibleNavbar">
                    <ul className="navbar-nav">
                        <li className="nav-item mx-md-3 mx-auto">
                            <a className="nav-link" href="#inputField"> Input Field </a>
                        </li>
                        <li className="nav-item mx-md-3 mx-auto">
                            <a className="nav-link" href="#dataDisplay"> Data Display </a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

class ComboBox extends React.Component{
    render(){
        return(
            <select value = {this.props.value} id = {this.props.name} name = {this.props.name} className = {this.props.className} required onChange= {this.props.onChange} readonly>
                {this.props.items.map((item, index) => {
                    return(
                        <option value={item.value} key={item.value}>
                            {item.text}
                        </option>
                    );
                })}
            </select>
        );
    }
}
class TransactionPicker extends React.Component{
    constructor(props){
        super(props);

        this.inputPrependClassName = "input-group-prepend col-sm-6 col-md-4 pr-0";
        this.helpTextClassName     = "input-group-text col-sm-12 font-weight-bold";
        this.comboBoxClassName     = "custom-select col-sm-6 col-md-8";
        
        this.items = [
            {
                text    : "Pemasukan",
                value   : "pemasukan",
            },
            {
                text    : "Pengeluaran",
                value   : "pengeluaran",
            },
        ];
    }

    render(){
        return(
            <div className = "form-group">
                <div className = "input-group">
                    <div className = {this.inputPrependClassName}>
                        <span className = {this.helpTextClassName}> Jenis Transaksi </span>
                    </div>
                    <ComboBox name = {this.props.name} className = {this.comboBoxClassName} items = {this.items} value = {this.props.value} onChange={this.props.onChange}/>
                </div>
            </div>
        );
    }
}

class DatePicker extends React.Component{
    constructor(props){
        super(props);

        this.inputPrependClassName = "input-group-prepend col-sm-6 col-md-2 pr-0";
        this.helpTextClassName = "input-group-text col-sm-12 font-weight-bold";
        this.comboBoxClassName = "custom-select col-sm-6 col-md-2";
    }

    render(){
        return(
            <div className = "form-group">
                <div className = "input-group">
                    <div className = {this.inputPrependClassName}>
                        <span className = {this.helpTextClassName}> Tanggal </span>
                    </div>
                    <ComboBox onChange={this.props.onChange} value = {this.props.dateValue} name={this.props.name.day} className={this.comboBoxClassName} items = {this.props.items.days} />

                    <div className={this.inputPrependClassName}>
                        <span className = {this.helpTextClassName}> Bulan </span>
                    </div>
                    <ComboBox onChange={this.props.onMonthOrYearChange} value = {this.props.monthValue} name={this.props.name.month} className={this.comboBoxClassName} items = {this.props.items.months} />

                    <div className={this.inputPrependClassName}>
                        <span className = {this.helpTextClassName}> Tahun </span>
                    </div>
                    <ComboBox onChange={this.props.onMonthOrYearChange} value = {this.props.yearValue} name={this.props.name.year} className={this.comboBoxClassName} items = {this.props.items.years} />
                </div>
            </div>
        );
    }
}

class InfoInput extends React.Component{
    constructor(props){
        super(props);

        this.helpTextClassName      = "input-group-text col-sm-12 font-weight-bold";
        this.inputPrependClassName  = "input-group-prepend col-sm-6 col-md-4 pr-0";
    }

    render(){
        return(
            <div className = "form-group">
                <div className = "input-group">
                    <div className = {this.inputPrependClassName}>
                        <span className = {this.helpTextClassName}> Keterangan </span>
                    </div>
                    <input onChange={this.props.onChange} name = {this.props.name} type="text" placeholder="Masukkan keterangan di sini" required maxLength={50} value={this.props.value} className = "form-control" />
                </div>
            </div>
        );
    }
}

class AmountInput extends React.Component{
    constructor(props){
        super(props);

        this.helpTextClassName = "input-group-text col-sm-12 font-weight-bold";
        this.inputPrependClassName = "input-group-prepend col-sm-6 col-md-4 pr-0";
    }

    render(){
        return(
            <div className = "form-group">
                <div className = "input-group">
                    <div className = {this.inputPrependClassName}>
                        <span className = {this.helpTextClassName}> Jumlah </span>
                    </div>
                    <input onChange={this.props.onChange} name = {this.props.name} type="number" required min={0} max={999999999999} value={this.props.value} step={1000} className = "form-control" placeholder="Masukkan jumlah di sini" />
                </div>
            </div>
        );
    }
}

class SubmitButton extends React.Component{
    render(){
        return(
            <button type="submit" className = "btn btn-info btn-block btn-lg" onClick={this.props.onClick}> 
                Konfirmasi
            </button>
        );
    }
}

class InputField extends React.Component{
    constructor(props){
        super(props);

        this.handleSubmit               = this.handleSubmit.bind(this);
        this.handleStringChange         = this.handleStringChange.bind(this);
        this.handleIntChange            = this.handleIntChange.bind(this);
        this.handleMonthOrYearChange    = this.handleMonthOrYearChange.bind(this);

        const now = new Date();

        this.state = {
            transaction     : 'pemasukan',
            newDay          : now.getDate(),
            newMonth        : now.getMonth() + 1,
            newYear         : now.getFullYear(),
            info            : '',
            amount          : 0,
            arrays          :{
                days: this.populateDays(now.getMonth() + 1, now.getFullYear(), false),
                months  : this.populateMonths(),
                years: this.populateYears(now.getFullYear()),
            }
        };

        this.dateInfo = {
            name: {
                day: "newDay",
                month: "newMonth",
                year: "newYear",
            },
            value: {
                day: this.state.newDay,
                month: this.state.newMonth,
                year: this.state.newYear,
            },
        };
    }

    populateDays(month, year, update){
        let days = [];
        let maxDays = 31;

        let _30DayMonths = month === 4 ||
            month === 6 ||
            month === 9 ||
            month === 11; 

        let monthIsFebruary = month === 2;

        if(_30DayMonths){
            maxDays = 30;
        } else if(monthIsFebruary){
            let isLeapYear = new Date(year, 1, 29).getMonth() === 1;

            if(isLeapYear){
                maxDays = 29;
            } else{
                maxDays = 28;
            }
        }

        for (let i = 1; i <= maxDays; i++) {
            days.push({
                text    : i,
                value   : i,
            });
        }

        if(update){
            let currDay = this.state.newDay;

            while(currDay > days.length){
                currDay--;
            }

            this.setState({
                newDay : currDay,
            });
        }

        return days;
    }

    populateMonths(){
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

    populateYears(currYear){
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

    handleSubmit(){
        //TODO: Implement Cloud Firestore Writes (preferrably Transaction) here
    }

    handleStringChange(e){
        this.setState({
            [e.target.name] : e.target.value,
        });
    }

    handleIntChange(e){
        this.setState({
            [e.target.name] : parseInt(e.target.value),
        });
    }

    handleMonthOrYearChange(e){
        let thisMonth = 0;
        let thisYear = 0;
        let arrays = {
            days : [],
            months : this.state.arrays.months,
            years : this.state.arrays.years,
        };

        if(e.target.name.toLowerCase().includes('month')){
            thisMonth = parseInt(e.target.value);
            thisYear = this.state.newYear;
        } else {
            thisYear = parseInt(e.target.value);
            thisMonth = this.state.newMonth;
        }

        arrays.days = this.populateDays(thisMonth, thisYear, true);

        this.setState({
            [e.target.name] : parseInt(e.target.value),
            arrays  : arrays,
        });
    }

    render(){
        return (
            <div className = "jumbotron bg-secondary">
                <form className = "form-horizontal">
                    <TransactionPicker name="transaction" value = {this.state.transaction} onChange={this.handleStringChange}/>
                    <DatePicker name={this.dateInfo.name} dateValue = {this.state.newDay} monthValue = {this.state.newMonth} yearValue = {this.state.newYear} onMonthOrYearChange={this.handleMonthOrYearChange} onChange={this.handleIntChange} items = {this.state.arrays}/>
                    <InfoInput name="info" value={this.state.info} onChange={this.handleStringChange}/>
                    <AmountInput name="amount" value={this.state.amount} onChange={this.handleIntChange}/>
                    <SubmitButton onClick={this.handleSubmit}/>
                </form>
            </div>
        );
    }
}

class DataDisplay extends React.Component{
    //TODO: Refactor and use DatePicker Component

    render(){
        return (
            <div id = "dataDisplay">
                <form>
                    <div className = "form-group">
                        <label for="startDate"> Tanggal </label>
                        <div className = "input-group">
                            <input type="date" name="startDate" id="startDate" min="1970-01-01" max="2020-01-01" placeholder="Tanggal Awal" className = "form-control" />
                            <div className = "input-group-prepend">
                                <span className = "input-group-text"> - </span>
                            </div>
                            <input type="date" name="endDate" id="endDate" min="1970-01-01" max={Date.now().toString()} placeholder="Tanggal Awal" className = "form-control" />
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class App extends React.Component{
    render(){
        return(
            <div className = "container">
                <NavBar />
                <div className = "mt-5">
                    <InputField />
                    <DataDisplay />
                </div>
            </div>
        );
    }
}

export default App;