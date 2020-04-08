import React, { Component } from 'react';
import Modal from './modal';
import Iframe from 'react-iframe';

export default class SSP extends Component
{

    render() {

        return <Modal 
            {...this.props}  
        >
            <div className="card-body h-100">
                <Iframe 
                    src={this.props.url}
                    SameSite="none"
                    width="100%"
                    height="100%"
                    id="render-ssp"
                    loading="auto"
                    display="initial"
                    position="relative"
                    frameBorder="0"   
                />
            </div>
        </Modal>
    }

}