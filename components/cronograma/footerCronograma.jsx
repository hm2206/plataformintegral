import React, { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Icon, Button } from 'semantic-ui-react';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';
import { Confirm } from '../../services/utils';
import Show from '../show';
import Swal from 'sweetalert2';
import { unujobs } from '../../services/apis';

const PlaceholderButton = () => <Skeleton height="38px"/>

const FooterCronograma = () => {
    
    // context app
    const app_context = useContext(AppContext);

    // context cronograma
    const { 
        cronograma, edit, setEdit, send, setSend, total, 
        last_page, block, setBlock, loading, historial, 
        page, setPage, setForm, setRefresh, is_editable,
        setOption, setChangePage, is_updatable, setCancel,
    } = useContext(CronogramaContext);

    const isHistorial = Object.keys(historial).length;

    const next = async (e) => {
        if (!edit) {
            if (page < last_page) {
                setChangePage(true);
                setPage(page + 1);
            }else {
                Swal.fire({ icon: "warning", text: "No hay más registros" });
            }
        } 
    }

    const previus = async (e) => {
        if (!edit) {
            if (page > 1) {
                setChangePage(true);
                setPage(page - 1);
            }else {
                Swal.fire({ icon: "warning", text: "No hay más registros" });
            }
        }
    }

    const clearHistorial = () => {
        setRefresh(true);
        setPage(1);
        setEdit(false);
        setForm({
            cargo_id: "",
            like: "",
            type_categoria_id: ""
        });
    }

    const handleConfirm = async () => {
        let { value } = await Swal.fire({ 
            icon: 'warning',
            text: "¿Deseas guardar los cambios?",
            confirmButtonText: "Continuar",
            showCancelButton: true
        });
        // valdiar 
        if (value) {
            setSend(true);
            setBlock(false);
        } else {
            setSend(false);
            setBlock(false);
        }
    }

    // enviar email
    const sendEmail = async () => {
        let answer = await Confirm("warning", `¿Deseas enviar la boleta a su correo?`);
        if (answer) {
            app_context.setCurrentLoading(true);
            setBlock(true);
            await unujobs.post(`historial/${historial.id}/send_boleta`)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
            }).catch(err => {
                try {
                    app_context.setCurrentLoading(false);
                    let { message } = err.response.data;
                    Swal.fire({ icon: 'error', text: message });
                } catch (error) {
                    Swal.fire({ icon: 'error', text: err.message });
                }
            });
            setBlock(false);
        }
    }

    return <div className="nav-bottom">
        <div className="row justify-content-end">
            <div className="col-md-4 col-lg-3 col-sm-2 col-12"></div>

            <div className="col-md-5 col-lg-5 col-sm-5 col-12">
                <div className="row">
                    <Show condicion={!isHistorial && !loading}>
                        <div className="col-md-4 mb-1">   
                            <Button color="red"
                                disabled={loading}
                                onClick={clearHistorial}
                                fluid
                            >
                                <i className="fas fa-trash"></i> Limpiar
                            </Button>
                        </div>
                    </Show>

                    <Show condicion={!edit && total}>
                            <div className="col-md-12 mb-1 col-sm-12 col-12">
                                <div className="row">
                                    <div className="col-md-4 col-ms-4 col-4">
                                        <Button  
                                            color="black"
                                            disabled={loading || edit || block}
                                            onClick={previus}
                                            fluid
                                        >
                                            <Icon name="triangle left"/>
                                        </Button>
                                    </div>

                                    <Show condicion={total}>
                                        <div className="col-md-4 col-4 mb-1">
                                            <Button color="black"
                                                fluid
                                                disabled={loading || block}
                                            >
                                                {page} de {total}
                                            </Button>
                                        </div>
                                    </Show>

                                    <div className="col-md-4 col-4 col-sm-4">
                                        <Button 
                                            fluid
                                            color="black"
                                            disabled={loading || edit || block}
                                            onClick={next}
                                        >
                                            <Icon name="triangle right"/>
                                        </Button>    
                                    </div>      
                                </div>    
                            </div>
                        </Show>
                    </div>
                </div>

                <Show condicion={cronograma.estado}>                     
                    <div className="col-md-3 col-lg-4 col-sm-5 col-12">
                        <div className="row justify-content-end">
                            <Show condicion={is_updatable && edit}>
                                <div className="col-md-6 mb-1 col-6">
                                    <Button
                                        fluid
                                        color="blue"
                                        loading={send}
                                        disabled={loading || !edit || block || send}
                                        onClick={async (e) => await handleConfirm()}
                                    >
                                        <i className="fas fa-save mr-1"></i>
                                    </Button>    
                                </div>                
                            </Show>

                            <Show condicion={!edit}>
                                <div className="col-md-6 mb-1 col-6">
                                    <Show condicion={!loading}
                                        predeterminado={<PlaceholderButton/>}
                                    >
                                        <Button
                                            color="red"
                                            basic
                                            fluid
                                            disabled={loading || block}
                                            onClick={e => setOption('cerrar')}
                                        >
                                            <i className="fas fa-lock mr-1"></i>
                                        </Button>   
                                    </Show> 
                                </div>                
                            </Show>

                            <Show condicion={!loading && total && cronograma.estado}
                                predeterminado={<div className="col-md-6 col-6 col-sm-12"><PlaceholderButton/></div>}
                            >
                                <div className={`col-md-6 ${edit ? 'col-6' : 'col-6 col-sm-12'}`}>
                                    <Show condicion={is_editable}
                                        predeterminado={<span></span>}
                                    >
                                        <Button color={edit ? 'red' : 'teal'}
                                            disabled={loading || block || send}
                                            onClick={(e) => edit ? setCancel(true) : setEdit(true)}
                                            fluid
                                        >
                                            <i title={edit ? 'Cancelar' : 'Editar'} className={edit ? 'fas fa-times mr-1' : 'fas fa-pencil-alt mr-1'}></i> 
                                        </Button>
                                    </Show>
                                </div>
                            </Show>
                        </div>
                    </div>
                </Show>

            <Show condicion={total && !cronograma.estado}>
                <div className="col-md-2 mb-1 col-6">
                    <Button
                        fluid
                        disabled={loading || block || cronograma.year != new Date().getFullYear() || cronograma.mes != (new Date().getMonth() + 1)}
                        onClick={(e) => setOption('open')}
                    >
                        <Icon name="unlock"/> Abrir
                    </Button>
                </div>
            </Show>
                    
            <Show condicion={total && !cronograma.estado}>
                <div className="col-md-2 mb-1 col-6">
                    <Button
                        fluid
                        color="orange"
                        disabled={loading || block || !historial.is_email}
                        onClick={sendEmail}
                    >
                        <Icon name="send"/> { send ? 'Enviando...' : 'Enviar Email' }
                    </Button>
                </div>
            </Show>
        </div>              
    </div>
}


export default FooterCronograma;
