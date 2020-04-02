import React, { Component } from 'react';

export default class Allow extends Component
{

    constructor(props) {
        super(props);
    }

    render() {

        let { children, name, method } = this.props;

        if (name == method) return children;

        return null;
    }

} 
