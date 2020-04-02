import React, { Component } from 'react';

export default class Show extends Component {

    render() {
        let { condicion, children } = this.props;
        if (condicion) return children;
        return null;
    }

}