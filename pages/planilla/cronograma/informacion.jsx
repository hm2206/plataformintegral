import React, { useState, useEffect, useContext } from 'react';
import { Body, DrownSelect } from '../../../components/Utils';
import { Button, Form, Message, Icon } from 'semantic-ui-react';
import { Row } from 'react-bootstrap';
import Show from '../../../components/show';
import dynamic from 'next/dynamic';
import HeaderCronograma from '../../../components/cronograma/headerCronograma';
import { CronogramaProvider } from '../../../contexts/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import { unujobs } from '../../../services/apis';
import atob from 'atob';
import Skeleton from 'react-loading-skeleton';
import NotFound from '../../../components/notFound';
import { parseUrl, Confirm, InputCredencias, InputAuth, InputEntity } from '../../../services/utils';
import { SelectCronogramaCargo, SelectCronogramaTypeCategoria } from '../../../components/select/cronograma';
import Router from 'next/router';
import TabCronograma from '../../../components/cronograma/TabCronograma';
import Swal from 'sweetalert2';
import UpdateDesctMassive from '../../../components/cronograma/updateDesctMassive';
import UpdateRemuMassive from '../../../components/cronograma/updateRemuMassive';
import ImpDescuento from '../../../components/cronograma/impDescuento';
import Open from '../../../components/cronograma/open';
import Cerrar from '../../../components/cronograma/close';
import SearchCronograma from '../../../components/cronograma/searchCronograma';
import { BtnFloat } from '../../../components/Utils';
import { credencials } from '../../../env.json';

const FooterCronograma = dynamic(() => import('../../../components/cronograma/footerCronograma'), { ssr: false });


const PlaceholderAvatar = () => <Skeleton circle={true} height="75px" width="75px"/>


const InformacionCronograma = ({ cronograma, success }) => {

    // context app
    const app_context = useContext(AppContext);

    const [option, setOption] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [historial, setHistorial] = useState({});
    const [config_edad, setConfigEdad] = useState({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [active, setActive] = useState(0);
    const [edit, setEdit] = useState(false);
    const [send, setSend] = useState(false);
    const [is_export, setIsExport] = useState(true);
    const [total, setTotal] = useState(0);
    const [last_page, setLastPage] = useState(0);
    const [block, setBlock] = useState(false);
    const [form, setForm] = useState({});
    const [is_editable, setIsEditable] = useState(true); 
    const [is_updatable, setIsUpdatable] = useState(true);
    const [change_page, setChangePage] = useState(false);

    // validaciones
    const isHistorial = Object.keys(historial).length;

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm({ ...newForm });
        setIsExport(false);
    }

    // obtener el historial del cronograma
    const findHistorial = async () => {
        setRefresh(false);
        setLoading(true);
        setBlock(true);
        setHistorial({});
        let query = `page=${page || 1}&query_search=${form.like || ""}&cargo_id=${form.cargo_id || ""}&type_categoria_id=${form.type_categoria_id || ""}`;
        await unujobs.get(`cronograma/${cronograma.id}/historial?${query}`)
            .then(async res => {
                let { success, message, config_edad } = res.data;
                let current_historial = res.data.historial;
                if (!success) throw new Error(message);
                // setting
                setHistorial(current_historial.data);
                setConfigEdad(config_edad);
                setTotal(current_historial.total);
                setLastPage(current_historial.last_page);
            }).catch(err => {
                setHistorial({});
                setConfigEdad({});
                setTotal(0);
                setLastPage(0);
                setBlock(false);
            });
        // datos cargados
        setLoading(false);
        setIsExport(true);
    } 

    // cambiar historial por page
    useEffect(() => {
        app_context.fireEntity({ render: true, disabled:true, entity_id: cronograma.entity_id });
        if (!refresh && change_page) {
            findHistorial();
            setChangePage(false);
        }
        return () => { }
    }, [change_page])

    // refrescar el historial
    useEffect(() => {
        if (refresh) findHistorial();
    }, [refresh == true]);

    // cambio de cronograma
    useEffect(() => {
        if (success && historial.cronograma_id != cronograma.id) findHistorial();
    }, [cronograma.id]);

    // configurar cabezeras
    const getHeaders = () => {
        return {
            CronogramaID: cronograma.id,
            EntityId: cronograma.entity_id
        }
    }

    // export excel
    const handleExport = async () => {
        let answer = await Confirm('warning', '¿Deseas exportar?', 'Exportar');
        if (answer) {
            app_context.fireLoading(true);
            let query = `cronograma_id=${cronograma.id}&cargo_id=${form.cargo_id || ""}&type_categoria_id=${form.type_categoria_id || ""}&query_search=${form.like || ""}`;
            await unujobs.fetch(`exports/personal/${cronograma.year}/${cronograma.mes}?${query}`)
            .then(resData => resData.blob())
            .then(blob => {
                app_context.fireLoading(false);
                let a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.target = "_blank";
                a.click();
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // sincronizar remuneraciones
    const syncRemuneracion = async () => {
        let response = await Confirm("warning", "¿Desea agregar las remuneraciones a los trabajadores?", "Confirmar");
        if (response) {
            app_context.fireLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/add_remuneracion`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // sincronización aportaciones
    const syncAportacion = async () => {
        let response = await Confirm("warning", "¿Desea agregar las aportaciones a los trabajadores?", "Confirmar");
        if (response) {
            app_context.fireLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/add_aportacion`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // procesar cronograma
    const processing = async () => {
        let response = await Confirm("warning", "¿Desea procesar el Cronograma?", "Confirmar");
        if (response) {
            app_context.fireLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/processing`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'successs', text: message });
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // sincronizar configuraciones del cronograma
    const syncConfigs = async () => {
        let response = await Confirm("warning", "¿Desea Sincronizar las Configuraciones?", "Confirmar");
        if (response) {
            app_context.fireLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/sync_configs`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // generar token a las boletas del cronograma
    const generateToken = async () => {
        let response = await Confirm("warning", "¿Desea Generar los tokens de las boletas?", "Confirmar");
        if (response) {
            app_context.fireLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/generate_token`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.fireLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(messsage);
                await Swal.fire({ icon: 'success', text: message });
            }).catch(err => {
                app_context.fireLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // obtener boleta valida
    const verifyBoleta = async (e) => {
        e.preventDefault();
        let answer = await Confirm('warning', '¿Desea visualizar la boleta verificada del trabajador actual?', 'Ir');
        if (answer) {
            app_context.fireLoading(true);
            // payload
            let payload = {
                token_verify: historial && historial.token_verify || "",
                ClientId: credencials.ClientId,
                ClientSecret: credencials.ClientSecret
            }
            // request
            await unujobs.post(`my_boleta`, payload)
                .then(res => {
                    app_context.fireLoading(false);
                    let { data } = res;
                    let blob = new Blob([data], { type: 'text/html' });
                    let newPrint = window.open(URL.createObjectURL(blob))
                    newPrint.onload = () => newPrint.print();
                }).catch(err => {
                    app_context.fireLoading(false);
                    Swal.fire({ icon: 'error', text: 'No se pudo obtener la boleta verificada!' })
                });
        }
    }

    // obtener reporte anual
    const linkRenta = async (e) => {
        e.preventDefault();
        let form = document.createElement('form');
        document.body.appendChild(form);
        // add credenciales
        InputCredencias().filter(i => form.appendChild(i));
        // add entityID
        form.appendChild(InputEntity());
        // add auth_token
        form.appendChild(InputAuth());
        form.action = `${unujobs.path + '/pdf/renta/' + historial.work_id + '?year=' + cronograma.year || ""}`;
        form.method = 'POST';
        form.target = '_blank';
        form.submit();
        document.body.removeChild(form);
    }

    // handleOptions
    const handleOnSelect = async (e, { name }) => {
        let { push, pathname, query } = Router;
        switch (name) {
            case 'desc-massive':
            case 'remu-massive':
            case 'imp-descuento':
                setOption(name);
                break;
            case 'report':
                let newQuery = {};
                newQuery.id = query.id;
                newQuery.href = pathname;
                await push({ pathname: parseUrl(pathname, 'report'), query: newQuery });
                break;
            case 'sync-remuneracion':
                await syncRemuneracion();
                break;
            case 'sync-aportacion':
                await syncAportacion();
                break;
            case 'processing':
                await processing();
                break;
            case 'sync-config':
                await syncConfigs();
                break;
            case 'generate-token':
                await generateToken();
                break;
            default:
                break;
        }
    }
    
    // render
    return <CronogramaProvider value={{  
                cronograma,
                setChangePage,
                is_editable,
                setIsEditable,
                setOption,
                setForm,
                setRefresh,
                page,
                setPage,
                active,
                setActive,
                last_page,
                setLastPage,
                total, 
                setTotal,
                historial,
                setHistorial,
                edit,
                setEdit,
                send,
                setSend,
                block,
                setBlock,
                loading,
                setLoading,
                is_updatable, 
                setIsUpdatable
            }}
        >
            <div className="col-md-12 form ui">
                <Body>
                    
                    {/* Header */}
                    <HeaderCronograma/>

                    <div className="col-md-12 mt-3">
                        <hr/>
                        <Show condicion={success}
                            predeterminado={<NotFound message="El cronograma de pago no existe"/>}
                        >
                            <div className="card-" style={{ minHeight: "80vh" }}>
                                <div className="card-header">
                                    {/* mensaje cuando el trabajador tiene saldo negativo o neutro */}
                                    <Show condicion={historial.total_neto < 0}>
                                        <Message color="red">
                                            El trabajador tiene saldo negativo de ({historial.total_neto})
                                        </Message>
                                    </Show>
                                    {/* mensaje cuando el trabajador superó el limite de edad */}
                                    <Show condicion={config_edad && config_edad.valido == 0}>
                                        <Message color="yellow">
                                            El trabajador ya superó el limite de edad({config_edad.limite_edad}) establecido en la partición presupuestal.
                                        </Message>
                                    </Show>
                                    {/* mensaje cuento el cronograma esta cerrado y el trabajador no tiene generado su token */}
                                    <Show condicion={historial && cronograma && historial.total && !cronograma.estado && !historial.token_verify}>
                                        <Message color="orange">
                                            Falta generar el token de verificación del trabajador
                                        </Message>
                                    </Show>

                                    <div className="row align-items-center">
                                        <div className="col-md-1 text-center mb-3">
                                            <Show condicion={!loading}
                                                predeterminado={<PlaceholderAvatar/>}
                                            >
                                                <img src={historial.person && historial.person.image_images && historial.person.image_images.image_200x200 || '/img/perfil.jpg'} 
                                                    alt="imagen_persona"
                                                    style={{ 
                                                        width: "75px", 
                                                        height: "75px", 
                                                        border: "5px solid #fff", 
                                                        borderRadius: "50%",
                                                        boxShadow: "0px 0px 1px 2px rgba(0, 0, 0, 0.1)",
                                                        objectFit: 'cover'
                                                    }}    
                                                />
                                            </Show>
                                        </div>

                                        <div className="col-md-8 col-lg-8 mb-2 uppercase">
                                            <Show condicion={!loading}
                                                predeterminado={<Skeleton/>}
                                            >
                                                <Show condicion={historial.token_verify}>
                                                    <a href="#" title="Boleta verificada"
                                                        onClick={verifyBoleta}
                                                    >
                                                        <i className="fas fa-qrcode text-warning mr-2"></i>
                                                        <span className="text-dark">BOLETA DE "{historial.person ? historial.person.fullname : "NO HAY TRABAJADOR"}"</span>
                                                    </a>
                                                </Show>

                                                <Show condicion={!historial.token_verify}>
                                                    <i className="fas fa-info-circle"></i> INFORMACIÓN DE "{historial.person ? historial.person.fullname : "NO HAY TRABAJADOR"}"
                                                </Show> 
                                                            
                                                {/* link temporal del reporte de renta */}
                                                <Show condicion={historial.work_id}>
                                                    <a href="#" className="ml-3" title="Reporte de Renta"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={linkRenta}
                                                    >
                                                        <i className="fas fa-link"></i>
                                                    </a>
                                                </Show>
                                            </Show>
                                        </div>

                                        <div className="col-md-3 text-center">
                                            {/* cronograma abierta */}
                                            <Show condicion={cronograma.estado}>
                                                <DrownSelect text="Opciones"
                                                    button
                                                    icon="options"
                                                    labeled
                                                    disabled={loading|| edit || block}
                                                    options={[
                                                        { key: "desc-massive", text: "Descuento Masivo", icon: "cart arrow down" },
                                                        { key: "remu-massive", text: "Remuneración Masiva", icon: "cart arrow down" },
                                                        { key: "sync-remuneracion", text: "Agregar Remuneraciones", icon: "arrow circle down" },
                                                        { key: "sync-aportacion", text: "Agregar Aportaciones", icon: "arrow circle down" },
                                                        { key: "sync-config", text: "Sync. Configuraciones", icon: "cloud download" },
                                                        { key: "imp-descuento", text: "Importar Descuentos", icon: "cloud upload" },
                                                        { key: "processing", text: "Procesar Cronograma", icon: "database" },
                                                        { key: "report", text: "Reportes", icon: "file text outline" },
                                                    ]}
                                                    onSelect={handleOnSelect}
                                                />
                                            </Show>
                                            {/* cronograma cerrada */}
                                            <Show condicion={!cronograma.estado}>
                                                <DrownSelect text="Opciones"
                                                    button
                                                    icon="options"
                                                    labeled
                                                    disabled={loading || edit || block}
                                                    options={[
                                                        { key: "generate-token", text: "Generar Token", icon: "cloud upload" },
                                                        { key: "email", text: "Mail Masivos", icon: "mail" },
                                                        { key: "report", text: "Reportes", icon: "file text outline" },
                                                    ]}
                                                    onSelect={handleOnSelect}
                                                />
                                            </Show>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body" style={{ marginBottom: "10em" }}>
                                    <Row>
                                        <form className="col-md-6 col-lg-3 col-12 col-sm-6 mb-1" onSubmit={async (e) => {
                                                e.preventDefault();
                                                await setPage(1);
                                                await findHistorial();
                                            }}
                                        >
                                            <Form.Field> 
                                                <input type="search" 
                                                    className={`${form.like ? 'border-dark text-dark' : ''}`}
                                                    disabled={loading || edit || block}
                                                    value={form.like || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                    name="like"
                                                    placeholder="Buscar por Apellidos y Nombres"
                                                />  
                                            </Form.Field>
                                        </form>

                                        <div className="col-md-6 col-12 mb-1 col-sm-6 col-lg-3">
                                            <Form.Field>
                                                <SelectCronogramaCargo
                                                    name="cargo_id"
                                                    cronograma_id={cronograma.id}
                                                    value={form.cargo_id}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                    disabled={loading || edit || block}
                                                />
                                            </Form.Field>
                                        </div>
                                                            
                                        <div className="col-md-6 col-sm-6 col-lg-3 mb-1 col-12">
                                            <Form.Field>
                                                <SelectCronogramaTypeCategoria
                                                    name="type_categoria_id"
                                                    cronograma_id={cronograma.id}
                                                    value={form.type_categoria_id}
                                                    onChange={(e, obj) => handleInput(obj)}
                                                    disabled={loading || edit || block}
                                                />
                                            </Form.Field>
                                        </div>
                                                            
                                        <div className="col-md-3 col-lg-2 col-6 mb-1">
                                            <Button color="black"
                                                fluid
                                                onClick={findHistorial}
                                                title="Realizar Búsqueda"
                                                disabled={loading || edit || block}
                                            >
                                                <Icon name="filter"/> Filtrar
                                            </Button>
                                        </div>

                                        <div className="col-md-1 col-lg-1 col-6 mb-1">
                                            <Button color="olive"
                                                fluid
                                                onClick={handleExport}
                                                title="Exporta los datos a excel"
                                                disabled={loading || edit || block || !isHistorial}
                                            >
                                                <Icon name="share"/>
                                            </Button>
                                        </div>

                                        <Show condicion={!loading && !isHistorial}
                                            predeterminado={<TabCronograma/>}
                                        >
                                            <div className="w-100 text-center">
                                                <h4 className="mt-5">No se encontró trabajadores</h4>
                                            </div>
                                        </Show>
                                    </Row>
                                </div>
                            </div>
                        </Show>
                    </div>
                </Body>
            </div>

            {/* footer */}
            <Show condicion={success}>
                <FooterCronograma/>
            </Show>

        
            <BtnFloat style={{ bottom: '120px', background: "#cecece" }}
                size="md"
                onClick={(e) => setOption('search_cronograma')}
                loading={loading}
                disabled={loading || edit || block}
            >
                <i className="fas fa-search"></i>
            </BtnFloat>

            <Show condicion={option == 'desc-massive'}>
                <UpdateDesctMassive isClose={(e) => setOption("")}/>
            </Show>

            <Show condicion={option == 'remu-massive'}>
                    <UpdateRemuMassive isClose={(e) => setOption("")}/>
            </Show>

            <Show condicion={option == 'imp-descuento'}>
                <ImpDescuento isClose={(e) => setOption("")}/>
            </Show>

            <Show condicion={option == 'open'}>
                <Open cronograma={cronograma}
                    isClose={(e) => setOption("")}
                />
            </Show>

            <Show condicion={option == 'cerrar'}>
                <Cerrar cronograma={cronograma}
                    isClose={(e) => setOption("")}
                />
            </Show>

            <Show condicion={option == 'search_cronograma'}> 
                <SearchCronograma cronograma={cronograma}
                    isClose={e => setOption("")}
                />
            </Show>
    </CronogramaProvider>
}

InformacionCronograma.getInitialProps = async (ctx) => {
    let { query, pathname } = ctx;
    // procesos
    let id = atob(query.id) || '_error';
    let { success, cronograma } = await unujobs.get(`cronograma/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({
        success: false,
        cronograma: {}
    }));
    // response
    return { query, pathname, cronograma, success };
}

export default InformacionCronograma;