import React from 'react'
import ComboBox from './ComboBox'

/**
 * Required props :
 * -> name : an Object {date:String, month:String, year:String} used for input names
 * -> ....Value : initial value, bind to state
 * -> on....Change : event handler, 1 for date change, 1 for month/year change
 * -> items : an Object {dates:Array<Obj>, months:Array<Obj>, years:Array<Obj>} 
 *   => Obj : an Object {text:String, value:String} used to render the <option> tag in the ComboBox Component
 */

export default class DatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.inputPrependClassName = "input-group-prepend col-sm-6 col-md-2 pr-0";
        this.helpTextClassName = "input-group-text col-sm-12 font-weight-bold";
        this.comboBoxClassName = "custom-select col-sm-6 col-md-2";
    }

    render() {
        return (
            <div className="form-group">
                <div className="input-group">
                    <div className={this.inputPrependClassName}>
                        <span className={this.helpTextClassName}> Tanggal </span>
                    </div>
                    <ComboBox onChange={this.props.onDateChange} value={this.props.dateValue} name={this.props.name.date} className={this.comboBoxClassName} items={this.props.items.dates} />

                    <div className={this.inputPrependClassName}>
                        <span className={this.helpTextClassName}> Bulan </span>
                    </div>
                    <ComboBox onChange={this.props.onMonthOrYearChange} value={this.props.monthValue} name={this.props.name.month} className={this.comboBoxClassName} items={this.props.items.months} />

                    <div className={this.inputPrependClassName}>
                        <span className={this.helpTextClassName}> Tahun </span>
                    </div>
                    <ComboBox onChange={this.props.onMonthOrYearChange} value={this.props.yearValue} name={this.props.name.year} className={this.comboBoxClassName} items={this.props.items.years} />
                </div>
            </div>
        );
    }
}