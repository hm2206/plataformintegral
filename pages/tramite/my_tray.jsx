import React, { Component } from 'react';


export default class IndexTramiteInterno extends Component
{

    static getInitialProps = async (ctx) => {
        let { query, pathname } = ctx;
        return { query, pathname }
    } 

    componentDidMount = () => {
        this.props.fireEntity({ render: true });
    }

    render() {
        return (
            <div className="col-md-12">
                hola
            </div>
        )
    }

}