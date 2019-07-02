import React from 'react'

/**
 * Required props :
 * -> value     : initial value, bind to state
 * -> name      : the name of the variable, also used for id
 * -> className : class name for Bootstrap
 * -> onChange  : function to update state
 * -> items     : array of Object{text:String, value:String} to iterate
 */

export default class ComboBox extends React.Component {
    render() {
        return (
            <select value={this.props.value} id={this.props.name} name={this.props.name} className={this.props.className} required onChange={this.props.onChange} readOnly>
                {this.props.items.map((item) => {
                    return (
                        <option value={item.value} key={item.value}>
                            {item.text}
                        </option>
                    );
                })}
            </select>
        );
    }
}