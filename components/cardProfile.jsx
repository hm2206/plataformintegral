import React, { useContext, Fragment, useState, useEffect } from "react";
import { Form, Button, Select } from 'semantic-ui-react';
import { authentication, handleErrorRequest, onProgress } from '../services/apis';
import Show from '../components/show';
import Swal from "sweetalert2";
import { LoadFile } from '../components/Utils';
import { SelectDepartamento, SelectProvincia, SelectDistrito } from '../components/select/authentication';
import { AuthContext } from "../contexts/AuthContext";

const CardProfile = () => {

    // app
    const { auth, setAuth } = useContext(AuthContext);

    // estados
    const [current_person, setCurrentPerson] = useState({});
    const [current_user, setCurrentUser] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [option, setOption] = useState("");
    const [errors, setErrors] = useState({});
    const [percent, setPercent] = useState(0);

    // setting auth
    const settingAuth = () => {
        const { person } = auth || {};
        setCurrentUser(JSON.parse(JSON.stringify(auth || {})));
        setCurrentPerson(JSON.parse(JSON.stringify(person || {})));
    }

    
    // primera carga
    useEffect(() => {
        if (auth) settingAuth();
    }, [auth]);

    // cancelar edición
    useEffect(() => {
        if (!edit) settingAuth();
    }, [edit]);

    // manejador de cambio del person
    const handleInputPerson = ({ name, value }) => {
        let newForm = Object.assign({}, current_person);
        newForm[name] = value;
        setCurrentPerson(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // manejador de cambio del user
    const handleInputUser = ({ name, value }) => {
        let newForm = Object.assign({}, current_user);
        newForm[name] = value;
        setCurrentUser(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
        setEdit(true);
    }

    // limpiar provincia
    useEffect(() => {
        if (edit) handleInputPerson({ name: 'cod_pro', value: '' });
    }, [current_person.cod_dep]);

    // limpiar distrito
    useEffect(() => {
        if (edit) handleInputPerson({ name: 'cod_dis', value: '' });
    }, [current_person.cod_pro]);

    // validar actualización
    const getPass = async () => {
        return await Swal.fire({
            icon: 'warning',
            text: `Ingrese su contraseña para actualizar los datos`,
            input: 'password',
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            preConfirm: (pass) => {
                if (pass.length < 6) Swal.showValidationMessage(`La contraseña debe tener como mínimo 6 carácteres`)
            }
        })
    }

    //   actualizar datos
    const update = async () => {
        let answer = await getPass();
        if (!answer.value) return false;
        setCurrentLoading(true);
        let form = new FormData();
        form.append('email', current_user.email || "");
        form.append('date_of_birth', current_person.date_of_birth || "");
        form.append('marital_status', current_person.marital_status || "");
        form.append('gender', current_person.gender || "");
        form.append('cod_dep', current_person.cod_dep || "");
        form.append('cod_pro', current_person.cod_pro || "");
        form.append('cod_dis', current_person.cod_dis || "");
        form.append('address', current_person.address || "");
        form.append('phone', current_person.phone || "");
        form.append('password_confirm', answer.value || "");
        // request
        await authentication.post(`auth/update?_method=PUT`, form)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setEdit(false);
            setAuth({ ...auth, ...current_user, person: current_person });
        }).catch(async err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    // cambiar imagen
    const handleSaveImg = async (img) => {
        setCurrentLoading(true);
        let form = new FormData;
        form.append('image', img);
        // options
        let options = {
            onUploadProgress: (evt) => onProgress(evt, setPercent)
        }
        // request
        await authentication.post(`auth/change_image`, form, options)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            location.href = '/';
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
        setPercent(0);
    } 

    // renderizado
    return (
        <Fragment>
            <div id="team-profile" className="tab-pane fade active show" role="tabpanel" aria-labelledby="team-profile">
                {/* <!-- .card --> */}
                <div className="card card-reflow border-bottom">
                    {/* <!-- .card-body --> */}
                    <div className="card-body text-center">
                    {/* <!-- team avatar --> */}
                        <a href="#" className="user-avatar user-avatar-xl my-3" style={{ width: "100px", height: "100px", objectFit: "cover", overflow: 'hidden', }}>
                            <button className="btn-change-img" 
                                onClick={(e) => setOption("CHANGE_IMAGE")}
                                title="Cambiar imagen de perfil"
                            >
                                <i className="fas fa-image"></i>
                            </button>
                            <img src={current_user.image_images && current_user.image_images.image_200x200 || '/img/perfil.jpg'} alt="perfil"/>
                        </a> 
                        <h3 className="card-title text-truncate uppercase">
                            <a href="#">{current_person.fullname || ""}</a>
                        </h3>
                        <h6 className="card-subtitle text-muted mb-3">{current_person.address || ""}</h6>
                        <div className="row">
                            {/* <!-- grid column --> */}
                            <div className="col-4">
                            {/* <!-- .metric --> */}
                            <div className="metric">
                                <h6 className="metric-value"> {current_person.phone || ""} </h6>
                                <p className="metric-label mt-1"> Tel </p>
                            </div>
                            </div>
                            {/* <!-- grid column --> */}
                            <div className="col-4">
                            {/* <!-- .metric --> */}
                            <div className="metric">
                                <h6 className="metric-value"> {current_user.username || ""} </h6>
                                <p className="metric-label mt-1"> Username </p>
                            </div>
                            </div>
                            {/* <!-- grid column --> */}
                            <div className="col-4">
                            {/* <!-- .metric --> */}
                            <div className="metric">
                                <h6 className="metric-value">{current_person.edad || ""}</h6>
                                <p className="metric-label mt-1"> Edad </p>
                            </div>
                            </div>
                        </div>
                    </div>
                    {/* <!-- .card-footer --> */}
                </div>
                {/* <!-- .list-group --> */}
                <Form className="list-group list-group-reflow list-group-flush list-group-divider">
                    {/* <!-- .list-group-header --> */}
                    <div className="list-group-header"> Editar Datos</div>
                    {/* <!-- .list-group-item --> */}
                    <div className="list-group-item">
                        {/* <!-- .list-group-item-body --> */}
                        <div className="list-group-item-body">
                            <div className="row">
                                <Form.Field className="col-md-6" error={errors.email && errors.email[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Correo Electrónico <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <input 
                                            type="text"
                                            name="email"
                                            value={current_user.email || ""}
                                            onChange={({ target }) => handleInputUser(target)}
                                            disabled={current_loading}
                                        />
                                    </div>
                                    <label>{errors.email && errors.email[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-6">
                                    <label className="list-group-item-title">
                                        Tip. Documento
                                    </label>
                                    <div>
                                        <input type="text"
                                            readOnly
                                            value={current_person.document_type && current_person.document_type.name || ""}
                                        />
                                    </div>
                                </Form.Field>

                                <Form.Field className="col-md-6">
                                    <label className="list-group-item-title">
                                        N° Documento
                                    </label>
                                    <div>
                                        <input 
                                            type="text"
                                            name="document_number"
                                            value={current_person.document_number || ""}
                                            readOnly
                                        />
                                    </div>
                                </Form.Field>

                                <Form.Field className="col-md-6" error={errors.date_of_birth && errors.date_of_birth[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Fecha de Nacimiento <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <input 
                                            type="date"
                                            name="date_of_birth"
                                            value={current_person.date_of_birth || ""}
                                            onChange={({ target }) => handleInputPerson(target)}
                                            disabled={current_loading}
                                        />
                                    </div>
                                    <label htmlFor="">{errors.date_of_birth && errors.date_of_birth[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-6" error={errors.marital_status && errors.marital_status[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Estado Civil <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <Select
                                            fluid
                                            options={[
                                                { key: "SOL", value: "S", text: "Soltero(a)" },
                                                { key: "CAS", value: "C", text: "Casado(a)" },
                                                { key: "DIV", value: "D", text: "Divorciado(a)" },
                                                { key: "VIU", value: "V", text: "Viudo(a)" }
                                            ]}
                                            placeholder="Select. Estado Civil"
                                            name="marital_status"
                                            value={current_person.marital_status || ""}
                                            onChange={(e, obj) => handleInputPerson(obj)}
                                            disabled={current_loading}
                                        />
                                    </div>
                                    <label htmlFor="">{errors.marital_status && errors.marital_status[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-6" error={errors.gender && errors.gender[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Género <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <Select
                                            fluid
                                            options={[
                                                { key: "GEN-M", value: "M", text: "Masculino" },
                                                { key: "GEN-F", value: "F", text: "Femenino" },
                                                { key: "GEN-I", value: "I", text: "No Binario" }
                                            ]}
                                            placeholder="Select. Estado Civil"
                                            name="gender"
                                            value={current_person.gender || ""}
                                            onChange={(e, obj) => handleInputPerson(obj)}
                                        />
                                    </div>
                                    <label htmlFor="">{errors.gender && errors.gender[0]}</label>
                                </Form.Field>

                                <div className="mb-2 mt-3 col-md-12">
                                    <hr/>
                                    <h6><i className="fas fa-location-arrow"></i> Lugar de Nacimiento</h6>
                                    <hr/>
                                </div>

                                <Form.Field className="col-md-12" error={errors.cod_dep && errors.cod_dep[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Departamento <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <SelectDepartamento
                                            id="cod_dep"
                                            name="cod_dep"
                                            value={current_person.cod_dep}
                                            onChange={(e, obj) => handleInputPerson(obj)}
                                            disabled={current_loading}
                                        />
                                    </div>
                                    <label htmlFor="">{errors.cod_dep && errors.cod_dep[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-6" error={errors.cod_pro && errors.cod_pro[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Provincia <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <SelectProvincia
                                            id="cod_pro"
                                            departamento_id={current_person.cod_dep}
                                            name="cod_pro"
                                            value={current_person.cod_pro}
                                            disabled={!current_person.cod_dep}
                                            refresh={current_person.cod_dep}
                                            onChange={(e, obj) => handleInputPerson(obj)}
                                            disabled={current_loading}
                                        />
                                    </div>
                                    <label htmlFor="">{errors.cod_pro && errors.cod_pro[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-6" error={errors.cod_dis && errors.cod_dis[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Distrito <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <SelectDistrito
                                            id="cod_dis"
                                            departamento_id={current_person.cod_dep}
                                            provincia_id={current_person.cod_pro}
                                            name="cod_dis"
                                            value={current_person.cod_dis}
                                            disabled={!current_person.cod_pro}
                                            refresh={current_person.cod_pro}
                                            onChange={(e, obj) => handleInputPerson(obj)}
                                            disabled={current_loading}
                                        />
                                    </div>
                                    <label htmlFor="">{errors.cod_dis && errors.cod_dis[0]}</label>
                                </Form.Field>

                                <div className="mb-2 mt-3 col-md-12">
                                    <hr/>
                                    <h6><i className="fas fa-mobile-alt"></i> Conctacto</h6>
                                    <hr/>
                                </div>

                                <Form.Field className="col-md-12" error={errors.address && errors.address[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Dirección <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <textarea
                                            name="address"
                                            rows="4"
                                            value={current_person.address || ""}
                                            onChange={({ target }) => handleInputPerson(target)}
                                            disabled={current_loading}
                                        />
                                    </div>
                                    <label htmlFor="">{errors.address && errors.address[0]}</label>
                                </Form.Field>

                                <Form.Field className="col-md-6" error={errors.phone && errors.phone[0] ? true : false}>
                                    <label className="list-group-item-title">
                                        Teléfono <b className="text-red">*</b>
                                    </label>
                                    <div>
                                        <input 
                                            type="text"
                                            name="phone"
                                            value={current_person.phone || ""}
                                            onChange={({ target }) => handleInputPerson(target)}
                                            disabled={current_loading}
                                        />
                                    </div>
                                    <label htmlFor="">{errors.phone && errors.phone[0]}</label>
                                </Form.Field>
                            </div>
                        </div>  
                    </div>
                </Form>

                <div className="list-group-item-body mt-2 py-2">
                    <hr/>
                    <div className="list-group-item-title text-right">
                        <Show condicion={edit}>
                            <Button color="red" 
                                className="mr-3"
                                disabled={current_loading}
                                onClick={(e) => setEdit(false)}
                            >
                                <i className="fas fa-times"></i> Cancelar
                            </Button>
                        </Show>

                        <Button color="teal" 
                            className="mr-3"
                            disabled={!edit || current_loading}
                            onClick={update}
                            loading={current_loading}
                        >
                            <i className="fas fa-save"></i> Guardar
                        </Button>
                    </div>
                </div>
            </div>

            <Show condicion={option == 'CHANGE_IMAGE'}>
                <LoadFile 
                    defaultImg={current_user.image_images && current_user.image_images.image_200x200}
                    info="Cambiar Foto de perfil" 
                    isClose={(e) => setOption("")}
                    accept="image/*"
                    onSave={handleSaveImg}
                    porcentaje={percent}
                    disabled={current_loading}
                />
            </Show>
      </Fragment>
    )
}


export default CardProfile;
