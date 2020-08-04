import React, { Component, Fragment } from 'react';
import { Skull } from '../Utils';

export default class SkullNavigation extends Component {


    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Fragment>
                <br/>
                <Skull height="10em" radius="0.4em"/>
                <br/>
                <div style={{ paddingLeft: "2em" }}>
                    <Skull height="30em" radius="0.4em"/>
                </div>
                <br/>
                <Skull height="2em" radius="0.4em"/>
            </Fragment>
        );
    }

}