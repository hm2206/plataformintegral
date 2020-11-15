import React, { useContext, useState } from 'react';
import { Body, BtnBack, BtnSelect, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { backUrl, InputCredencias, InputAuth, InputEntity } from '../../../services/utils';
import Router from 'next/dist/client/router';
import { Form, Select } from 'semantic-ui-react';
import Show from '../../../components/show';
import ContentControl from '../../../components/contentControl';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import SearchCronograma from '../../../components/cronograma/searchCronograma';
import atob from 'atob'
import BasicReport from '../../../components/cronograma/basicReport';


const Report = ({ cronograma, success }) => {

    // estado
    const [form, setForm] = useState({});
    const [report_id, setReportId] = useState("");
    const [option, setOption] = useState("");
    const [current_filtros, setCurrentFiltros] = useState([]);
    const [current_buttons, setCurrentButtons] = useState([]);

    // volver atrás
    const handleBack = (e) => {
        let { pathname, push, query } = Router; 
        if (query.href) {
            push({ pathname: query.href, query });
        } else {
            let newQuery = { year: cronograma && cronograma.year, mes: cronograma && cronograma.mes };
            push({ pathname: backUrl(pathname), query: newQuery });
        }
    }

    // render
    return(
            <div className="col-md-12">
                <Body>
                    <Form>
                        <div className="row">
                            <div className="col-md-3 mb-2">
                                <BtnBack onClick={handleBack}/> 
                            </div>

                            <div className="col-md-2 mb-1 col-6">
                                <Form.Field>
                                    <input type="text" 
                                        placeholder="Año" 
                                        readOnly
                                        value={cronograma.year}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mb-1 col-6">
                                <Form.Field>
                                    <input type="text" 
                                        placeholder="Mes" 
                                        readOnly
                                        value={cronograma.mes}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-3 mb-1">
                                <Form.Field>
                                    <input type="text" 
                                        placeholder="Planilla" 
                                        readOnly
                                        value={cronograma.planilla && cronograma.planilla.nombre}
                                    />
                                </Form.Field>
                            </div>

                            <Show condicion={cronograma.adicional}>
                                <div className="col-md-2 mb-1">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Adicional" 
                                            readOnly
                                            value={`Adicional ${cronograma.adicional}`}
                                        />
                                    </Form.Field>
                                </div>
                            </Show>
                        </div>
                    </Form>
                    <hr/>
                </Body>

                <BasicReport cronograma={cronograma}/>

                {/* <ContentControl>
                    <div className="col-md-3">
                        <BtnSelect
                            color="black"
                            fluid
                            options={current_buttons || []}
                            onClick={handleClick}
                            disabled={!report_id}
                        />
                    </div>
                </ContentControl> */}

                <BtnFloat style={{ top: '60vh', background: "#cecece" }}
                    size="md"
                    onClick={(e) => setOption("search_cronograma")}
                >
                    <i className="fas fa-search"></i>
                </BtnFloat>

                <Show condicion={option == "search_cronograma"}>
                    <SearchCronograma cronograma={cronograma}
                        isClose={e => setOption("")}
                    />
                </Show>
            </div>
        )
}

// server rendering
Report.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    // obtener cronograma
    let id = atob(query.id) || '__error';
    let { success, cronograma } = await unujobs.get(`cronograma/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }));
    // response
    return { query, pathname, success, cronograma }
}

// exportar
export default Report;