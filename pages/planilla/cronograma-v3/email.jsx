import React, { Fragment, useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { BtnBack, BtnFloat } from '../../../components/Utils';
import { handleErrorRequest, unujobs, microPlanilla } from '../../../services/apis';
import { Form, Button, List, Image, Select } from 'semantic-ui-react';
import Show from '../../../components/show';
import BoardSimple from '../../../components/boardSimple';
import HeaderCronograma from '../../../components/cronograma/headerCronograma';
import { Confirm } from '../../../services/utils';
import atob from 'atob';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts';
import { EntityContext } from '../../../contexts/EntityContext';
import Skeleton from 'react-loading-skeleton';
import NotFoundData from '../../../components/notFoundData';


const PlaceholderInput = ({ height = '38px', width = "100%", circle = false }) => <Skeleton height={height} width={width} circle={circle}/>

const PlaceholderHistorial = () => {

    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <Fragment>
            {array.map(iter => 
                <div className="row mb-3 justify-content-around" key={`add-info-${iter}`}>
                    <div className="ml-3 col-xs">
                        <PlaceholderInput circle={true} width="50px" height="50px"/>
                    </div>
                    <div className="col-md-10 col-8">
                        <PlaceholderInput width="100%"/>
                    </div>
                    <div className="col-md-1 text-right col-2">
                        <PlaceholderInput/>
                    </div>
                </div>   
            )}
        </Fragment>
    )
}


const CronogramaEmail = ({ query, success, cronograma }) => {

    // validar data
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [query_search, setQuerySearch] = useState("");
    const [send_email, setSendEmail] = useState("SIN_FILTER");
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [datos, setDatos] = useState([]);
    const [enviados, setEnvidados] = useState(0);
    const [no_enviados, setNoEnviados] = useState(0);
    const [is_search, setIsSearch] = useState(false);
    const [errors, setErrors] = useState([]);
    const [is_next, setIsNext] = useState(false);

    // setting entity
    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
        return () => entity_context.fireEntity({ render: false, disabled: false });
    }, []);

    // obtener sent email
    const getSentEmail = async (add = false) => {
        setCurrentLoading(true);
        let query_string = `page=${query.page}&query_search=${query_search}&send_email=${send_email}`;
        await unujobs.get(`cronograma/${cronograma.id}/sent_email?${query_string}`)
        .then(res => {
            let { enviados, no_enviados, historial } = res.data;
            // settig datos
            setCurrentLastPage(historial.last_page || 0);
            setCurrentTotal(historial.total || 0);
            setDatos(add ? [...datos, ...historial.data] : historial.data);
            setEnvidados(enviados);
            setNoEnviados(no_enviados);
        })
        .catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // executar para obtener sent email
    useEffect(() => {
        getSentEmail();
    }, []);

    // next page
    useEffect(() => {
        if (current_page > 1) getSentEmail(true);
    }, [current_page]);

    // realizar búsqueda
    useEffect(() => {
        if (is_search) {
            getSentEmail();
            setIsSearch(false);
        }
    }, [is_search]);

    // enviar email a los trabajadores
    const send = async () => {
        let answer = await Confirm('warning', `¿Desea enviar correos de las boletas informativas?`, 'Enviar');
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        await microPlanilla.post(`cronogramas/${cronograma.id}/sendMail`)
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { count } = res.data;
            Swal.fire({ icon: 'success', text: `Se están procesando ${count} envios de correos` })
        })
        .catch(async err => handleErrorRequest(err, null, () => app_context.setCurrentLoading(false)));
    }

    // next 
    useEffect(() => {
        if (is_next) {
            send();
            setIsNext(false);
        }
    }, [is_next]);

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
                <BoardSimple
                    title={<HeaderCronograma cronograma={cronograma}/>}
                    info={["Enviar correo a los trabajadores"]}
                    prefix={<BtnBack/>}
                    options={[]}
                    bg="light"
                >
                    <Form className="card-body">
                        <div className="row">
                            <div className="col-md-5 mb-1">
                                <Form.Field>
                                    <input type="text" 
                                        disabled={current_loading}
                                        placeholder="Buscar por: Apellidos y Nombres"
                                        name="query_search"
                                        value={query_search || ""}
                                        onChange={({ target }) => setQuerySearch(target.value)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-3 mb-1">
                                <Form.Field>
                                    <Select
                                        disabled={current_loading}
                                        placeholder="Select. Filtro"
                                        options={[
                                            { key: "SIN_FILTER", value: "SIN_FILTER", text: "TODOS" },
                                            { key: "NOT_SEND", value: "NOT_SEND", text: "NO ENVIADOS" },
                                            { key: "SEND", value: "SEND", text: "ENVIADOS" }
                                        ]}
                                        name="send_email"
                                        value={send_email || "SIN_FILTER"}
                                        onChange={(e, obj) => setSendEmail(obj.value)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 col-12">
                                <Button color="blue"
                                    fluid
                                    disabled={current_loading}
                                    onClick={async (e) => {
                                        setCurrentPage(1);
                                        setCurrentLastPage(0);
                                        setCurrentTotal(0);
                                        setDatos([]);
                                        setIsSearch(true);
                                    }}
                                >
                                    <i className="fas fa-search"></i> Buscar
                                </Button>
                            </div>

                            <div className="col-md-12">
                                <hr/>
                            </div>

                            <div className="col-md-12 mt-4">
                                <div className="row">
                                    <div className="col-md-4 col-lg-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <i className="text-primary fas fa-users"></i> Total: {current_total || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4 col-lg-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <i className="text-success fas fa-paper-plane"></i> Enviados: {enviados || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4 col-lg-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <i className="text-red fas fa-times"></i> No Enviados: {no_enviados || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr/>
                            </div>

                            <div className="col-md-12 mt-3">
                                <List divided verticalAlign='middle'>
                                    {datos.map((obj, index) => 
                                        <List.Item key={`list-people-${obj.id}`}>
                                            <List.Content floated='right'>
                                                <Show condicion={obj.send_email}>
                                                    <Button color={'olive'}
                                                        className="mt-1"
                                                        title="Enviado"
                                                    >
                                                        <i className={`fas fa-check`}></i>
                                                    </Button>
                                                </Show>

                                                <Show condicion={!obj.send_email}>
                                                    <Button color={obj.person && obj.person.email_contact ? 'olive' : 'red'}
                                                        basic
                                                        className="mt-1"
                                                        title={obj.person && obj.person.email_contact ? 'Posible envio' : 'No se puede enviar'}
                                                    >
                                                        <i className={`fas fa-${obj.person && obj.person.email_contact ? 'paper-plane' : 'times'}`}></i>
                                                    </Button>
                                                </Show>
                                            </List.Content>
                                            <Image avatar src={obj.person && obj.person.image_images && obj.person.image_images.image_50x50 || '/img/base.png'} 
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <List.Content>
                                                <span className="uppercase mt-1">{obj.person && obj.person.fullname}</span>
                                                <br/>
                                                <span className="badge badge-dark mt-1 mb-2">
                                                    {obj.cargo} - {obj.type_categoria}
                                                </span>

                                                <span className="badge badge-warning ml-1 mt-1 mb-2">
                                                    {obj.person && obj.person.email_contact}
                                                </span>
                                            </List.Content>
                                        </List.Item>
                                    )}
                                </List>    
                            </div>

                            <Show condicion={!current_loading && !datos.length}>
                                <div className="col-md-12 text-center pt-5 pb-5">
                                    <h4 className="text-muted">No se encontraron regístros</h4>
                                </div>
                            </Show>

                            {/* preloader */}
                            <Show condicion={current_loading}>
                                <div className="col-12">
                                    <PlaceholderHistorial/>
                                </div>
                            </Show>

                            <div className="col-md-12 mt-3">
                                <Button fluid
                                    onClick={(e) => setCurrentPage(current_page + 1)}
                                    disabled={!(current_last_page >= (current_page + 1))}
                                >
                                    <i className="fas fa-arrow-down"></i> Obtener más registros
                                </Button>
                            </div>
                        </div>
                    </Form>
                </BoardSimple>
            </div>

            <BtnFloat theme="btn-success"
                style={{ right: "40px" }}
                onClick={send}    
                loading={current_loading || !datos.length}
                disabled={current_loading}
            >
                <i className="fas fa-paper-plane"></i> 
            </BtnFloat>
        </Fragment>
    )
}

CronogramaEmail.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // obtener id
    let id = atob(query.id) || "__error";
    //find cronograma
    let { success, cronograma } = await unujobs.get(`cronograma/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }));
    // response
    return { pathname, query, success, cronograma };
}

export default CronogramaEmail;