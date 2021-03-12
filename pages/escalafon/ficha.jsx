import React, { Component, Fragment,useState, useContext, useEffect } from 'react';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../services/auth';
import { Body, BtnBack } from '../../components/Utils';
import ContentControl from '../../components/contentControl';
import Show from '../../components/show';
import { escalafon } from '../../services/apis';
import { parseUrl, Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import AssignTrabajadorEntity from '../../components/contrato/assingTrabajadorEntity';   
import { AppContext } from '../../contexts/AppContext';

const parametros = [
    { key: 'grado', value: 'grado', text: 'Formación Académica' },
    { key: 'experiencia', value: 'experiencia', text: 'Exp. Laboral' },
    { key: 'licencia', value: 'licencia', text: 'Licencia' },
    { key: 'ascenso', value: 'ascenso', text: 'Ascensos' },
    { key: 'desplazamiento', value: 'desplazamiento', text: 'Desplazamientos' },
    { key: 'merito', value: 'merito', text: 'Méritos' },
    { key: 'desmerito', value: 'desmerito', text: 'Desmeritos' },
    { key: 'familiar', value: 'familiar', text: 'Familiar' }
];

const Ficha = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [option, setOption] = useState("");
    const [info, setInfo] = useState({});
    const isInfo = Object.keys(info).length;
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [argumentos, setArgumentos] = useState([]);
    const [pdf, setPdf] = useState(null);

    // setting
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        return () => entity_context.fireEntity({ render: fales });
    }, []);

    const getAdd = async (obj) => {
        setOption("");
        setInfo(obj);
        setPdf(null);
    }

    // Obtener ficha
    const getFicha = async () => {
        let form = new FormData;
        await argumentos.map(par => form.append('argumentos[]', par));
        app_context.setCurrentLoading(true);
        await escalafon.post(`report/ficha_escalafonaria/${info.id}?is_pdf=0`, form, { responseType: 'blob' })
            .then(res => {
                app_context.setCurrentLoading(false);
                let blob = new Blob([res.data], { type: 'text/html' });
                let link = URL.createObjectURL(blob);
                setPdf(link);
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
            
    }

    // seleccionar argumento
    const handleChecked = (e, { name, checked }) => {
        let newArgumentos = JSON.parse(JSON.stringify(argumentos));
        if (checked) setArgumentos([...newArgumentos, name])
        else {
            let index = newArgumentos.indexOf(name);
            if (index >= 0) newArgumentos.splice(index, 1);
            setArgumentos(newArgumentos)
        } 
    }

    // executar impresión
    const executePrint = async () => {
        let print = window.open(pdf);
        print.onload = () => {
            print.print();
        }
    }

    // render
    return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <div className="card-header">
                            <span className="ml-3">Reporte de Ficha Escalafonaria</span>
                        </div>
                    </Body>
                </div>

                <div className="col-md-12 mt-2">
                    <Body>
                        <div className="card-body">
                            <Form onSubmit={(e) => e.preventDefault()}>

                                <div className="row justify-content-center">
                                    <div className="col-md-12 mb-4">
                                        <div className="row">
                                            <Show condicion={!isInfo}>
                                                <div className="col-md-4">
                                                    <Button
                                                        disabled={current_loading}
                                                        onClick={(e) => setOption("ASSIGN")}
                                                    >
                                                        <i className="fas fa-plus"></i> Asignar Personal
                                                    </Button>
                                                </div>
                                            </Show>

                                            <Show condicion={isInfo}>
                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Tip. Documento</label>
                                                        <input type="text"
                                                            value={info.person && info.person.document_type  || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">N° Documento</label>
                                                        <input type="text"
                                                            value={info.person && info.person.document_number  || ""}
                                                            disabled
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Apellidos y Nombres</label>
                                                        <input type="text"
                                                            value={info.person && info.person.fullname || ""}
                                                            disabled
                                                            className="uppercase"
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4 mt-1">
                                                    <Button
                                                        onClick={(e) => setOption("ASSIGN")}
                                                        disabled={current_loading}
                                                    >
                                                        <i className="fas fa-sync"></i> Cambiar Personal
                                                    </Button>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div>
                                            <hr/>
                                            <i className="fas fa-info-circle mr-1"></i> Información de Ficha Escalafonaria
                                            <hr/>
                                        </div>

                                        <div className="card-body">
                                            <div className="row w-100">
                                                <div className="col-md-8">
                                                    <dic className="card">
                                                        <div className="card-header">
                                                            <i className="fas fa-file-pdf text-red"></i> Visualizador
                                                        </div>
                                                        <div className="card-body">
                                                            <Show condicion={!pdf}>
                                                                <div className="py-5 text-center">
                                                                    <i className="far fa-file-pdf" style={{ fontSize: '4em' }}></i>
                                                                    <div className="mt-2" style={{ fontSize: '1.5em'}}>
                                                                        No se encontró la ficha escalafonaria
                                                                    </div>
                                                                </div>
                                                            </Show>

                                                            <Show condicion={pdf}>
                                                                <iframe src={`${pdf}#view=FitH,top`} frameborder="0" width="100%" style={{ minHeight: '500px' }}></iframe>
                                                            </Show>
                                                        </div>
                                                        <div className="card-footer">
                                                            <div className="py-2 text-right w-100">
                                                                <Show condicion={pdf}>
                                                                    <Button color="blue" 
                                                                        disabled={app_context.isLoading}
                                                                        onClick={executePrint}
                                                                    >
                                                                        <i className="fas fa-print"></i> Imprimir
                                                                    </Button>
                                                                </Show>

                                                                <Button color="black" 
                                                                    disabled={!isInfo}
                                                                    onClick={getFicha}
                                                                >
                                                                    <i className="fas fa-sync"></i> Generar
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </dic>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <i className="fas fa-cog"></i> Configurar Reporte
                                                        </div>
                                                        <div className="card-body">
                                                            {parametros.map(par => 
                                                                <div className="mb-2" key={`parametro-${par.key}`}>
                                                                    <Checkbox onChange={handleChecked} name={par.key}/> {par.text}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </Body>
                </div>

            <Show condicion={option == 'ASSIGN'}>
                <AssignTrabajadorEntity
                    getAdd={getAdd}
                    isClose={(e) => setOption("")}
                />
            </Show>
        </Fragment>
    )
}


// server
Ficha.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    return { pathname, query }
}

// export 
export default Ficha;