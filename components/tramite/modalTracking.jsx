import React, { useState, useEffect } from 'react'
import Modal from '../modal';
import { tramite } from '../../services/apis';
import Show from '../show';
import moment from 'moment';
import { Button, Loader } from 'semantic-ui-react'
import ModalFiles from './modalFiles';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import CallMissedOutgoingRoundedIcon from '@material-ui/icons/CallMissedOutgoingRounded';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import FileCopy from '@material-ui/icons/FileCopy';
import CloseIcon from '@material-ui/icons/Close';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ChatIcon from '@material-ui/icons/Chat';
import Swal from 'sweetalert2';
import ModalInfo from './modalInfo';
import Visualizador from '../visualizador';
import InfoMultiple from './infoMultiple';
moment.locale('es');


const ItemTracking = ({ current_tracking = {}, onFiles = null, onTramite = null, current = null, onMultiple = null }) => {

    // obtener meta datos
    const getMetadata = (status) => {
        let icons = {
            REGISTRADO: { icon: <FileCopy/> },
            SUBTRAMITE: { icon: <FileCopy/>, name: 'SUB-TRÁMITE' },
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

    // metadata actual
    const info = getMetadata(current_tracking.status);
    const { dependencia, person } = current_tracking;

    // render 
    return (
        <VerticalTimelineElement
            className="vertical-timeline-element--work mb-3"
            date={moment(current_tracking.created_at).format('h:mm a')}
            iconStyle={{ background: '#fff', color: info.color, border: `2px solid ${info.color || '#78909c'}` }}
            icon={info.icon || <i className="fas fa-file-alt"></i>}
            contentArrowStyle={{ borderRight: `10px solid ${info.color || '#78909c'}` }}
            contentStyle={{ border: `4px solid ${info.color || '#78909c'}` }}
        >
            <h3 className="vertical-timeline-element-title text-center mb-3">
                {info.name || current_tracking.status} {current == current_tracking.id ? <i className="text-success fas fa-check-circle"></i> : null}
            </h3>
            <h4 className="vertical-timeline-element-subtitle">
                Lugar de destino: 
                <span className="badge badge-dark mr-1 ml-1 capitalize">
                    {dependencia?.nombre || "Exterior"}
                </span>
            </h4>
            <h4 className="vertical-timeline-element-subtitle">
                Persona: <span className="badge badge-dark mr-1 capitalize">{person && person.fullname || ""}</span>
            </h4>
            <p className="text-center">
                {moment(current_tracking.created_at).format('LL')}
            </p>
            <hr/>
            <div className="text-center">
                {/* obtener datos */}
                <Show condicion={Object.keys(current_tracking.tramite || {}).length}>
                    <button className="btn btn-outline-dark"
                        onClick={(e) => typeof onTramite == 'function' ? onTramite(e, current_tracking.tramite || {}) : null}
                    >
                        <i className="fas fa-info-circe"></i> Información
                    </button>
                </Show>
                {/* obtener info */}
                <Show condicion={Object.keys(current_tracking.info || {}).length}>
                    <p>{current_tracking.info && current_tracking.info.description || ""}</p>
                    <Show condicion={current_tracking.info.files && current_tracking.info.files.length}>
                        <button className="btn btn-sm btn-dark"
                            onClick={(e) => typeof onFiles == 'function' ? onFiles(e, current_tracking.info.files || []) : null}
                        >
                            <i className="fas fa-file-alt"></i> Archivos
                        </button>
                    </Show>
                </Show>
                {/* tracking multiple */}
                <Show condicion={current_tracking?.__meta__?.multiples_count}>
                    <button className="btn btn-primary"
                        onClick={(e) => typeof onMultiple == 'function' ? onMultiple(current_tracking) : null}
                    >
                        <i className="fas fa-chart-line"></i> Multiples
                    </button>
                </Show>
                
            </div>
        </VerticalTimelineElement>
    )
}


const ModalTracking = ({ isClose = null, slug = "", current = null }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_error, setIsError] = useState(false);
    const [option, setOption] = useState("");
    const [current_files, setCurrentFiles] = useState([]);
    const [current_tramite, setCurrentTramite] = useState({});
    const [current_file, setCurrentFile] = useState({});
    const [is_visualizador, setIsVisualizador] = useState(false);
    const [multiple, setMultiple] = useState({});

    // obtener linea de tiempo
    const getTracking = async (add = false) => {
        setCurrentLoading(true);
        await tramite.get(`tramite/${slug}/timeline?page=${current_page}`)
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

    useEffect(() => {
        if (current_page > 1) getTracking(true)
    }, [current_page]);
 
    // renderizar
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
                       <ItemTracking key={`tracking-timeline-${indexD}`}
                            current={current}
                            current_tracking={d}
                            onFiles={(e, files) => {
                                setCurrentFiles(files)
                                setOption("SHOW_FILE")
                            }}
                            onTramite={(e, info) => {
                                setCurrentTramite(info);
                                setOption('SHOW_INFO')
                            }}
                            onMultiple={(m) => {
                                setMultiple(m);
                                setOption('MULTIPLE');
                            }}
                       />
                    )}
                </VerticalTimeline>
                {/* preloader */}
                <Show condicion={current_loading}>
                    <div style={{ position: 'relative' }} className="mt-5 mb-5 pt-4 pb-4">
                        <Loader active/>
                    </div>
                </Show>
                {/* obtener más registros */}
                <Show condicion={(current_page + 1) <= current_last_page}>
                    <Button fluid 
                        className="mt-2" 
                        disabled={current_loading}
                        onClick={(e) => setCurrentPage(prev => prev + 1)}
                    >
                        <i className="fas fa-arrow-down"></i> Obtener más regístros
                    </Button>
                </Show>
                {/* modal de archivos */}
                <Show condicion={option == 'SHOW_FILE'}>
                    <ModalFiles files={current_files}
                        isClose={(e) => setOption("")}
                        onFile={(e, f) => {
                            setCurrentFile(f);
                            setIsVisualizador(true);
                        }}
                    />
                </Show>
                {/* modal de información */}
                <Show condicion={option == 'SHOW_INFO'}>
                    <ModalInfo
                        current_tramite={current_tramite}
                        isClose={(e) => setOption("")}
                        onFile={(e, f) => {
                            setCurrentFile(f);
                            setIsVisualizador(true);
                        }}
                    />
                </Show>
                {/* visualizador */}
                <Show condicion={is_visualizador}>
                    <Visualizador
                        id="visualizador-info"
                        name={current_file.name}
                        extname={current_file.extname}
                        url={current_file.url}
                        onClose={(e) => setIsVisualizador(false)}
                    />
                </Show>
                {/* mostrar envio multiple */}
                <Show condicion={option == 'MULTIPLE'}>
                    <InfoMultiple
                        current_tracking={multiple}
                        isClose={(e) => setOption("")}
                    />
                </Show>
            </div>
        </Modal>
    );
}

// exportar
export default ModalTracking; 