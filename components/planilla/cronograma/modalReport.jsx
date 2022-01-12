import React from 'react'
import Modal from '../../modal';
import BasicReport from './basicReport';

const ModalReport = ({ cronograma, isClose }) => {

    // render
    return (
            <Modal
                show={true}
                titulo={<span><i className="far fa-file-alt"></i> Reportes</span>}
                md="10"
                isClose={isClose}
            >
                <div className="card-body" style={{ height: '80vh' }}>
                    <BasicReport cronograma={cronograma} basic/>
                </div>
            </Modal>
    );
}

export default ModalReport;