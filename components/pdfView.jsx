import React, { useState, useEffect, Fragment, useContext } from 'react';
import { Form, Checkbox, Button } from 'semantic-ui-react';
import Show from './show';
import { Confirm } from '../services/utils';
import ListPfx from './listPfx';
import { signature } from '../services/apis';
import { AppContext } from '../contexts/AppContext'
import Swal from 'sweetalert2';

const PdfView = ({ 
    pdfUrl = "https://www.iaa.csic.es/python/curso-python-para-principiantes", 
    pdfBlob,
    pdfDoc,
    defaultImage = "",
    disabledMetaInfo = false,
    disabledImage = false,
    metaInfo = { reason: "Yo soy el firmante", location: "PE", image: "" },
    onClose = null,
    onSigned = null
}) => {

    // app
    const app_context = useContext(AppContext);

    // obtener metadatos del pdf
    let pdfPages = pdfDoc.getPages(); 
    let lastPage = pdfPages.length;

    // estados
    const [reason, setReason] = useState(metaInfo.reason || "");
    const [location, setLocation] = useState(metaInfo.location || "");
    const [current_signature, setCurrentSignature] = useState(false);
    const [image, setImage] = useState(defaultImage || "");
    const [page, setPage] = useState(1);
    const [select_page, setSelectPage] = useState(pdfPages[page - 1]);
    const [current_position, setCurrentPosition] = useState("");
    const [count_signature, setCountSignature] = useState(0);
    const [positions, setPositions] = useState([]);
    const [current_select, setCurrentSelect] = useState({});
    const isSelect = Object.keys(current_select).length;

    // config rectangulo
    const columns = 5;
    const rows = 25;
    let cube = (rows * columns);
    
    // generar posiciones
    const generatePositions = async () => {
        let tmpPosition = [];
        // obtener el margin
        for(let i = 0; i < rows; i++) {
            for(let j = columns; j > 0; j--) {
                let pos = cube - j;
                if (i % 2 == 0) {
                    tmpPosition.push(pos);
                }
            }
            // disminuir
            cube -= columns;
        }
        // setting position
        setPositions(tmpPosition);
    }

    const handleInput = ({ name, value }, callback) => {
        if (typeof callback == 'function') callback(value)
    }

    const handleClose = async (e) => {
        if (typeof onClose == 'function') {
            let answer = await Confirm("warning", `¿Deseas cerrar el visualizador de PDF?`, 'Cerrar');
            if (answer) onClose(e);
        }
    }

    const signer = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en firmar el PDF?`, 'Firmar');        
        if (answer) {
            let payload = {};
            // assign pdfBlob
            payload.pdfBlob = pdfBlob;
            payload.page = page;
            payload.visible = false;
            // validar datos
            if (!disabledMetaInfo) {
                payload.reason = reason;
                payload.location = location;
            }
            // firma visible
            if (current_signature) {
                payload.position = current_position;
                payload.visible = true;
            }
            // emitir evento
            app_context.fireLoading(true);
            let datos = new FormData;
            datos.append('reason', payload.reason);
            datos.append('location', payload.location);
            datos.append('page', payload.page);
            datos.append('file', payload.pdfBlob);
            datos.append('visible', payload.visible);
            datos.append('certificate_id', current_select.id);
            if (payload.position) datos.append('position', payload.position);
            await signature.post(`auth/signer`, datos, { responseType: 'blob' })
                .then(async res => {
                    let { data } = res;
                    if (typeof onSigned == 'function') await onSigned(payload, data);
                    else {
                        let a = document.createElement('a');
                        a.href = URL.createObjectURL(data);
                        a.target = '__blank';
                        a.download = payload.pdfBlob.name;
                        await a.click();
                    }
                    // cerrar díalogo
                    if (typeof onClose == 'function') onClose();
                }).catch(err => {
                    try {
                        let { message, errors } = err.response.data;
                        if (!errors) throw new Error(message || err.message);
                        Swal.fire({ icon: 'warning', text: message });
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
            app_context.fireLoading(false);
        }
    }

    const getSignatures = async () => {
        let form = pdfDoc.getForm();
        let fields = form.getFields();
        let iter = 1;
        await fields.map(field => {
            let name = /Signature[0-9]+$/;
            if (name.test(field.getName())) setCountSignature(iter++);
        });
    }

    useEffect(() => {
        getSignatures();
        generatePositions();
    }, []);

    return (
        <div style={{
                position: 'fixed',
                width: '100%', 
                height: '100%', 
                top: '0px', 
                left: '0px',
                background: 'rgba(0,0,0,.5)',
                zIndex: '1050',
                padding: "1em 1.5em"
            }}
        >
            <div className="card w-100 h-100" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                <div className="card-header pl-4 text-left">
                    <i className="fas fa-file-pdf"></i> Visualizador de pdf
                    <i className="fas fa-times close" style={{ cursor: 'pointer' }} onClick={handleClose}></i>
                </div>
                <div className="row h-100 text-left">
                    <div className="col-md-8 col-lg-9">
                        <iframe className="w-100 h-100 pl-4" frameBorder="0" src={pdfUrl}/>
                    </div>
                    <div className="col-md-4 col-lg-3">
                        <div className="h-100 w-100" style={{ borderLeft: '1px solid rgba(20,20,31,.12)' }}>
                            <div className="card-body">
                                <div className="row">
                                    <ListPfx
                                        classBody="col-md-12"
                                        classSkeleton="col-md-12"
                                        onClick={(e, obj) => setCurrentSelect(obj)}
                                    />
                                </div>
                                
                                <Show condicion={count_signature}>
                                    <div className="card">
                                        <div className="card-header">
                                        <i className="fas fa-signature"></i>  Se encontró {count_signature} firmas
                                        </div>
                                    </div>
                                </Show>

                                <div className="card">
                                    <div className="card-header">
                                        <i className="fas fa-cog"></i> Configurar PDF 
                                    </div>
                                    <div className="card-body">
                                        <Form>
                                            <Show condicion={!disabledMetaInfo}>
                                                <Form.Field>
                                                    <label htmlFor="">Motivo</label>
                                                    <input type="text"
                                                        name="reason"
                                                        value={reason}
                                                        onChange={({target}) => handleInput(target, setReason)}
                                                    />
                                                </Form.Field>

                                                <Form.Field>
                                                    <label htmlFor="">Locación</label>
                                                    <input type="text"
                                                        name="location"
                                                        value={location}
                                                        onChange={({target}) => handleInput(target, setLocation)}
                                                    />
                                                </Form.Field>
                                            </Show>

                                            <Form.Field>
                                                <label htmlFor="">Página {page || 0} de {lastPage || 1}</label>
                                                <input type="text"
                                                    value={page}
                                                    name="page"
                                                    onChange={({target}) => handleInput(target, (value) => { 
                                                        let isNumber = /^[0-9]+$/;
                                                        if (isNumber.test(value) && value <= lastPage) {
                                                            setPage(value);
                                                            setSelectPage(pdfPages[value - 1]);
                                                            setCurrentPosition({ x: 0, y: 0 });
                                                        } else if (value == "") {
                                                            setPage(value);
                                                        }
                                                    })}
                                                />
                                            </Form.Field>
                                            
                                            <Form.Field>
                                                <label htmlFor="">Firma Visible</label>
                                                <div>
                                                    <Checkbox toggle 
                                                        checked={current_signature}
                                                        name="current_signature"
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked }, setCurrentSignature)}
                                                    />
                                                </div>
                                            </Form.Field>
                                        </Form>
                                    </div>
                                </div>

                                <Show condicion={current_signature}>
                                    <div className="card">
                                        <div className="card-header">
                                            <i className="fas fa-cog"></i> Configurar Posición
                                        </div>
                                        <div className="card-body">
                                            <Form>
                                                <Form.Field>
                                                    <div className="card pt-4">
                                                        <div className="row justify-content-center">
                                                            {positions.map((pos, indexPos) => 
                                                                <Fragment>
                                                                    <Show condicion={(indexPos) % 5 == 0}>
                                                                        <div className="col-md-12"></div>
                                                                    </Show>

                                                                    <div className={`col-md-2 col-2 mb-3 text-center`}>
                                                                        <input type="radio"
                                                                            value={pos}
                                                                            checked={pos == current_position ? true : false}
                                                                            onChange={({target}) => handleInput(target, setCurrentPosition)}
                                                                        />
                                                                    </div>  
                                                                </Fragment>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Form.Field>
                                            </Form>
                                        </div>
                                    </div>
                                </Show>
                            
                                <div className="mt-3 text-right">
                                    <Button color="teal"
                                        onClick={signer}
                                        disabled={(current_signature ? !typeof current_position == 'number' || !page : !page) || !isSelect}
                                    >
                                        <i className="fas fa-signature"></i> Firmar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PdfView;