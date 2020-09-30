import React, { useState, useEffect } from 'react';
import { authentication } from '../services/apis';
import Modal from '../components/modal';
import { Form, Button } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from './show';

var intervalTime = null;

const Authorize = ({ person_id, fullname = "Persona", onSend = null, onClose = null, codeError = "" }) => {

    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [code, setCode] = useState("");
    const [errors, setErrors] = useState({});
    const [send, setSend] = useState(false);
    const [time, setTime] = useState(30);
    const [next, setNext] = useState(false);
    const [count, setCount] = useState(false);

    const validateCode = async () => {
        setCount(true);
        setTime(time - 1);
    }

    const handleInput = ({ name, value }, callback) => {
        let newError = errors;
        errors[name] = "";
        setErrors(newError);
        if (typeof callback == 'function') callback(value);
    }

    const generateCode = async () => {
        if (person_id) {
            setLoading(true);
            await authentication.post(`code_authorization/${person_id}`, { description })
                .then(async res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setSend(true);
                    validateCode();
                }).catch(async err => {
                    try {
                        let  { errors, message } = JSON.parse(err.message);
                        await Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
                    } catch (error) {
                        await Swal.fire({ icon: 'error', text: err.message });
                    }
                });
            setLoading(false);
        }
    }

    const handleSend = async () => {
        if (typeof onSend == 'function') onSend({ description, code });
        else {
            setLoading(true);
            await authentication.post(`code_authorization/${person_id}/validate`, { code })
                .then(async res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    setSend(true);
                    setErrors({});
                }).catch(async err => {
                    try {
                        let  { errors, message } = JSON.parse(err.message);
                        await Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
                    } catch (error) {
                        await Swal.fire({ icon: 'error', text: err.message });
                    }
                });
            setLoading(false);
        }
    }

    const handleCancel = () => {
        setErrors({});
        setCode("");
        setDescription("");
        setLoading(false);
        setTime(0);
        setNext(false);
        setSend(false);
    }

    useEffect(() => {
        if (count && time >= 0) {
            setTimeout(() => {
                setTime(time - 1);
            }, 1000);
        } else {
            setTime(30);
            setCount(false);
        }
        console.log(time);
    }, [time])

    useEffect(() => {
        let newError = Object.assign({}, codeError);
        newError.code = codeError;
        setErrors(newError);
    }, [codeError])

    return <Modal 
        disabled={loading}
        show={true}
        titulo={<span><i className="fas fa-user-tie"></i> Diálogo de autorización</span>}
        isClose={onClose}
    >
        <div className="card-body">
            <Form>
                <div className="row justify-content-center pt-5">
                    <div className="col-md-9 mb-5 mt-5">
                        <div className="text-center" style={{ fontSize: '5em' }}>
                            <i className="fas fa-user-shield"></i>
                        </div>
                    </div>

                    <div className="col-md-9 mb-3">
                        <Form.Field>
                            <label htmlFor="">Nombre Completo</label>
                            <input type="text" value={fullname} readOnly/>
                        </Form.Field>
                    </div>

                    <div className="col-md-9">
                        <Form.Field error={errors && errors.description && errors.description[0] || ""}>
                            <label htmlFor="">Descripción  <b className="text-red">*</b></label>
                            <input type="text"
                                name="description"
                                value={description}
                                onChange={({target}) => handleInput(target, setDescription)}
                                readOnly={send}
                            />
                            <label>{errors && errors.description && errors.description[0] || ""}</label>
                        </Form.Field>
                    </div>

                    <Show condicion={next}>
                        <div className="col-md-9">
                            <Form.Field error={errors && errors.code && errors.code[0] || ""}>
                                <label htmlFor="">Código de autorización <b className="text-red">*</b></label>
                                <input type="text"
                                    name="code"
                                    value={code}
                                    onChange={({target}) => handleInput(target, (value) => {
                                        if (`${value}`.length <= 10) setCode(value);
                                    })}
                                    placeholder="Ingres el código de 10 caracteres"
                                />
                                <label>{errors && errors.code && errors.code[0] || ""}</label>
                            </Form.Field>
                        </div>
                    </Show>

                    <Show condicion={!next}>
                        <div className="col-md-9 mt-3">
                            <div className="text-right">
                                <Show condicion={!count}>
                                    <Button 
                                        color={send ? '' : 'blue'}
                                        onClick={generateCode}
                                    >
                                        <i className="fas fa-sync"></i> {send ? 'Reenviar código' : 'Generar código'}
                                    </Button>
                                </Show>

                                <Show condicion={count}>
                                    <span className="mr-2">Volver a reenviar el código en {time}seg</span>
                                </Show>

                                <Show condicion={send}>
                                    <Button color="blue"
                                        onClick={(e) => setNext(true)}
                                    >
                                        <i className="fas fa-arrow-right"></i> Continuar
                                    </Button>
                                </Show>
                            </div>
                        </div>
                    </Show>

                    <Show condicion={next}>
                        <div className="col-md-9 mt-3">
                            <div className="text-right">
                                <Button color="red" 
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    <i className="fas fa-times"></i> Cancelar
                                </Button>

                                <Button color="teal"
                                    onClick={handleSend}
                                    disabled={loading}
                                    loading={loading}
                                >
                                    <i className="fas fa-paper-plane"></i> Enviar
                                </Button>
                            </div>
                        </div>
                    </Show>
                </div>
            </Form>
        </div>
    </Modal>;
}

export default Authorize;