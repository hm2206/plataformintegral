import React, { Component, Fragment } from "react";
import { Form, Button, Select } from 'semantic-ui-react';
import { tipo_documento } from '../services/storage.json';
import { authentication } from '../services/apis';
import { parseOptions } from '../services/utils';
import Show from '../components/show';
import Swal from "sweetalert2";
import { LoadFile } from '../components/Utils';

export default class CardProfile extends Component {

  state = {
    user: {},
    person: {},
    loader: false,
    edit: false,
    departamentos: [],
    provincias: [],
    distritos: [],
    selectImg: false,
    load_img: 0,
    uploading: false
  }

  componentDidMount = async () => {
    await this.setting();
    this.getDepartamento();
  }

  componentWillReceiveProps = async (nextProps) => {
    let { auth } = this.props;
    if (auth != nextProps.auth) this.setting();
  }

  setting = () => {
    this.setState((state, props) => {
      state.person = props.auth.person;
      state.person.cod_dep = state.person.badge_id.substr(0, 2);
      // get provincias
      this.getProvincias(state.person);
      state.person.cod_pro = state.person.badge_id.substr(2, 2);
      this.getDistritos(state.person);
      // get distritos
      state.person.cod_dis = state.person.badge_id.substr(4, 2);
      // response
      return {
        user: JSON.parse(JSON.stringify(props.auth)),
        person: JSON.parse(JSON.stringify(state.person)),
        edit: false
      }
    });
  }

  handleInput = async ({ name, value }, obj = 'user') => {
    await this.setState(state => {
      state[obj][name] = value;
      // response
      return { [obj]: state[obj], edit: true };
    });
    // manejar eventos
    this.handleUbigeo({ name, value });
  }

  handleUbigeo = ({ name, value }) => {
    let { person } = this.state;
    switch (name) {
      case 'cod_dep':
        this.getProvincias(person, true)
        break;
      case 'cod_pro':
        this.getDistritos(person, true);
        break;
      default:
        break;
    }
  }

  getDepartamento = async () => {
    await authentication.get('get_departamentos')
    .then(res => this.setState({ departamentos: res.data }))
    .catch(err => console.log(err.message));
  }

  getProvincias = async (form, update = false) => {
    await authentication.get(`get_provincias/${form.cod_dep}`)
    .then(res => this.setState({ provincias: res.data }))
    .catch(err => console.log(err.message));
    if (update) {
      let obj = Object.assign({}, this.state.person);
      obj['cod_pro'] = "";
      obj['cod_dis'] = "";
      this.setState({ person: obj });
    }
  }

  getDistritos = async (form, update = false) => {
    await authentication.get(`get_distritos/${form.cod_dep}/${form.cod_pro}`)
    .then(res => this.setState({ distritos: res.data }))
    .catch(err => console.log(err.message));
    if (update) {
      let obj = Object.assign({}, this.state.person);
      obj['cod_dis'] = "";
      this.setState({ person: obj });
    }
  }

  getPass = async () => {
    return await Swal.fire({
      icon: 'warning',
      text: `Ingrese su contraseña para actualizar los datos`,
      input: 'password',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      preConfirm: (pass) => {
        if (pass.length < 6) {
          Swal.showValidationMessage(
            `La contraseña debe tener como mínimo 6 carácteres`
          )
        }
      }
    })
  }

  update = async () => {
    let answer = await this.getPass();
    if (answer.value) {
      this.props.fireLoading(true);
      let { user, person } = this.state;
      let form = new FormData();
      form.append('email', user.email);
      form.append('marital_status', person.marital_status);
      form.append('gender', person.gender);
      form.append('cod_dep', person.cod_dep);
      form.append('cod_pro', person.cod_pro);
      form.append('cod_dis', person.cod_dis);
      form.append('address', person.address);
      form.append('phone', person.phone);
      form.append('password_confirm', answer.value);
      // request
      await authentication.post(`auth/update`, form)
      .then(async res => {
        this.props.fireLoading(false);
        let { success, message } = res.data;
        if (!success) throw new Error(message);
        await Swal.fire({ icon: 'success', text: message });
        this.setting({ errors: [], edit: false });
        history.go('/');
      }).catch(async err => {
        try {
          this.props.fireLoading(false);
          let { errors, message } = JSON.parse(err.message);
          if (errors.password_confirm)  {
            await Swal.fire({ icon: 'error', text: errors.password_confirm[0]});
            this.update();
          }
          else {
            this.setState({ errors })
            Swal.fire({ icon: 'warning', text: message });
          }
        } catch (error) {
          Swal.fire({ icon: 'error', text: err.message });
        }
      });
    }
  }

  handleSaveImg = async (img) => {
    this.props.fireLoading(true);
    let form = new FormData;
    this.setState({ uploading: true });
    form.append('image', img);
    await authentication.post(`auth/change_image`, form)
    .then(res => {
      this.props.fireLoading(false);
      let { success, message, auth } = res.data;
      if (!success) throw new Error(message);
      Swal.fire({ icon: 'success', text: message });
      this.props.setAuth(auth);
    }).catch(err => {
      try {
        this.props.fireLoading(false);
        let response = JSON.parse(err.message);
        Swal.fire({ icon: 'warning', text: response.message });
      } catch (error) {
        Swal.fire({ icon: 'error', text: err.message });
      }
    });
    this.setState({ uploading: false });
  } 

  render() {

    let { user, person, loader, departamentos, provincias, distritos } = this.state;

    return (
      <Fragment>
                <div id="team-profile" className="tab-pane fade active show" role="tabpanel" aria-labelledby="team-profile">
                    {/* <!-- .card --> */}
                    <div className="card card-reflow border-bottom">
                      {/* <!-- .card-body --> */}
                      <div className="card-body text-center">
                        {/* <!-- team avatar --> */}
                        <a href="#" className="user-avatar user-avatar-xl my-3" style={{ width: "100px", height: "100px", objectFit: "cover", overflow: 'hidden', }}>
                          <button className="btn-change-img" onClick={(e) => this.setState({ selectImg: true })} title="Cambiar imagen de perfil">
                            <i className="fas fa-image"></i>
                          </button>
                          <img src={user.image_images && user.image_images.image_200x200 || '/img/perfil.jpg'} alt="perfil"/>
                        </a> 
                        
                        <h3 className="card-title text-truncate">
                            <a href="#">{user.person && user.person.fullname}</a>
                        </h3>
                        <h6 className="card-subtitle text-muted mb-3">{user.person && user.person.address}</h6>
                        <div className="row">
                          {/* <!-- grid column --> */}
                          <div className="col-4">
                            {/* <!-- .metric --> */}
                            <div className="metric">
                                <h6 className="metric-value"> {user.person && user.person.phone} </h6>
                              <p className="metric-label mt-1"> Tel </p>
                            </div>
                          </div>
                          {/* <!-- grid column --> */}
                          <div className="col-4">
                            {/* <!-- .metric --> */}
                            <div className="metric">
                              <h6 className="metric-value"> {user.username} </h6>
                              <p className="metric-label mt-1"> Username </p>
                            </div>
                          </div>
                          {/* <!-- grid column --> */}
                          <div className="col-4">
                            {/* <!-- .metric --> */}
                            <div className="metric">
                              <h6 className="metric-value">{user.person && user.person.edad}</h6>
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
                              <Form.Field className="col-md-6">
                                <label className="list-group-item-title">
                                  Correo Electrónico
                                </label>
                                <div>
                                  <input 
                                    type="text"
                                    name="email"
                                    value={user.email || ""}
                                    disabled={loader}
                                    onChange={(e) => this.handleInput(e.target)}
                                  />
                                </div>
                              </Form.Field>

                              <Form.Field className="col-md-6">
                                <label className="list-group-item-title">
                                  Tip. Documento
                                </label>
                                <div>
                                  <Select
                                    fluid
                                    options={tipo_documento}
                                    placeholder="Select. Tip. Documento"
                                    name="document_type"
                                    value={person.document_type || ""}
                                    disabled
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
                                    value={person.document_number || ""}
                                    disabled
                                    onChange={(e) => this.handleInput(e.target, 'person')}
                                  />
                                </div>
                              </Form.Field>

                              <Form.Field className="col-md-6">
                                <label className="list-group-item-title">
                                  Fecha de Nacimiento
                                </label>
                                <div>
                                  <input 
                                    type="date"
                                    name="date_of_birth"
                                    value={person.date_of_birth || ""}
                                    disabled
                                    onChange={(e) => this.handleInput(e.target, 'person')}
                                  />
                                </div>
                              </Form.Field>

                              <Form.Field className="col-md-6">
                                <label className="list-group-item-title">
                                  Estado Civil <b className="text-red">*</b>
                                </label>
                                <div>
                                  <Select
                                    fluid
                                    options={[
                                      { key: "SEL", value: "", text: "Selec. Estado Civil" },
                                      { key: "SOL", value: "S", text: "Soltero(a)" },
                                      { key: "CAS", value: "C", text: "Casado(a)" },
                                      { key: "DIV", value: "D", text: "Divorciado(a)" },
                                      { key: "VIU", value: "V", text: "Viudo(a)" }
                                    ]}
                                    placeholder="Select. Estado Civil"
                                    name="marital_status"
                                    value={person.marital_status || ""}
                                    onChange={(e, obj) => this.handleInput(obj, 'person')}
                                  />
                                </div>
                              </Form.Field>

                              <Form.Field className="col-md-6">
                                <label className="list-group-item-title">
                                  Género <b className="text-red">*</b>
                                </label>
                                <div>
                                  <Select
                                    fluid
                                    options={[
                                      { key: "SEL-GEN", value: "", text: "Selec. Género" },
                                      { key: "GEN-M", value: "M", text: "Masculino" },
                                      { key: "GEN-F", value: "F", text: "Femenino" },
                                      { key: "GEN-I", value: "I", text: "No Binario" }
                                    ]}
                                    placeholder="Select. Estado Civil"
                                    name="gender"
                                    value={person.gender|| ""}
                                    onChange={(e, obj) => this.handleInput(obj, 'person')}
                                  />
                                </div>
                              </Form.Field>

                              <div className="mb-2 mt-3 col-md-12">
                                <hr/>
                                <h6><i className="fas fa-location-arrow"></i> Lugar de Nacimiento</h6>
                                <hr/>
                              </div>

                              <Form.Field className="col-md-12">
                                <label className="list-group-item-title">
                                  Departamento <b className="text-red">*</b>
                                </label>
                                <div>
                                  <Select
                                      fluid
                                      options={parseOptions(departamentos, ['select-dep', "", "Select. Departamento"],  ["cod_dep", "cod_dep", "departamento"])}
                                      placeholder="Select. Departamento"
                                      name="cod_dep"
                                      value={person.cod_dep || ""}
                                      onChange={(e, obj) => this.handleInput(obj, 'person')}
                                    />
                                </div>
                              </Form.Field>

                              <Form.Field className="col-md-6">
                                <label className="list-group-item-title">
                                  Provincia <b className="text-red">*</b>
                                </label>
                                <div>
                                  <Select
                                      fluid
                                      options={parseOptions(provincias, ['select-dep', "", "Select. Provincia"],  ["cod_pro", "cod_pro", "provincia"])}
                                      placeholder="Select. Provincia"
                                      name="cod_pro"
                                      value={person.cod_pro || ""}
                                      onChange={(e, obj) => this.handleInput(obj, 'person')}
                                    />
                                </div>
                              </Form.Field>

                              <Form.Field className="col-md-6">
                                <label className="list-group-item-title">
                                  Distrito
                                </label>
                                <div>
                                  <Select
                                      fluid
                                      options={parseOptions(distritos, ['select-dis', "", "Select. Distrito"],  ["cod_dis", "cod_dis", "distrito"])}
                                      placeholder="Select. Distrito"
                                      name="cod_dis"
                                      value={person.cod_dis || ""}
                                      onChange={(e, obj) => this.handleInput(obj, 'person')}
                                    />
                                </div>
                              </Form.Field>

                              <div className="mb-2 mt-3 col-md-12">
                                <hr/>
                                <h6><i className="fas fa-mobile-alt"></i> Conctacto</h6>
                                <hr/>
                              </div>

                              <Form.Field className="col-md-12">
                                <label className="list-group-item-title">
                                  Dirección
                                </label>
                                <div>
                                  <textarea
                                    disabled={loader}
                                    name="address"
                                    rows="4"
                                    value={person.address || ""}
                                    onChange={(e) => this.handleInput(e.target, 'person')}
                                  />
                                </div>
                              </Form.Field>

                              <Form.Field className="col-md-6">
                                <label className="list-group-item-title">
                                  Teléfono
                                </label>
                                <div>
                                  <input 
                                    type="text"
                                    name="phone"
                                    value={person.phone || ""}
                                    disabled={loader}
                                    onChange={(e) => this.handleInput(e.target, 'person')}
                                  />
                                </div>
                              </Form.Field>
                            </div>
                          </div>  
                        </div>
                    </Form>

                      <div className="list-group-item-body mt-2 py-2">
                        <hr/>
                        <div className="list-group-item-title text-right">
                          <Show condicion={this.state.edit}>
                            <Button color="red" 
                              className="mr-3"
                              disabled={loader}
                              onClick={this.setting}
                            >
                              <i className="fas fa-times"></i> Cancelar
                            </Button>
                          </Show>

                          <Button color="teal" 
                            className="mr-3"
                            disabled={!this.state.edit}
                            onClick={this.update}
                          >
                            <i className="fas fa-save"></i> Guardar
                          </Button>
                        </div>
                      </div>
                    </div>

          <Show condicion={this.state.selectImg}>
            <LoadFile 
              defaultImg={user.image_images && user.image_images.image_200x200}
              info="Cambiar Foto de perfil" 
              isClose={(e) => this.setState({ selectImg: false })}
              accept="image/*"
              onSave={this.handleSaveImg}
              upload={this.state.uploading}
              porcentaje={this.state.load_img}

            />
          </Show>
            
      </Fragment>
    )
  }

};