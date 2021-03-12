import React, { useContext, useEffect, useState } from 'react';
import { Body } from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { unujobs } from '../../../services/apis';
import { InputCredencias, InputEntity, InputAuth } from '../../../services/utils';
import { Form, Button, Checkbox } from 'semantic-ui-react';
import Show from '../../../components/show';
import { getPlame } from '../../../services/requests/cronograma'; 
import Router from 'next/router';
import { AppContext } from '../../../contexts/AppContext';
import { EntityContext } from '../../../contexts/EntityContext';
import BoardSimple from '../../../components/boardSimple';


const PlameIndex = ({ pathname, query, cronogramas, success, message }) => {

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [year, setYear] = useState(2020);
    const [mes, setMes] = useState(10);
    const [ids, setIds] = useState([]);

    // config page
    useEffect(() => {
        entity_context.fireEntity({ render: true });
        setYear(query && query.year || "");
        setMes(query && query.mes || "");
        return () => entity_context.fireEntity({ render: false });
    }, []);


    const handleClick = async (url) => {
        let form = document.createElement('form');
        document.body.appendChild(form);
        // add credenciales
        InputCredencias().filter(i => form.appendChild(i));
        // add entity
        form.appendChild(InputEntity());
        // add token 
        form.appendChild(InputAuth());
        // abrir
        form.method = 'POST';
        form.action = `${unujobs.path}/${url}`;
        form.target = '_blank';
        form.submit();
    }

    const handleSearch = () => {
        let { push } = Router;
        query.year = year;
        query.mes = mes;
        setIds([]);
        push({ pathname, query });
    }

    const handleCronograma = (id) => {
        let newIds = JSON.parse(JSON.stringify(ids));
        let index = newIds.indexOf(id);
        if (index >= 0) newIds.splice(index, 1);
        else newIds.push(id);
        setIds(newIds);
    }

    // render() {
    return (
        <div className="col-md-12">
            <BoardSimple
                title="PDT-PLAME"
                info={["Reporte PDT-PLAME"]}
                prefix="P"
                bg="danger"
                options={[]}
            >
                <Form className="card-body">
                    <div className="row">
                        <div className="col-md-3 mb-1 col-6">
                            <Form.Field>
                                <input type="number" 
                                    name="year"
                                    value={year || ""}
                                    onChange={({ target }) => setYear(target.value)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-3 mb-1 col-6">
                            <Form.Field>
                                <input type="number" 
                                    name="mes"
                                    value={mes || ""}
                                    max={12}
                                    onChange={({ target }) => setMes(target.value)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2 mb-1 col-12 mt-1">
                            <Button
                                fluid
                                color="blue"
                                onClick={handleSearch}
                            >
                                <i className="fas fa-search"></i> Buscar
                            </Button>
                        </div>

                        <div className="col-md-2 mb-1 col-12 mt-1">
                            <Button 
                                fluid
                                color="olive"
                                disabled={!success}
                                onClick={(e) => handleClick(`pdf/plame/${year}/${mes}?export=1&cronograma_id[]=${ids.join('&cronograma_id[]=')}`)}
                            >
                                <i className="fas fa-share mr-1"></i>
                                <span>Exportar</span>
                            </Button>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <hr/>
                        </div>

                        <Show condicion={!success}>
                            <div className="col-md-12 mt-5">
                                <h3 className="text-center">
                                    <i className="fas fa-file-alt mb-2" style={{ fontSize: '3em' }}></i>
                                    <br/>
                                    {message}
                                </h3>
                            </div>
                        </Show>

                        <Show condicion={success}>
                            <div className="col-md-12 mb-1">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div 
                                            className="card card-body text-primary"
                                            style={{ cursor: 'pointer'  }}
                                            onClick={(e) => handleClick(`pdf/plame/${year}/${mes}?cronograma_id[]=${ids.join('&cronograma_id[]=')}`)}
                                        >
                                            <span><i className="fas fa-users mr-1"></i> Reporte PLAME</span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div
                                            className="card card-body text-success"
                                            style={{ cursor: 'pointer'  }}
                                            onClick={(e) => handleClick(`plame/jor/${year}/${mes}?download=1`)}
                                        >
                                            <span><i className="fas fa-file-alt mr-1"></i> Generar JOR</span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div 
                                            className="card card-body text-dark"
                                            style={{ cursor: 'pointer'  }}
                                            onClick={(e) => handleClick(`plame/rem/${year}/${mes}?download=1`)}
                                        >
                                            <span><i className="fas fa-file-alt mr-1"></i> Generar REM</span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div
                                            className="card card-body text-red"
                                            style={{ cursor: 'pointer'  }}
                                            onClick={(e) => handleClick(`plame/rem/${year}/${mes}?download=1&extension=pen`)}
                                        >
                                            <span><i className="fas fa-file-alt mr-1"></i> Generar PEN</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="row">
                                    <Show condicion={cronogramas.length}>
                                        <div className="col-md-12">
                                            <hr/>
                                        </div>
                                    </Show>
                                    {/* cronogramas */}
                                    {cronogramas.map((cro, indexC) => 
                                        <div className={`col-md-3`} key={`list-cronograma-id-${indexC}`}
                                            onClick={(e) => handleCronograma(cro.id)}
                                        >
                                            <div className={`card ${ids.includes(cro.id) ? 'alert alert-success' : ''}`} style={{  cursor: 'pointer'  }}>
                                                <div className="card-body">
                                                    <b>#{cro.id} - {cro.planilla && cro.planilla.nombre || ""}</b>
                                                    <hr/>
                                                    <div>{cro.observacion}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Show>
                    </div>
                </Form>
            </BoardSimple>
        </div>)
}

// server rendering
PlameIndex.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let date = new Date();
    query.mes = typeof query.mes != 'undefined' ? query.mes : date.getMonth() + 1;
    query.year = typeof query.year != 'undefined' ? query.year : date.getFullYear();
    let { cronogramas, message, success } = await getPlame(ctx);
    return { pathname, query, success, message, cronogramas };
}

// exportar
export default PlameIndex;