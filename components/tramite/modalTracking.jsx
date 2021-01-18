import React, { useState, useContext, useEffect } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form, List, Image } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite } from '../../services/apis';
import Show from '../show';
import moment from 'moment';
import ModalFiles from './modalFiles';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import CallMissedOutgoingRoundedIcon from '@material-ui/icons/CallMissedOutgoingRounded';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import CloseIcon from '@material-ui/icons/Close';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ChatIcon from '@material-ui/icons/Chat';
import Swal from 'sweetalert2';


const ModalTracking = ({ isClose = null, slug = "" }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_error, setIsError] = useState(false);


    const getTracking = async (add = false) => {
        setCurrentLoading(true);
        await tramite.get(`tramite/${slug}/timeline`)
            .then(res => {
                let { trackings, success, message } = res.data;
                if (!success) throw new Error(message);
                setCurrentPage(trackings.page);
                setCurrentTotal(trackings.total);
                setCurrentLastPage(trackings.lastPage);
                setDatos(add ? [...datos, ...trackings.data] : trackings.data);
                setIsError(false);
            }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // montar componentes
    useEffect(() => {
        getTracking();
    }, []);

    // state = {
    //     view_file: {
    //         show: false,
    //         origen: [],
    //         tracking: []
    //     },
    //     loader: false,
    //     tracking: {
    //         total: 0,
    //         page: 1,
    //         lastPage: 1,
    //         data: []
    //     },
    //     query_search: ""
    // }
    
    // const handlePage = async (nextPage) => {
    //     this.setState({ loader: true });
    //     let { tramite } = this.props;
    //     await this.getTracking(tramite && tramite.slug, nextPage, true);
    // }


    // openFiles = async (tracking) => {
    //     this.setState((state, props) => {
    //         state.view_file.show = true;
    //         state.view_file.origen = props.tramite.tramite_files;
    //         state.view_file.tracking = tracking.files;
    //         return { view_file: state.view_file }
    //     }); 
    // }

    // obtener meta datos
    const getMetadata = (status) => {
        let icons = {
            DERIVADO: { icon: <CallMissedOutgoingRoundedIcon style={{ color: '#5e35b1' }} />, message: "La dependencia ha derivado el documento a: " , color: '#5e35b1' },
            ACEPTADO: { icon: <CheckCircleOutlineOutlinedIcon fontSize="large" style={{ color: '#346cb0' }} />, message: "Fue Aceptado en: ", color: '#346cb0' },
            RECHAZADO: { icon: <CloseIcon style={{ color: '#b76ba3' }} />, message: "", color: '#b76ba3' },
            ANULADO: { icon: <DeleteForeverIcon style={{ color: '#ea6759' }} />, message: "", color: '#ea6759' },
            ENVIADO: { icon: <SendRoundedIcon style={{ color: '#f7c46c' }} />, message: "", color: '#f7c46c' },
            FINALIZADO: { icon: <DoneAllIcon style={{ color: '#00a28a' }} />, message: "Puede ir a recoger su Documento en: ", color: '#00a28a' },
            RESPONDIDO: { icon: <ChatIcon style={{ color: '#ec935e' }} />, message: "La Oficina respondió a: ", name: "RESPUESTA", color: '#ec935e' }
        };
        // response
        return icons[status] || {};
    }

    // imprimir tracking
    const getPrint = async () => {
        this.setState({ loader: true })
        console.log(this.props.tramite);
        await tramite.get(`report/tracking/${this.props.tramite.tramite_id}`, { responseType: 'blob' })
            .then(({data}) => {
                let a = document.createElement('a');
                a.target = '_blank';
                a.href = URL.createObjectURL(data);
                a.click();
            }).catch(err => {
                Swal.fire({ icon: 'error', text: err.message });
            });
        this.setState({ loader: false })
    }
 

    return (
        <Modal
            show={true}
            md="10"
            isClose={isClose}
            titulo={
                <span>
                <button className="mr-2 btn btn-sm btn-primary">
                    <i className="fas fa-print"></i>
                </button> Seguimiento del Trámite <span className="badge badge-dark"></span>
            </span>
        }>
            <div className="card-body">
                <VerticalTimeline className="line-gray timeline-h-100">
                    {datos.map((d, indexD) => 
                        <VerticalTimelineElement
                            key={`tracking-timeline-${indexD}`}
                            className="vertical-timeline-element--work mb-3"
                            date={moment(d.created_at).lang('es').format('h:mm a')}
                            iconStyle={{ background: '#fff', color: getMetadata(d.status).color, border: `2px solid ${getMetadata(d.status).color || '#78909c'}` }}
                            icon={getMetadata(d.status).icon}
                            contentArrowStyle={{ borderRight: `10px solid ${getMetadata(d.status).color || '#78909c'}` }}
                            contentStyle={{ border: `4px solid ${getMetadata(d.status).color || '#78909c'}` }}
                        >
                            <h3 className="vertical-timeline-element-title text-center mb-3">{getMetadata(d.status).name || d.status}</h3>
                            <h4 className="vertical-timeline-element-subtitle">Lugar de destino: <span className="badge badge-dark mr-1">{`${d.dependencia_destino && d.dependencia_destino.nombre}`.toUpperCase()}</span></h4>
                            <h4 className="vertical-timeline-element-subtitle">Persona: <span className="badge badge-dark mr-1">{`${d.person && d.person.fullname || ""}`.toUpperCase()}</span></h4>
                            <p className="text-center">
                                {moment(d.created_at).lang('es').format('LL')}
                            </p>
                            <hr/>
                            <div className="text-center">
                                <button className="btn btn-sm btn-dark" onClick={(e) => {
                                    setOption("SHOW_FILE")
                                }}>
                                    <i className="fas fa-file-alt"></i> Archivos
                                </button>
                            </div>
                        </VerticalTimelineElement>
                    )}
                </VerticalTimeline>
            </div>
        </Modal>
    );
}

// exportar
export default ModalTracking; 