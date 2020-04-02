import React, { Component } from 'react';

export default class GenerateFile extends Component
{

    state = {
        txt: "text/plain"
    }

    createFile = (data = [], ext) => {
        return new Blob(data, this.state[ext]);
    }

    render() {
        return null
    }

}