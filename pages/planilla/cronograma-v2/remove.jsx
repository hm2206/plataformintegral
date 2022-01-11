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
import BoardSimple from '../../../components/boardSimple'
import HeaderCronograma from '../../../components/cronograma/headerCronograma'
import { EntityContext } from '../../../contexts/EntityContext';
import NotFoundData from '../../../components/notFoundData';

const PlaceholderInput = ({ height = '38px', width = "100%", circle = false }) => <Skeletor height={height} width={width} circle={circle}/>

const PlaceholderHistorial = () => {

    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <Fragment>
            {array.map(iter => 
                <div className="row mb-3">
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

const RemoveCronograma = ({ query, pathname, success, cronograma }) => {

    // validar data
    if (!success) return <NotFoundData/>

    // app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    // estados
    const [form, setForm] = useState({ 
        query_search: "",
        cargo_id: "",
        type_categoria_id: ""
    });

    const [rows, setRows] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(1);
    const [total, setTotal] = useState(0)
    const [current_loading, setCurrentLoading] = useState(false);
    const [change_page, setChangePage] = useState(false);
    const [is_filter, setIsFilter] = useState(false);

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
        let newRows = await historial.filter(his => his.check == true);
        setRows(newRows);
    }

    // add checkeados
    const handleCheck = async (obj, index) => {
        // check
        obj.check = obj.check ? false : true;
        let newHistorial = JSON.parse(JSON.stringify(historial));
        setHistorial(newHistorial);
        // add check
        handleRows();
    }

    // obtener información de los contratos
    const getHistorial = async (changed = true) => {
        setCurrentLoading(true);
        let { cargo_id, type_categoria_id, query_search } = form;
        let params = `page=${page}&cargo_id=${cargo_id}&type_categoria_id=${type_categoria_id}&query_search=${query_search}`;
        await unujobs.get(`cronograma/${cronograma.id}/remove?${params}`)
        .then(async res => {
            // datos
            let current_total = res.data.historial.total;
            let current_last_page = res.data.historial.last_page;
            let current_data = res.data.historial.data;
            setHistorial(changed ? [...historial, ...current_data] : current_data);
            setTotal(current_total);
            setLastPage(current_last_page);
            setPage(page);
        })
        .catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // agregar contrato a la planilla
    const remove = async () => {
        let condicion = 0;
        let value = await Confirm("info", `¿Desea confirmar al eliminación de los trabajadores(${rows.length})?`, "Continuar");
        if (value) {
            if (!await Confirm("warning", `Se está eliminado a los trabajadores(${rows.length}) del cronograma ${condicion? ', y se está quitando el contrato. El sistema no agregará a estos trabajadores en los proximos cronogramas' : ''}`, "Estoy de acuerdo")) return false;
            // eliminar
            app_context.setCurrentLoading(true);
            let payload = [];
            await rows.filter(obj => payload.push(obj.id));
            let datos = JSON.stringify(payload);
            // request
            await unujobs.post(`cronograma/${cronograma.id}/remove`, { 
                _method: 'DELETE' ,
                cargo_id: form.cargo_id,
                condicion: condicion,
                type_categoria_id: form.type_categoria_id,
                historial: datos
            }, { headers: { CronogramaID: cronograma.id } })
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setPage(1);
                    setRows([]);
                    setIsFilter(true);
                })
                .catch(err => {
                    app_context.setCurrentLoading(false);
                    Swal.fire({ icon: "error", text: err.message })
                });
        }
    }

    // primera carga
    useEffect(() => {
        if (success) {
            getHistorial(false);
            entity_context.fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
            return () => entity_context.fireEntity({ render: false, disabled: false });
        }
    }, []);

    // cambio de pagina
    useEffect(() => {
        if (change_page) getHistorial(true);
        setChangePage(false);
    }, [change_page]);

    // realizar busqueda
    useEffect(() => {
        if (is_filter) getHistorial(false);
        setIsFilter(false);
    }, [is_filter]);

    // render
    return (
            <Fragment>
                <div className="col-md-12">
                    <BoardSimple
                        title={<HeaderCronograma cronograma={cronograma}/>}
                        info={["Eliminar trabajadores del cronograma"]}
                        prefix={<BtnBack/>}
                        bg="light"
                        options={[]}
                    >
                        <Form className="card-body">
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
                                            predeterminado={<PlaceholderHistorial/>}
                                        >
                                            {historial.map((obj, index) => 
                                                <List.Item key={`list-remove-historial-${index}`}>
                                                    <List.Content floated='right'>
                                                        <Button color={'red'}
                                                            basic={obj.check ? false : true}
                                                            className="mt-1"
                                                            onClick={(e) => handleCheck(obj, index)}
                                                        >
                                                            <i className={`fas fa-${obj.check ? 'trash' : 'times'}`}></i>
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

                                <Show condicion={!historial.length && !current_loading}>
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
                    </BoardSimple>
                </div>

                <Show condicion={rows.length}>
                    <BtnFloat theme="btn-red"
                        style={{ right: "40px" }}
                        onClick={remove}    
                    >
                        <i className="fas fa-trash"></i> 
                    </BtnFloat>
                </Show>
            </Fragment>
        )
};

// server rendering
RemoveCronograma.getInitialProps = async (ctx) => {
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
export default RemoveCronograma;
