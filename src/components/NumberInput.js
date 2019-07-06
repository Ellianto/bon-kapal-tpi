import React from 'react'

export default class NumberInput extends React.Component{
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
                        <span className = {this.helpTextClassName}> {this.props.title} </span>
                    </div>
                    <input required type="number" className="form-control"
                        name={this.props.name} 
                        min={this.props.min} 
                        max={this.props.max} 
                        value={this.props.value} 
                        step={this.props.step} 
                        onChange={this.props.onChange}
                    />
                </div>
            </div>
        );
    }
}