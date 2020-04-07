import React,  { Component, Fragment } from 'react';
import { Button } from 'semantic-ui-react';
import Router from 'next/router';

export default class TrabajadorID extends Component
{

    render() {
        return <Fragment>
            <div className="col-md-12">
                <Button
                    onClick={(e) => Router.push({ pathname: "/escalafon/trabajador" })}
                >
                    <i className="fas fa-arrow-left"></i> Atras
                </Button>
            </div>
        </Fragment>
    }

}