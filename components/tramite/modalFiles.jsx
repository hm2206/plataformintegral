import React, { Component } from 'react'
import Modal from '../modal';
import { Button, Form, Dropdown, Tab } from 'semantic-ui-react';
import Router from 'next/router';


export default class ModalFiles extends Component
{

    render() {

        return (
            <Modal
                show={true}
                md="6"
                {...this.props}
                titulo={<span>Archivos del Trámite</span>}
                classClose="text-white opacity-1"
            >
                <Form className="card-body">
                    <div className="pl-4 mt-4 pr-4">
                        <Tab panes={[
                            { menuItem: 'Archivos Originales', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
                            { menuItem: 'Archivos del Seguimiento', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> }
                        ]}/>
                    </div>
                </Form>
            </Modal>
        );
    }

}