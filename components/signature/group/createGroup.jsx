import React, { useState, useContext, useEffect, Fragment } from 'react';
import Modal from '../../modal';
import { Confirm } from '../../../services/utils';
import { Form, Button, Progress } from 'semantic-ui-react';
import { signature, CancelRequest, onProgress } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../show';
import { AppContext } from '../../../contexts/AppContext';
import { SignatureContext } from '../../../contexts/SignatureContext';
import { DropZone } from '../../Utils';

const rules = ['title', 'description'];


const CreateGroup = ({ isClose = null }) => {

    // app
    const app_context = useContext(AppContext);

    // signature
    const signature_context = useContext(SignatureContext);

    // estados
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [percent, setPercent] = useState(0);
    const [current_cancel, setCurrentCancel] = useState(null);

    // cambiar input
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // cancelar solicitud
    const handleCancel = () => current_cancel && current_cancel.cancel();

    // validar guardar
    const validate = () => {
       for(let r of rules) {
            if (!form[r]) return false;
        }
        // response
        return true;
    }

    // guardar el grupo
    const save = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en crear el grupo?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        // agregar form data
        const datos = new FormData;
        await Object.keys(form).filter(key => {
            datos.append(key, form[key]);
        });
        // cancel toker
        const cancelToken = CancelRequest();
        setCurrentCancel(cancelToken);
        // options
        let options = {
            headers: { DependenciaId: signature_context.dependencia_id },
            onUploadProgress: (evt) => onProgress(evt, setPercent),
            onDownloadProgress: (evt) => onProgress(evt, setPercent),
            cancelToken: cancelToken.token
        }
        // request
        await signature.post(`auth/group`, datos, options)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            signature_context.setRefresh(true);
            setForm({});
            setErrors({});
            if (typeof isClose == 'function') isClose();
        }).catch(err => {
            try {
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message);
                Swal.fire({ icon: 'warning', text: data.message });
                setErrors(data.errors);
            } catch (error) {
                Swal.fire({ icon: 'error', text: error.message });
            }
        });
        // timeout
        setTimeout(() => {
            setCurrentLoading(false);
        }, 1000);
    }

    // render
    return <Fragment>
        <Modal show={true}
            isClose={isClose}
            disabled={current_loading}
            titulo={<span><i className="fas fa-plus"></i> Nuevo group</span>}
        >
            <div className="card-body">
                <Form>
                    <div className="card--">
                        <div className="card-body">
                            <Form.Field>
                                <label>Titulo</label>
                                <input type="text"
                                    name="title"
                                    placeholder="Ingrese el título del grupo"
                                    value={form.title || ""}
                                    onChange={({ target }) => handleInput(target)}
                                />
                            </Form.Field>

                            <Form.Field>
                                <label>Descripción</label>
                                <textarea name="description"
                                    placeholder="Ingrese la descripción del grupo"
                                    value={form.description || ""}
                                    onChange={({ target }) => handleInput(target)}
                                />
                            </Form.Field>

                            <Form.Field>
                                <label>PDF base</label>
                                <Show condicion={form.files}
                                    predeterminado={
                                        <DropZone
                                            id="files-base"
                                            name="files"
                                            multiple={false}
                                            title="Seleccionar PDF base"
                                            accept="application/pdf"
                                            onChange={({ name, files }) => handleInput({ name, value: files[0] })}
                                        />
                                    }
                                >
                                    <div className="card card-body" style={{ position: 'relative' }}>
                                        {form.files && form.files.name}
                                        <i className="fas fa-times cursor-pointer" 
                                            style={{ position: 'absolute', top: 'calc(50% - 5px)', right: '10px' }}
                                            onClick={(e) => {
                                                let newForm = Object.assign({}, form);
                                                delete newForm.files;
                                                setForm(newForm);
                                            }}
                                        />
                                    </div>
                                </Show>
                            </Form.Field>

                            <hr/>

                            <div className="text-right" style={{ position: 'relative' }}>
                                <Show condicion={!current_loading}>
                                    <Button color="teal" onClick={save}
                                        disabled={!validate()}
                                    >
                                        <i className="fas fa-save"></i> Guardar
                                    </Button>
                                </Show>

                                <Show condicion={current_loading}>
                                    <div className="w-100" onClick={handleCancel}>
                                        <Progress percent={percent} 
                                            progress
                                            inverted
                                            color="blue"
                                            disabled={percent == 100}
                                        />
                                    </div>
                                </Show>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </Modal>
    </Fragment>
}


export default CreateGroup;