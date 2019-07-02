import React from 'react'
import ComboBox from './ComboBox'

export default class TransactionPicker extends React.Component{
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
                        <span className = {this.helpTextClassName}> {this.props.title} </span>
                    </div>
                    <ComboBox 
                        name = {this.props.name} 
                        className = {this.comboBoxClassName} 
                        items = {this.items} 
                        value = {this.props.value} 
                        onChange={this.props.onChange}
                    />
                </div>
            </div>
        );
    }
}