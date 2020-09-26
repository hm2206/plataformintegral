import React, { useState, useEffect } from 'react';
import { Form, Checkbox, Button } from 'semantic-ui-react';
import { InputFile } from './Utils';
import Show from './show';
import { Confirm } from '../services/utils';
import { PDFSignature } from 'pdf-lib';

const PdfView = ({ 
    pdfUrl = "https://www.iaa.csic.es/python/curso-python-para-principiantes", 
    pdfBlob,
    pdfDoc,
    defaultImage = "",
    disabledMetaInfo = false,
    disabledImage = false,
    metaInfo = { reason: "Yo soy el firmante", location: "PE", image: "" },
    onClose = null,
    onSignature = null
}) => {

    // obtener metadatos del pdf
    let pdfPages = pdfDoc.getPages(); 
    let lastPage = pdfPages.length;

    // estados
    const [reason, setReason] = useState(metaInfo.reason || "");
    const [location, setLocation] = useState(metaInfo.location || "");
    const [signature, setSignature] = useState(false);
    const [image, setImage] = useState(defaultImage || "");
    const [page, setPage] = useState(1);
    const [select_page, setSelectPage] = useState(pdfPages[page - 1]);
    const [positions, setPositions] = useState([]);
    const [current_position, setCurrentPosition] = useState({ x: 0, y: 0});
    const [count_signature, setCountSignature] = useState(0);

    // config page
    const pageWidth = select_page.getHeight();
    const pageHeight = select_page.getWidth();

    // config rectangulo
    const rectangulo = { width: 150, height: 50 };
    const widget = 4;
    const numPosition = 12;
    
    // generar posiciones
    const generatePositions = async () => {
        // obtener el margin
        let marginX = ((pageWidth - (rectangulo.width * widget)) / widget) / 4;
        let marginY = ((pageHeight - (rectangulo.height * numPosition / widget)) / widget) / 4;
        // tmp position
        let positionTmp = [];
        // config row and column
        let row = 0;
        let column = 0;
        // procesar positiones
        for (let index = 0; index < numPosition; index++) {
            // add position
            positionTmp.unshift({
                x: marginX + (column * rectangulo.width),
                y: marginY + (row * rectangulo.height)
            });
            // next row
            if (((index + 1) % widget) == 0) {
                // next column and row
                column = 0;
                row += 1;
            } else {
                // next columna
               column++;
            }
        }
        // set position
        setPositions(positionTmp);
    }

    const handleInput = ({ name, value }, callback) => {
        if (typeof callback == 'function') callback(value)
    }

    const handleImage = ({ name, file }) => {
        let url = URL.createObjectURL(file);
        setImage(url);
    }

    const handleClose = async (e) => {
        if (typeof onClose == 'function') {
            let answer = await Confirm("warning", `¿Deseas cerrar el visualizador de PDF?`, 'Cerrar');
            if (answer) onClose(e);
        }
    }

    const handleSignature = () => {
        let payload = {};
        // assign pdfBlob
        payload.pdfBlob = pdfBlob;
        payload.page = page;
        // validar datos
        if (!disabledMetaInfo) {
            payload.reason = reason;
            payload.location = location;
        }
        // validar imagen
        if (!disabledImage) payload.image = image;
        // emitir evento
        if (typeof onSignature == 'function') onSignature(payload);
        if (typeof onClose == 'function') onClose(true);
    }

    const getSignatures = async () => {
        let form = pdfDoc.getForm();
        let fields = form.getFields();
        let iter = 1;
        await fields.map(field => {
            let name = /^Signature[0-9]+$/;
            if (name.test(field.getName())) setCountSignature(iter++);
        });
    }

    useEffect(() => {
        generatePositions();
        getSignatures();
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
                <div className="card-header pl-4">
                    <i className="fas fa-file-pdf"></i> Visualizador de pdf
                    <i className="fas fa-times close" style={{ cursor: 'pointer' }} onClick={handleClose}></i>
                </div>
                <div className="row h-100">
                    <div className="col-md-8 col-lg-9">
                        <iframe className="w-100 h-100 pl-4" frameBorder="0" src={pdfUrl}/>
                    </div>
                    <div className="col-md-4 col-lg-3">
                        <div className="h-100 w-100" style={{ borderLeft: '1px solid rgba(20,20,31,.12)' }}>
                            <div className="card-body">
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
                                                        checked={signature}
                                                        name="signature"
                                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked }, setSignature)}
                                                    />
                                                </div>
                                            </Form.Field>
                                        </Form>
                                    </div>
                                </div>

                                <Show condicion={signature}>
                                    <div className="card">
                                        <div className="card-header">
                                            <i className="fas fa-cog"></i> Configurar Firma Digital
                                        </div>
                                        <div className="card-body">
                                            <Form>
                                                <Show condicion={!disabledImage}>
                                                    <Form.Field>
                                                        <label htmlFor="">Imagen</label>
                                                        <Show condicion={image}>
                                                            <div className="text-center" style={{ border: "2px solid #eeee", height: "150px" }}>
                                                                <img src={image} alt="image-sigantured" style={{ objectFit: 'contain', width: '100%', height: '100%' }}/>
                                                            </div>
                                                        </Show>

                                                        <InputFile
                                                            id="image_signature"
                                                            name="image_signature"
                                                            title="Seleccionar imagen"
                                                            accept="image/*"
                                                            onChange={(e) => handleImage(e)}
                                                        />
                                                    </Form.Field>
                                                </Show>

                                                <Form.Field>
                                                    <label>Posición</label>
                                                    <div className="card pt-4">
                                                        <div>

                                                        </div>
                                                        <div className="row justify-content-center">
                                                            {positions.map((pos, posIndex) => 
                                                                <div className={`col-md-${widget} col-${widget} mb-3 text-center`} 
                                                                    key={`position-${posIndex}`}
                                                                >
                                                                    <input type="radio"
                                                                        value={JSON.stringify(pos)}
                                                                        checked={pos.x == current_position.x && pos.y == current_position.y}
                                                                        onChange={({target}) => handleInput(target, (value) => {
                                                                            setCurrentPosition(JSON.parse(value))
                                                                        })}
                                                                    />
                                                                </div>    
                                                            )}
                                                        </div>
                                                    </div>
                                                </Form.Field>
                                            </Form>
                                        </div>
                                    </div>
                                </Show>
                            
                                <div className="mt-3 text-right">
                                    <Show condicion={onSignature}>
                                        <Button color="teal"
                                            onClick={handleSignature}
                                            disabled={signature ? !current_position.x || !current_position.y || !page : !page}
                                        >
                                            <i className="fas fa-signature"></i> Firmar
                                        </Button>
                                    </Show>
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