import React, { useState, useEffect, useContext } from 'react';
import { DrownSelect, BtnFloat, BtnBack } from '../../../components/Utils';
import { Button, Form, Message, Icon } from 'semantic-ui-react';
import { Row } from 'react-bootstrap';
import Show from '../../../components/show';
import dynamic from 'next/dynamic';
import { CronogramaProvider } from '../../../contexts/cronograma/CronogramaContext';
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
import ModalReport from '../../../components/cronograma/modalReport';
import ChangeMeta from '../../../components/cronograma/changeMeta';
import ChangeCargo from '../../../components/cronograma/changeCargo';
import AddDiscount from '../../../components/cronograma/addDiscount'
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import HeaderCronograma from '../../../components/cronograma/headerCronograma';
import SyncConfigDescuento from '../../../components/cronograma/syncConfigDescuento'
import { EntityContext } from '../../../contexts/EntityContext';
import NotFoundData from '../../../components/notFoundData';

const FooterCronograma = dynamic(() => import('../../../components/cronograma/footerCronograma'), { ssr: false });


const PlaceholderAvatar = () => <Skeleton circle={true} height="75px" width="75px"/>


const InformacionCronograma = ({ pathname, query, success, cronograma }) => {

    // validar data
    if (!success) return <NotFoundData/>

    // context app
    const app_context = useContext(AppContext);

    // entity
    const entity_context = useContext(EntityContext);

    const [option, setOption] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [historial, setHistorial] = useState({});
    const [config_edad, setConfigEdad] = useState({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [active, setActive] = useState(0);
    const [edit, setEdit] = useState(false);
    const [send, setSend] = useState(false);
    const [is_filter, setIsFilter] = useState(false);
    const [total, setTotal] = useState(0);
    const [last_page, setLastPage] = useState(0);
    const [block, setBlock] = useState(false);
    const [form, setForm] = useState({});
    const [is_editable, setIsEditable] = useState(true); 
    const [is_updatable, setIsUpdatable] = useState(true);
    const [change_page, setChangePage] = useState(false);
    const [cancel, setCancel] = useState(false);

    // validaciones
    const isHistorial = Object.keys(historial).length;

    // cambiar el form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm({ ...newForm });
    }

    // obtener el historial del cronograma
    const findHistorial = async () => {
        setRefresh(false);
        setIsFilter(false);
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
    } 

    // configurar entity
    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
        return () => entity_context.fireEntity({ render: false, disabled: false });
    }, []);

    // cambiar historial por page
    useEffect(() => {
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

    // activar edicion
    useEffect(() => {
        if (true) setCancel(false);
    }, [edit]);

    // activar cancel
    useEffect(() => {
        if (cancel) setEdit(false);
    }, [cancel]);

    // realizar filtro
    useEffect(() => {
        if (is_filter) findHistorial();
    }, [is_filter]);

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
            app_context.setCurrentLoading(true);
            let query = `cronograma_id=${cronograma.id}&cargo_id=${form.cargo_id || ""}&type_categoria_id=${form.type_categoria_id || ""}&query_search=${form.like || ""}`;
            await unujobs.fetch(`exports/personal/${cronograma.year}/${cronograma.mes}?${query}`)
            .then(resData => resData.blob())
            .then(blob => {
                app_context.setCurrentLoading(false);
                let a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.target = "_blank";
                a.click();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // seleccionar cronograma
    const handleSelect = async (cro) => {
        let { push } = Router;
        let id = btoa(cro.id);
        query.id = id;
        setOption("");
        await push({ pathname, query });
    }

    // sincronizar remuneraciones
    const syncRemuneracion = async () => {
        let response = await Confirm("warning", "¿Desea agregar las remuneraciones a los trabajadores?", "Confirmar");
        if (response) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/add_remuneracion`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                findHistorial();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // sincronización aportaciones
    const syncAportacion = async () => {
        let response = await Confirm("warning", "¿Desea agregar las aportaciones a los trabajadores?", "Confirmar");
        if (response) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/add_aportacion`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                findHistorial();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // sincronizar descuentos
    const syncDescuentos = async () => {
        let response = await Confirm("warning", "¿Desea agregar los descuentos a los trabajadores?", "Confirmar");
        if (response) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/add_descuento`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                findHistorial();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // sincronizar obligaciones
    const syncObligaciones = async () => {
        let response = await Confirm("warning", "¿Desea agregar las obligaciones judiciales a los trabajadores?", "Confirmar");
        if (response) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/add_obligacion`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // procesar cronograma
    const processing = async () => {
        let response = await Confirm("warning", "¿Desea procesar el Cronograma?", "Confirmar");
        if (response) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/processing`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                findHistorial();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // sincronizar configuraciones del cronograma
    const syncConfigs = async () => {
        let response = await Confirm("warning", "¿Desea Sincronizar las Configuraciones?", "Confirmar");
        if (response) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/sync_configs`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await findHistorial();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // generar token a las boletas del cronograma
    const generateToken = async () => {
        let response = await Confirm("warning", "¿Desea Generar los tokens de las boletas?", "Confirmar");
        if (response) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`cronograma/${cronograma.id}/generate_token`, {}, { headers: getHeaders() })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                await Swal.fire({ icon: 'success', text: message || 'Los tokens se generarón correctamente!' });
                await findHistorial();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            })
        }
    }

    // obtener boleta valida
    const verifyBoleta = async (e) => {
        e.preventDefault();
        let answer = await Confirm('warning', '¿Desea visualizar la boleta verificada del trabajador actual?', 'Ir');
        if (answer) {
            app_context.setCurrentLoading(true);
            // payload
            let payload = {
                token_verify: historial && historial.token_verify || "",
                ClientId: process?.env?.NEXT_PUBLIC_CLIENT_ID || '',
                ClientSecret: process?.env?.NEXT_PUBLIC_CLIENT_SECRET || ''
            }
            // request
            await unujobs.post(`my_boleta`, payload)
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { data } = res;
                    let blob = new Blob([data], { type: 'text/html' });
                    let newPrint = window.open(URL.createObjectURL(blob))
                    newPrint.onload = () => newPrint.print();
                }).catch(err => {
                    app_context.setCurrentLoading(false);
                    Swal.fire({ icon: 'error', text: 'No se pudo obtener la boleta verificada!' })
                });
        }
    }

    // añadir o quitar al plame
    const togglePlame = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en ${cronograma.plame ? 'quitar de ' : 'aplicar al'} PDF-PLAME?`, 'Confirmar');
        if (answer) {
            app_context.setCurrentLoading(true);
            // request
            await unujobs.post(`cronograma/${cronograma.id}/plame`, {}, { headers: getHeaders() })
                .then(async res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    let { push, pathname, query } = Router;
                    await push({ pathname, query });
                }).catch(err => {
                    try {
                        app_context.setCurrentLoading(false);
                        let { data } = err.response;
                        if (typeof data != 'object') throw new Error(err.message);
                        throw new Error(data.message);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: err.message })   
                    }
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
            case 'change-meta':
            case 'change-cargo':
            case 'sync-config-desct':
            case 'discount':
            case 'report':
                setOption(name);
                break;
            case 'email':
                let newQuery = {};
                newQuery.id = query.id;
                newQuery.href = pathname;
                await push({ pathname: parseUrl(pathname, name), query: newQuery });
                break;
            case 'sync-remuneracion':
                await syncRemuneracion();
                break;
            case 'sync-aportacion':
                await syncAportacion();
                break;
            case 'sync-descuento':
                await syncDescuentos();
                break;
            case 'sync-obligacion':
                await syncObligaciones();
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
            case 'plame':
                await togglePlame();
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
                setIsUpdatable,
                cancel,
                setCancel,
            }}
        >
            <div className="col-md-12 form ui">
                <BoardSimple
                    options={[]}
                    title={<HeaderCronograma cronograma={cronograma}/>}
                    info={["Información del cronograma"]}
                    prefix={<BtnBack/>}
                    bg="light"
                >
                    <div className="col-md-12 mt-3">
                        <Show condicion={cronograma.plame}>
                            <Message className="disable">
                                <div><b>El cronograma aplica para el</b> <span className="badge badge-dark">PDT-PLAME</span></div>
                            </Message>
                            <hr/>
                        </Show>

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
                                                        { key: 'sync-descuento', text: "Agregar Descuentos", icon: "arrow circle down" },
                                                        { key: "sync-aportacion", text: "Agregar Aportaciones", icon: "arrow circle down" },
                                                        { key: 'sync-obligacion', text: "Agregar Obl. Judiciales", icon: "arrow circle arrow down" },
                                                        { key: "change-meta", text: "Cambio de Metas", icon: "exchange" },
                                                        { key: "change-cargo", text: "Cambio de Partición Presp.", icon: "exchange" },
                                                        { key: "discount", text: "Dsto. Escalafón", icon: "balance scale" },
                                                        { key: "imp-descuento", text: "Importar Descuentos", icon: "cloud upload" },
                                                        { key: "sync-config-desct", text: "Sync. Desc. Global", icon: "cloud upload" },
                                                        { key: "sync-config", text: "Sync. Configuraciones", icon: "cloud download" },
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
                                                        { key: "plame", text: `${!cronograma.plame ? 'Aplicar' : 'No aplicar'} al PDT-PLAME`, icon: "balance scale"},
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
                                                setPage(1);
                                                setIsFilter(true);
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
                                                    execute={false}
                                                    refresh={cronograma.id || false}
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
                                                    execute={false}
                                                    refresh={cronograma.id || false}
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
                                                onClick={(e) => {
                                                    setPage(1);
                                                    setIsFilter(true);
                                                }}
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
                </BoardSimple>
            </div>

            {/* footer */}
            <Show condicion={success}>
                <FooterCronograma/>
            </Show>

        
            <BtnFloat style={{ bottom: '120px' }}
                size="md"
                theme="btn-warning"
                onClick={(e) => setOption('search_cronograma')}
                loading={loading}
                disabled={loading || edit || block}
            >
                <i className="fas fa-search"></i>
            </BtnFloat>

            <Show condicion={option == 'desc-massive'}>
                <UpdateDesctMassive isClose={(e) => setOption("")}/>
            </Show>

            <Show condicion={option == 'sync-config-desct'}>
                <SyncConfigDescuento isClose={(e) => setOption("")}/>
            </Show>

            <Show condicion={option == 'remu-massive'}>
                    <UpdateRemuMassive isClose={(e) => setOption("")}/>
            </Show>

            <Show condicion={option == 'imp-descuento'}>
                <ImpDescuento 
                    isClose={(e) => setOption("")}
                    onSave={(e) => setRefresh(true)}
                />
            </Show>

            <Show condicion={option == 'open'}>
                <Open cronograma={cronograma}
                    onSave={findHistorial}
                    isClose={(e) => setOption("")}
                />
            </Show>

            <Show condicion={option == 'cerrar'}>
                <Cerrar cronograma={cronograma}
                    isClose={(e) => setOption("")}
                />
            </Show>

            <Show condicion={option == 'report'}>
                <ModalReport
                    cronograma={cronograma}
                    isClose={(e) => setOption("")}
                />
            </Show>

            <Show condicion={option == 'change-meta'}>
                <ChangeMeta
                    cronograma={cronograma}
                    isClose={(e) => setOption("")}
                />
            </Show>

            <Show condicion={option == 'change-cargo'}>
                <ChangeCargo
                    cronograma={cronograma}
                    isClose={(e) => setOption("")}
                />
            </Show>
    
            <Show condicion={option == 'sync-config-desc'}>
                <ChangeMeta
                    cronograma={cronograma}
                    isClose={(e) => setOption("")}
                />
            </Show>

            <Show condicion={option == 'discount'}>
                <AddDiscount
                    cronograma={cronograma}
                    isClose={(e) => setOption("")}
                />
            </Show>

            {/* cambiar de cronograma */}
            <SearchCronograma 
                cronograma={cronograma}
                isClose={e => setOption("")}
                show={option == 'search_cronograma' ? true : false}
                onSelect={handleSelect}
            />
    </CronogramaProvider>
}

InformacionCronograma.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
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