import React, { Component } from 'react';

export default class Logo extends Component
{

    render() {

        let { my_app } = this.props;

        return (
            <h3>
                <img src={my_app && my_app.icon} alt={my_app.name} style={{ width: "30px", marginRight: "0.3em", borderRadius: '0.2em' }}/>
                {my_app.name || "Integración"}
            </h3>
        );
    }

}