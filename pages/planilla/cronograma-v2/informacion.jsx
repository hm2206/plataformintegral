import React, { useState, useEffect, useContext, useMemo } from 'react';
import { DrownSelect, BtnFloat, BtnBack } from '../../../components/Utils';
import { Button, Form, Message, Icon } from 'semantic-ui-react';
import { Row } from 'react-bootstrap';
import Show from '../../../components/show';
import dynamic from 'next/dynamic';
import { CronogramaProvider } from '../../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../../contexts/AppContext';
import { unujobs, microPlanilla } from '../../../services/apis';
import atob from 'atob';
import Skeleton from 'react-loading-skeleton';
import NotFound from '../../../components/notFound';
import { parseUrl, Confirm, InputCredencias, InputAuth, InputEntity } from '../../../services/utils';
import Router from 'next/router';
import TabCronograma from '../../../components/planilla/cronograma/TabCronograma';
import Swal from 'sweetalert2';
import UpdateDesctMassive from '../../../components/planilla/cronograma/updateDesctMassive';
import UpdateRemuMassive from '../../../components/planilla/cronograma/updateRemuMassive';
import ImpDescuento from '../../../components/planilla/cronograma/impDescuento';
import Open from '../../../components/planilla/cronograma/open';
import Cerrar from '../../../components/planilla/cronograma/close';
import SearchCronograma from '../../../components/planilla/cronograma/searchCronograma';
import ModalReport from '../../../components/planilla/cronograma/modalReport';
import ChangeMeta from '../../../components/planilla/cronograma/change-pim';
import AddDiscount from '../../../components/planilla/cronograma/addDiscount'
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import HeaderCronograma from '../../../components/planilla/cronograma/headerCronograma';
import SyncConfigDescuento from '../../../components/planilla/cronograma/syncConfigDescuento'
import { EntityContext } from '../../../contexts/EntityContext';
import NotFoundData from '../../../components/notFoundData';
import useProcessCronograma from '../../../components/planilla/cronograma/hooks/useProcessCronograma';
import { ToastContainer } from 'react-toastify';
import ChangePimAportation from '../../../components/planilla/cronograma/change-pim-aportation';
import ChangePimRemuneration from '../../../components/planilla/cronograma/change-pim-remuneration';

const FooterCronograma = dynamic(() => import('../../../components/planilla/cronograma/footerCronograma'), { ssr: false });


const PlaceholderAvatar = () => <Skeleton circle={true} height="75px" width="75px"/>


const InformacionCronograma = ({ pathname, query, success, cronograma }) => {

  // validar data
  if (!success) return <NotFoundData />

  // context app
  const app_context = useContext(AppContext);

  // entity
  const entity_context = useContext(EntityContext);

  // hooks
  const processCronograma = useProcessCronograma(cronograma);

  const [option, setOption] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [historial, setHistorial] = useState({});
  const [isProcessing, setIsProcessing] = useState(cronograma.processing || false);
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
    const params = new URLSearchParams();
    params.set('page', page || 1);
    params.set('limit', 1);
    if (form?.like) params.set('querySearch', form.like);
    await microPlanilla.get(`cronogramas/${cronograma.id}/historials`, { params })
      .then(async res => {
        let { items, meta } = res.data;
        const currentHistorial = items[0] || {};
        if (!currentHistorial?.id) throw new Error();
        // setting
        setIsProcessing(currentHistorial?.cronograma?.processing || false);
        setHistorial(currentHistorial);
        setConfigEdad({});
        setTotal(meta?.totalItems);
        setLastPage(meta?.totalPages);
        setBlock(false);
      }).catch(() => {
        setHistorial({});
        setConfigEdad({});
        setTotal(0);
        setLastPage(0);
        setBlock(false);
      });
    // datos cargados
    setLoading(false);
  }

  // display person
  const displayPerson = useMemo(() => {
    return historial?.info?.contract?.work?.person || {}
  }, [historial]);

  const fullname = useMemo(() => {
    return `${displayPerson?.fullName || "NO HAY TRABAJADOR"}`.toUpperCase() 
  }, [displayPerson]);

  // configurar entity
  useEffect(() => {
    entity_context.fireEntity({ render: true, disabled: true, entity_id: cronograma.campusId });
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
      await microPlanilla.get(`cronogramas/${cronograma.id}/reports/tickets.xlsx`, {
        responseType: "blob"
      })
      .then(({ data }) => {
        app_context.setCurrentLoading(false);
        let a = document.createElement('a');
        a.href = URL.createObjectURL(data);
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

  // procesar cronograma
  const processing = async () => {
    let answer = await Confirm("warning", "¿Desea procesar el Cronograma?", "Confirmar");
    if (!answer) return;
    await processCronograma.processing()
      .then(() => {
        setIsProcessing(true);
        findHistorial();
      })
      .catch(() => (null))
  }

  // generar token a las boletas del cronograma
  const generateToken = async () => {
    let response = await Confirm("warning", "¿Desea Generar los tokens de las boletas?", "Confirmar");
    if (!response) return;
    app_context.setCurrentLoading(true);
    await microPlanilla.put(`cronogramas/${cronograma.id}/generateToken`, {}, { headers: getHeaders() })
    .then(async () => {
      app_context.setCurrentLoading(false);
      await Swal.fire({ icon: 'success', text: 'Los tokens se generarón correctamente!' });
      await findHistorial();
    }).catch(() => {
      app_context.setCurrentLoading(false);
      Swal.fire({ icon: 'error', text: "No se pudo generar los tokens" })
    })
  }

  // añadir o quitar al plame
  const togglePlame = async () => {
    let answer = await Confirm('warning', `¿Estás seguro en ${cronograma.plame ? 'quitar de ' : 'aplicar al'} PDF-PLAME?`, 'Confirmar');
    if (!answer) return;
    app_context.setCurrentLoading(true);
    // request
    await microPlanilla.put(`cronogramas/${cronograma.id}/togglePlame`, {}, { headers: getHeaders() })
    .then(async () => {
        app_context.setCurrentLoading(false);
        await Swal.fire({ icon: 'success', text: "Los cambios se aplicarón correctamente!" });
        let { push, pathname, query } = Router;
        await push({ pathname, query });
    }).catch(() => {
      app_context.setCurrentLoading(false);
      Swal.fire({ icon: 'error', text: "No se pudó guardar los cambios" })   
    });
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
      case 'massive-discount':
      case 'massive-remuneration':
      case 'imp-descuento':
      case 'change-pim':
      case 'change-pim-aportation':
      case 'change-pim-remuneration':
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
      case 'processing':
          await processing();
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
  return (
    <CronogramaProvider value={{  
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
              info={[`Información del cronograma`]}
              prefix={<BtnBack/>}
              bg="light"
          >
                <div className="col-md-12 mt-3">
                    <Show condicion={!cronograma.state}>
                      <Message className="disable" info>
                        <div><b>El envio de  boletas al correo son:</b> 
                        <span className="badge badge-dark ml-2">5:00 am A 8:00 pm</span></div>
                        <div><small>Solo se enviarán las boletas verificadas</small></div>
                      </Message>
                      <hr/>
                    </Show>

                    <Show condicion={cronograma.isPlame}>
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
                            <Show condicion={!loading && cronograma.state && !historial.isSync}>
                              <Message color="yellow">
                                La configuración de pago no está sincronizada
                              </Message>
                            </Show>
                            {/* mensaje cuando el cronograma debe procesar */}
                            <Show condicion={!loading && cronograma.state && isProcessing}>
                              <Message color="yellow">
                                Se encontró actualizaciones de la configuración de pago.
                                <div className="text-right">
                                  <span className='ml-2 text-primary cursor-pointer'
                                    onClick={processing}
                                  >
                                    <u>Procesar Cronograma</u>
                                  </span>
                                </div>
                              </Message>
                            </Show>
                            {/* mensaje cuento el cronograma esta cerrado y el trabajador no tiene generado su token */}
                            <Show condicion={!loading && !cronograma.state && !historial.tokenVerify}>
                              <Message color="orange">
                                Falta generar el token de verificación de pago
                              </Message>
                            </Show>

                            <div className="row align-items-center">
                              <div className="col-md-1 text-center mb-3">
                                <Show condicion={!loading}
                                  predeterminado={<PlaceholderAvatar/>}
                                >
                                  <img src={historial?.work?.person?.image_images.image_200x200 || '/img/perfil.jpg'} 
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
                                  <Show condicion={historial.tokenVerify}>
                                    <a href="#" title="Boleta verificada">
                                      <i className="fas fa-qrcode text-warning mr-2"></i>
                                      <span className="text-dark">BOLETA DE "{fullname}"</span>
                                    </a>
                                  </Show>

                                  <Show condicion={!historial.tokenVerify}>
                                    <i className="fas fa-info-circle"></i> INFORMACIÓN DE "{fullname}"
                                  </Show> 

                                  {/* mensaje de boleta enviada */}
                                  <Show condicion={historial?.sendEmail}>
                                    <div><i className="fas fa-check-double text-success"></i> Boleta Enviada</div>
                                  </Show>
                                </Show>
                              </div>

                              <div className="col-md-3 text-center">
                                {/* cronograma abierta */}
                                <Show condicion={cronograma.state}>
                                  <DrownSelect text="Opciones"
                                    button
                                    icon="options"
                                    labeled
                                    disabled={loading|| edit || block || processCronograma.loading}
                                    options={[
                                      { key: "change-pim", text: "Cambio de PIM", icon: "exchange" },
                                      { key: "change-pim-remuneration", text: "Cambio de PIM Remu.", icon: "exchange" },
                                      { key: "change-pim-aportation", text: "Cambio de PIM Aport.", icon: "exchange" },
                                      { key: "massive-discount", text: "Dscto. Masivo", icon: "upload" },
                                      { key: "massive-remuneration", text: "Remu. Masivo", icon: "upload" },
                                      { key: "processing", text: "Procesar Cronograma", icon: "database" },
                                      { key: "report", text: "Reportes", icon: "file text outline" },
                                    ]}
                                    onSelect={handleOnSelect}
                                  />
                                </Show>
                                {/* cronograma cerrada */}
                                <Show condicion={!cronograma.state}>
                                  <DrownSelect text="Opciones"
                                    button
                                    icon="options"
                                    labeled
                                    disabled={loading || edit || block || processCronograma.loading}
                                    options={[
                                      { key: "generate-token", text: "Generar Token", icon: "cloud upload" },
                                      { key: "plame", text: `${!cronograma.isPlame ? 'Aplicar' : 'No aplicar'} al PDT-PLAME`, icon: "balance scale"},
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
                              <form className="col-md-6 col-lg-3 col-12 col-sm-6 mb-1" onSubmit={e => {
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
                                                          
                              <div className="col-md-3 col-lg-2 col-6 mb-1">
                                <Button color="black"
                                  fluid
                                  onClick={() => {
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

      <Show condicion={option == 'massive-discount'}>
        <UpdateDesctMassive isClose={(e) => setOption("")}/>
      </Show>

      <Show condicion={option == 'massive-remuneration'}>
        <UpdateRemuMassive isClose={(e) => setOption("")}/>
      </Show>

      <Show condicion={option == 'imp-descuento'}>
        <ImpDescuento 
          isClose={() => setOption("")}
          onSave={() => setRefresh(true)}
        />
      </Show>

      <Show condicion={option == 'open'}>
        <Open cronograma={cronograma}
          onSave={findHistorial}
          isClose={() => setOption("")}
        />
      </Show>

      <Show condicion={option == 'cerrar'}>
        <Cerrar cronograma={cronograma}
          isClose={() => setOption("")}
        />
      </Show>

      <Show condicion={option == 'report'}>
        <ModalReport
          cronograma={cronograma}
          isClose={() => setOption("")}
        />
      </Show>

      <Show condicion={option == 'change-pim'}>
        <ChangeMeta
          cronograma={cronograma}
          isClose={() => setOption("")}
        />
      </Show>

      <Show condicion={option == 'change-pim-aportation'}>
        <ChangePimAportation
          cronograma={cronograma}
          isClose={() => setOption("")}
        />
      </Show>

      <Show condicion={option == 'change-pim-remuneration'}>
        <ChangePimRemuneration
          cronograma={cronograma}
          isClose={() => setOption("")}
        />
      </Show>

      {/* cambiar de cronograma */}
      <SearchCronograma 
        cronograma={cronograma}
        isClose={() => setOption("")}
        show={option == 'search_cronograma' ? true : false}
        onSelect={handleSelect}
      />

      {/* toast */}
      <ToastContainer/>
    </CronogramaProvider>
  )
}

InformacionCronograma.getInitialProps = async (ctx) => {
  AUTHENTICATE(ctx);
  let { query, pathname } = ctx;
  // procesos
  let id = atob(query.id) || '_error';
  let { success, cronograma } = await microPlanilla.get(`cronogramas/${id}`, {}, ctx)
    .then(res => ({ success: true, cronograma: res.data }))
    .catch(() => ({
    success: false,
    cronograma: {}
  }));
  // response
  return { query, pathname, cronograma, success };
}

export default InformacionCronograma;