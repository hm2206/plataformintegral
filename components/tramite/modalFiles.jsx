import React, { Component } from 'react'
import Modal from '../modal';
import { Form, Tab } from 'semantic-ui-react';
import Router from 'next/router';


const FileInfo = ({ files = [] }) => {

    const getMeta = (path) => {
        let key = path.split('.').pop()
        let metas = {
            pdf: { icon: "fas fa-file-pdf", className: "text-red" },
            docx: { icon: "fas fa-file-word", className: "text-primary" }
        };
        // response
        return metas[key];
    }

    return (
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Archivo</th>
                </tr>
            </thead>
            <tbody>
                {files.map((f, indexF) => 
                    <tr key={`file-tramite-${indexF}`}>
                        <th>
                            <i className={`${getMeta(f).icon} ${getMeta(f).className}`} /> {`${f}`.split('/').pop()}
                        </th>
                        <th>
                            <a href={f} target="_blank" rel="noopener noreferrer">
                                Ver
                            </a>
                        </th>
                    </tr>
                )}
            </tbody>
        </table>
    )
}


export default class ModalFiles extends Component
{

    render() {

        let { origen, tracking } = this.props;

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
                            { menuItem: 'Archivos Originales', render: () => <Tab.Pane><FileInfo files={origen}/></Tab.Pane> },
                            { menuItem: 'Archivos del Seguimiento', render: () => <Tab.Pane><FileInfo files={tracking}/></Tab.Pane> }
                        ]}/>
                    </div>
                </Form>
            </Modal>
        );
    }

}