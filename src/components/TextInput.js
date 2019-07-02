import React from 'react'

export default class TextInput extends React.Component {
    constructor(props) {
        super(props);

        this.helpTextClassName = "input-group-text col-sm-12 font-weight-bold";
        this.inputPrependClassName = "input-group-prepend col-sm-6 col-md-4 pr-0";
    }

    render() {
        return (
            <div className="form-group">
                <div className="input-group">
                    <div className={this.inputPrependClassName}>
                        <span className={this.helpTextClassName}> {this.props.title} </span>
                    </div>
                    <input required type="text" className="form-control"
                        onChange={this.props.onChange}
                        name={this.props.name}
                        placeholder={this.props.placeholder}
                        maxLength={this.props.maxLength}
                        value={this.props.value}
                    />
                </div>
            </div>
        );
    }
}