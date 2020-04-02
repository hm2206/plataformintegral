import React, { Component, Fragment } from 'react';
import { Skull } from '../Utils';


export default class SkullAuth extends Component
{

    render() {
        return (
            <div className="btn-account d-md-flex">
                <div style={{ width: "2.25rem", height: "2.25rem", overflow: 'hidden', borderRadius: '50%' }}>
                    <Skull height="10em" top="0px" radius="0px" padding="0px"/>
                </div>
                <span className="account-summary pr-lg-4 d-none d-lg-block">
                    <span className="account-name">
                        <Skull height="0.8em"/>
                    </span>{" "}
                    <span className="account-description" style={{ minWidth: "150px" }}>
                        <Skull height="1em"/>
                    </span>
                </span>
            </div>
        );
    }

}