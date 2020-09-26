import React, { Component } from 'react'
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


export default class ModalTracking extends Component
{

    state = {
        view_file: {
            show: false,
            origen: [],
            tracking: []
        },
        loader: false,
        tracking: {
            total: 0,
            page: 1,
            lastPage: 1,
            data: []
        },
        query_search: ""
    }

    componentDidMount = async () => {
        let { tramite } = this.props;
        await this.getTracking(tramite && tramite.slug, 1);
    }

    getTracking = async (slug, page = 1, up = false) => {
        this.setState({ loader: true });
        await tramite.get(`public/tramite/${slug}/tracking?page=${page}`)
        .then(res => {
            let { success, message, tracking } = res.data;
            if (!success) throw new Error(message);
            this.setState(state => {
                state.tracking.total = tracking.total;
                state.tracking.page = tracking.page;
                state.tracking.lastPage = tracking.lastPage;
                state.tracking.data = up ? [...state.tracking.data, ...tracking.data] : tracking.data;
                return { tracking: state.tracking };
            })
        })
        .catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    handlePage = async (nextPage) => {
        this.setState({ loader: true });
        let { tramite } = this.props;
        await this.getTracking(tramite && tramite.slug, nextPage, true);
    }

    openFiles = async (tracking) => {
        this.setState((state, props) => {
            state.view_file.show = true;
            state.view_file.origen = props.tramite.tramite_files;
            state.view_file.tracking = tracking.files;
            return { view_file: state.view_file }
        }); 
    }

    getMetadata = (status) => {
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

    getPrint = () => {
        let html = document.getElementById('print-tracking');
        let blob = new Blob([html.innerHTML], { type: 'text/html' });
        let newPrint = window.open(URL.createObjectURL(blob));
        newPrint.onload = () => newPrint.print();
    }
 
    render() {

        let { loader, tracking, view_file } = this.state;
        let { tramite } = this.props;

        return (
            <Modal
                show={true}
                md="10"
                {...this.props}
                titulo={
                    <span>
                        <button className="mr-5 btn btn-sm btn-primary" onClick={this.getPrint}>
                            <i className="fas fa-print"></i>
                        </button>
                        Seguimiento del Trámite <span className="badge badge-dark">{tramite && tramite.slug}</span>
                    </span>
                }
            >
                <Form className="h-100" loading={loader} id="print-tracking">
                    <Show condicion={tracking && tracking.data && tracking.data.length}>
                        <VerticalTimeline className="line-gray timeline-h-100">
                            {   
                                tracking && tracking.data && tracking.data.map(track => 
                                    <VerticalTimelineElement
                                        key={`tracking-timeline-${track.id}`}
                                        className="vertical-timeline-element--work mb-3"
                                        date={ moment(track.created_at).lang('es').format('h:mm a') }
                                        iconStyle={{ background: '#fff', color: this.getMetadata(track.status).color, border: `2px solid ${this.getMetadata(track.status).color}` }}
                                        icon={ this.getMetadata(track.status).icon }
                                        contentArrowStyle={{ borderRight: `10px solid ${this.getMetadata(track.status).color}` }}
                                        contentStyle={{ border: `4px solid ${this.getMetadata(track.status).color}` }}
                                    >
                                        <h3 className="vertical-timeline-element-title text-center mb-3">{this.getMetadata(track.status).name || track.status}</h3>
                                        <h4 className="vertical-timeline-element-subtitle">Lugar de destino: <span className="badge badge-dark mr-1">{ `${track.dependencia_destino && track.dependencia_destino.nombre}`.toUpperCase() }</span></h4>
                                        <p className="text-center">
                                            { moment(track.created_at).lang('es').format('LL') }
                                        </p>
                                        <hr/>
                                        <div className="text-center">
                                            <button className="btn btn-sm btn-dark" onClick={(e) => this.openFiles(track)}>
                                                <i className="fas fa-file-alt"></i> Archivos
                                            </button>
                                        </div>
                                    </VerticalTimelineElement>    
                                )
                            }
                        </VerticalTimeline>
                    </Show>

                    <Show condicion={!(tracking && tracking.data && tracking.data.length)}>
                        <h4 className="text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <div className="mb-2">
                                <i className="fas fa-file-alt" style={{ fontSize: '5em' }}></i>
                            </div>
                            <b style={{ fontSize: '1.5em' }}>No se encontró el recorrido del documento</b>
                            <div className="mt-3">
                                <button className="btn btn-sm btn-outline-primary"
                                    onClick={(e) => this.getTracking(tramite.slug)}
                                >
                                    <i className="fas fa-sync"></i> Refrescar
                                </button>
                            </div>
                        </h4> 
                    </Show>

                    <Show condicion={view_file.show}>
                        <ModalFiles
                            origen={view_file.origen}
                            tracking={view_file.tracking}
                            isClose={(e) => this.setState(state => {
                                state.view_file.show = false;
                                return { view_file: state.view_file }
                            })}
                        />
                    </Show>
                </Form>
            </Modal>
        );
    }

}