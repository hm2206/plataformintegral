import React, { useState, useEffect, Fragment } from 'react';
import CardInfo from '../cardInfo';
import codeQr from 'qrcode';
import ModalTracking from './modalTracking';
import Show from '../show';

const CardReportTramite = ({ object = {} }) => {

    // estados
    const [current_code_qr, setCurrentCodeQr] = useState(null);
    const [option, setOption] = useState("");

    // generar codigo qr
    const generateCodeQr = async () => {
        let code_qr = await codeQr.toDataURL(object.link)
        .then(res => res)
        .catch(err => null);
        setCurrentCodeQr(code_qr);
    }

    // generar link
    const generateLink = async () => {
        let a = document.createElement('a');
        a.href = object.link;
        a.target = '__blank',
        a.click();
    }

    // montar
    useEffect(() => {
        generateCodeQr();
    }, []);

    // render
    return (
        <Fragment>
            <CardInfo
                img={current_code_qr}
                onShare={generateLink}
                onButton={(e) => setOption("TIMELINE")}
                infos={[
                    {
                        key: "Código",
                        value: <span className="badge badge-dark">{object.slug}</span>
                    },
                    { 
                        key: "Asunto", 
                        value: object.asunto 
                    },
                    { 
                        key: "Dependencia", 
                        value: object.dependencia_origen && object.dependencia_origen.nombre, 
                        className: "capitalize" 
                    },
                    { 
                        key: "Remitente", 
                        value: <span className="text-ellipsis" title={object.person && object.person.fullname}>{object.person && object.person.fullname}</span>, 
                        className: "capitalize" 
                    },
                    { 
                        key: "Tipo Doc.", 
                        value: <span className="badge badge-primary">{object.tramite_type && object.tramite_type.description}</span>, 
                        className: "capitalize" 
                    },
                    { 
                        key: "N° Doc.", 
                        value: object.document_number,
                        className: "capitalize" 
                    },
                    { 
                        key: "Observación", 
                        value: object.observation
                    },
                    { 
                        key: "Estado", 
                        value: <span className={`badge badge-${object.state ? 'warning' : 'success'}`}>{object.state ? 'En curso' : 'Terminado'}</span>
                    },
                ]}
                buttons={[
                    { key: "timeline", icon: 'fas fa-search', title: 'Seguímiento', className: "btn-outline-dark" }
                ]}
            />
            {/* timeline */}
            <Show condicion={option == 'TIMELINE'}>
                <ModalTracking
                    slug={object.slug}
                    isClose={(e) => setOption("")}
                />
            </Show>
        </Fragment>
    )
}

export default CardReportTramite;