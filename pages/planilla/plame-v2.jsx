import React, { useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../services/auth';
import { microPlanilla } from '../../services/apis';
import { Form, Button } from 'semantic-ui-react';
import Show from '../../components/show';
import Router from 'next/router';
import { EntityContext } from '../../contexts/EntityContext';
import BoardSimple from '../../components/boardSimple';


const PlameIndex = ({ pathname, query, cronograma }) => {

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
        let a = document.createElement('a');
        // abrir
        a.href = `${microPlanilla.path}/${url}`;
        a.target = '_blank';
        a.click();
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
                                    min={1}
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
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="row">
                                <Show condicion={cronograma?.items?.length}>
                                    <div className="col-md-12">
                                        <hr/>
                                    </div>
                                </Show>
                                {/* cronogramas */}
                                {cronograma?.items?.map((cro, indexC) => 
                                    <div className={`col-md-3`} key={`list-cronograma-id-${indexC}`}
                                        onClick={(e) => handleCronograma(cro.id)}
                                    >
                                        <div className={`card ${ids.includes(cro.id) ? 'alert alert-success' : ''}`} style={{  cursor: 'pointer'  }}>
                                            <div className="card-body">
                                                <b>#{cro.id} - {cro?.planilla?.name || ""}</b>
                                                <b className="badge badge-info ml-2">
                                                    <i className="fas fa-user"></i> {cro?.historialsCount}
                                                </b>
                                                <hr/>
                                                <div>{cro.observacion}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Show condicion={ids.length}
                            predeterminado={
                                <div className='text-center col-12 mt-2'>
                                    <div className="card card-body">
                                        <b>Selecionar Cronogramas</b>
                                    </div>
                                </div>
                            }
                        >
                            <div className="col-md-12">
                                <hr/>
                            </div>

                            <div className="col-md-12 mb-1">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="card card-body text-primary">
                                            <div style={{ cursor: 'pointer'  }}
                                                onClick={() => handleClick(`plames/reports/${year}/${mes}/personal.pdf?cronogramaIds[]=${ids.join('&cronogramaIds[]=')}`)}>
                                                <i className="fas fa-users mr-1"></i> Reporte PLAME
                                            </div>
                                            <div style={{ cursor: 'pointer' }}
                                                className="text-success mt-2"
                                                onClick={() => handleClick(`plames/reports/${year}/${mes}/personal.xlsx?cronogramaIds[]=${ids.join('&cronogramaIds[]=')}`)}>
                                                <i className="fas fa-file-excel mr-1"></i> Exportar PLAME
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div
                                            className="card card-body text-success"
                                            style={{ cursor: 'pointer'  }}
                                            onClick={() => handleClick(`plames/reports/${year}/${mes}/jornary.jor?cronogramaIds[]=${ids.join('&cronogramaIds[]=')}`)}
                                        >
                                            <span><i className="fas fa-file-alt mr-1"></i> Generar JOR</span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div 
                                            className="card card-body text-dark"
                                            style={{ cursor: 'pointer'  }}
                                            onClick={() => handleClick(`plames/reports/${year}/${mes}/resume.rem?cronogramaIds[]=${ids.join('&cronogramaIds[]=')}`)}
                                        >
                                            <span><i className="fas fa-file-alt mr-1"></i> Generar REM</span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div
                                            className="card card-body text-red"
                                            style={{ cursor: 'pointer'  }}
                                            onClick={() => handleClick(`plames/reports/${year}/${mes}/resume.pen?cronogramaIds[]=${ids.join('&cronogramaIds[]=')}`)}
                                        >
                                            <span><i className="fas fa-file-alt mr-1"></i> Generar PEN</span>
                                        </div>
                                    </div>
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
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let date = new Date();
    query.mes = typeof query.mes != 'undefined' ? query.mes : date.getMonth() + 1;
    query.year = typeof query.year != 'undefined' ? query.year : date.getFullYear();
    const queryString = `year=${query.year}&month=${query.mes}&isPlame=1`;
    const cronograma = await microPlanilla.get(`cronogramas?${queryString}`)
        .then(res => res.data)
        .catch(() => ({ items: [] }))
    return { pathname, query, cronograma };
}

// exportar
export default PlameIndex;