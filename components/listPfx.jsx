import React, { useEffect, useState } from 'react';
import { signature } from '../services/apis';
import { AppContext } from '../contexts/AppContext'
import Skeleton from 'react-loading-skeleton'
import { Fragment } from 'react';
import Show from './show';

const ListPfx = ({ classSkeleton = null, classBody = null, onClick = null, disabled = false, person_id = null }) => {

    // estatos
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_certificates, setCurrentCertificates] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_select, setCurrentSelect] = useState(undefined);

    // obtener certificados del auth
    const getCertificate = async (add = false) => {
        setCurrentLoading(true);
        await signature.get(`person/${person_id}/certificate?page=${current_page}`)
            .then(res => {
                let { success, message, certificates } = res.data;
                if (!success) throw new Error(message);
                let { lastPage, data } = certificates
                // setting data
                setCurrentCertificates(add ? [...current_certificates, ...data] : data);
                // next datos
                if (lastPage >= current_page + 1) setCurrentPage(current_page + 1);
            }).catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        if (person_id) getCertificate();
    }, [person_id]);

    // render
    return <Fragment>
        {current_certificates.map((cer, indexC) => 
            <div className={`card-body ${classBody}`} key={`certificate-list-${indexC}`}
                style={{ cursor: 'pointer' }}
            >
                <div className={`card ${disabled ? 'disabled' : ''} ${current_select == indexC ? 'alert alert-success' : ''}`} onClick={(e) => {
                    if (!disabled) {
                        setCurrentSelect(indexC)
                        cer._index = indexC;
                        typeof onClick == 'function' ? onClick(e, cer) : null
                    }
                }}>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-12 mb-2 font-10">
                                <b>{cer.serial_number}</b>
                                <hr/>
                                <div>CommonName: <b>{cer?.subject?.commonName || ""}</b></div>
                                <div>serialName: <b>{cer?.subject?.serialName || ""}</b></div>
                                <div>emailAddress: <b>{cer?.subject?.emailAddress || ""}</b></div>
                                <div>title: <b>{cer?.subject?.title || cer?.subject?.organizationName || ""}</b></div>
                            </div>
                        </div>
                    </div>
                </div> 
            </div>   
        )}

        <Show condicion={!current_loading && !current_certificates.length}>
            <div className="card-body text-center">
                <b className="text-muted">No se encontrarón certificados</b>
            </div>
        </Show>

        <Show condicion={current_loading}>
            <div className={classSkeleton}>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3 mb-2">
                            <Skeleton width="100%" height="50px"/>
                        </div>

                        <div className="col-md-9 mb-2">
                            <Skeleton width="100%" height="50px"/>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    </Fragment>;
}

export default ListPfx;