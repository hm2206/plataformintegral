import React, { Fragment, useContext, useEffect, useState } from 'react';
import { BtnBack, Body, BtnFloat } from '../../../components/Utils';
import { Form, Button, List, Image } from 'semantic-ui-react';
import { unujobs } from '../../../services/apis';
import { Confirm, backUrl } from '../../../services/utils';
import Router from 'next/router';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import atob from 'atob';
import { SelectCronogramaCargo, SelectCronogramaTypeCategoria } from '../../../components/select/cronograma';
import { AUTHENTICATE } from '../../../services/auth';
import { AppContext } from '../../../contexts/AppContext';
import Skeletor from 'react-loading-skeleton';

const PlaceholderInput = ({ height = '38px', width = "100%", circle = false }) => <Skeletor height={height} width={width} circle={circle}/>

const PlaceholderInfos = () => {

    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <Fragment>
            {array.map(iter => 
                <div className="row mb-3" key={`add-info-${iter}`}>
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

const AddCronograma = ({ query, pathname, success, cronograma }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({ 
        query_search: "",
        cargo_id: "",
        type_categoria_id: ""
    });

    const [rows, setRows] = useState([]);
    const [infos, setInfos] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [last_page, setLastPage] = useState(1);
    const [current_loading, setCurrentLoading] = useState(false);
    const [change_page, setChangePage] = useState(false);
    const [is_filter, setIsFilter] = useState(false);

    // volver al listado del cronograma
    const handleBack = (e) => {
        let { pathname, push } = Router;
        push({ pathname: backUrl(pathname), query: { mes: cronograma.mes, year: cronograma.year } });
    }

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // realizar busqueda
    const handleSearch = async () => {
        if (rows.length) if (!await Confirm("warning", `Existen trabajadores seleccionados, al filtrar se perderá la selección`, 'Continuar')) return false;
        // search
        setPage(1);
        setIsFilter(true);
    }

    // add rows
    const handleRows = async () => {
        let newRows = await infos.filter(his => his.check == true);
        setRows(newRows);
    }

    // add checkeados
    const handleCheck = async (obj, index) => {
        // check
        obj.check = obj.check ? false : true;
        let newInfos = JSON.parse(JSON.stringify(infos));
        setInfos(newInfos);
        // add check
        handleRows();
    }

    // obtener información de los contratos
    const getinfos = async (changed = true) => {
        setCurrentLoading(true);
        let { cargo_id, type_categoria_id, query_search } = form;
        let params = `page=${page}&cargo_id=${cargo_id}&type_categoria_id=${type_categoria_id}&query_search=${query_search}`;
        await unujobs.get(`cronograma/${cronograma.id}/add?${params}`)
        .then(async res => {
            // datos
            let current_total = res.data.infos.total;
            let current_last_page = res.data.infos.last_page;
            let current_data = res.data.infos.data;
            setInfos(changed ? [...infos, ...current_data] : current_data);
            setTotal(current_total);
            setLastPage(current_last_page);
            setPage(page);
        })
        .catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // agregar contrato a la planilla
    const add = async () => {
        let answer = await Confirm("warning", `¿Está seguro en agregar a los trabajadores(${rows.length}) al cronograma #${cronograma.id}?`);
        if (answer) {
            app_context.fireLoading(true);
            let datos = new FormData();
            let payload = [];
            // preparar envio
            await rows.filter(r => payload.push(r.id));
            // send
            datos.append('info_id', payload.join(',')); 
            await unujobs.post(`cronograma/${cronograma.id}/add_all`, datos, { headers: { CronogramaID: cronograma.id } })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setPage(1);
                setIsFilter(true);
            })
            .catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
        }
    }

    // primera carga
    useEffect(() => {
        if (success) {
            getinfos(false);
            app_context.fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
        }
    }, []);

    // cambio de pagina
    useEffect(() => {
        if (change_page) getinfos(true);
        setChangePage(false);
    }, [change_page]);

    // realizar busqueda
    useEffect(() => {
        if (is_filter) getinfos(false);
        setIsFilter(false);
    }, [is_filter]);

    // render
    return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <BtnBack onClick={handleBack}/> 
                        <span className="ml-2">Agregar Trabajador al Cronograma <b>#{cronograma && cronograma.id} - {cronograma.planilla && cronograma.planilla.nombre} </b></span>
                        <hr/>
                    </Body>
                </div>

                <div className="col-md-12">
                    <Body>
                        <Form>
                            <div className="row">
                                <div className="col-md-3 mb-1">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Buscar por: Apellidos y Nombres"
                                            name="query_search"
                                            value={form.query_search || ""}
                                            onChange={(e) => handleInput(e.target)}
                                            disabled={current_loading}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <Form.Field>
                                        <SelectCronogramaCargo
                                            cronograma_id={cronograma.id}
                                            name="cargo_id"
                                            onChange={(e, obj) => handleInput(obj)}
                                            value={form.cargo_id || ""}
                                            disabled={current_loading}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <Form.Field>
                                        <SelectCronogramaTypeCategoria
                                            name="type_categoria_id"
                                            cronograma_id={cronograma.id}
                                            onChange={(e, obj) => handleInput(obj)}
                                            value={form.type_categoria_id || ""}
                                            disabled={current_loading}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-2 col-12">
                                    <Button color="blue"
                                        fluid
                                        onClick={handleSearch}
                                        disabled={current_loading}
                                    >
                                        <i className="fas fa-search"></i> Buscar
                                    </Button>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                </div>

                                <div className="col-md-12 mt-3">
                                    <List divided verticalAlign='middle'>
                                        <Show condicion={!current_loading}
                                            predeterminado={<PlaceholderInfos/>}
                                        >
                                            {infos.map((obj, index) => 
                                                <List.Item key={`list-info-add-${index}`}>
                                                    <List.Content floated='right'>
                                                        <Button color={'olive'}
                                                            basic={obj.check ? false : true}
                                                            className="mt-1"
                                                            onClick={(e) => handleCheck(obj, index)}
                                                        >
                                                            <i className={`fas fa-${obj.check ? 'check' : 'plus'}`}></i>
                                                        </Button>
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
                                                    </List.Content>
                                                </List.Item>
                                            )}
                                        </Show>
                                    </List>    
                                </div>

                                <Show condicion={!infos.length && !current_loading}>
                                    <div className="col-md-12 text-center pt-5 pb-5">
                                        <h4 className="text-muted">No se encontraron regístros</h4>
                                    </div>
                                </Show>

                                <div className="col-md-12 mt-3">
                                    <Button fluid
                                        onClick={async (e) => {
                                            await setPage(page + 1)
                                            setChangePage(true);
                                        }}
                                        disabled={!(last_page > page)}
                                    >
                                        Obtener más registros
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Body>
                </div>

                <Show condicion={rows.length}>
                    <BtnFloat theme="btn-success"
                        style={{ right: "40px" }}
                        onClick={add}    
                    >
                        <i className="fas fa-plus"></i> 
                    </BtnFloat>
                </Show>
            </Fragment>
        )
};

// server rendering
AddCronograma.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    // obtener id
    let id = atob(query.id) || "__error";
    //find cronograma
    let { success, cronograma } = await unujobs.get(`cronograma/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }));
    // response
    return { query, pathname, success, cronograma };
}

// export 
export default AddCronograma;