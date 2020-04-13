import React, { Component, Fragment } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { Body, BtnFloat } from '../../../components/Utils';
import { findInfo } from '../../../storage/actions/infoActions';
import { unujobs } from '../../../services/apis';
import Show from '../../../components/show';

export default class Pay extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query, store } = ctx;
        await store.dispatch(findInfo(ctx));
        let { info } = store.getState().info;
        return { pathname, query, info }
    }

    state = {
        loading: false,
        work: {},
        configs: [],
        edit: false
    }

    componentDidMount = async () => {
        await this.getWork();
        await this.getConfig();
    }

    handleBack = () => {
        let { push, pathname } = Router;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({ pathname: newPath.join('/') });
    }

    handleFile = (path) => {
        let a = document.createElement('a');
        a.href = `${unujobs.path}/${path}`;
        a.target = '_blank';
        a.click();
    }

    getWork = async () => {
        let { info } = this.props;
        this.setState({ loading: true });
        await unujobs.get(`work/${info.work_id}`)
        .then(res => this.setState({ work: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getConfig = async () => {
        let { info } = this.props;
        this.setState({ loading: true, edit: false });
        await unujobs.get(`info/${info.id}/config`)
        .then(res => this.setState({ configs: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }, index) => {
        this.setState(state => {
            let newObj = state.configs[index];
            console.log(newObj);
            newObj[name] = value;
            state.configs[index] = newObj;
            return { configs: state.configs, edit: true };
        });
    }

    render() {

        let { work } = this.state;
        let { info } = this.props;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <Button 
                            onClick={this.handleBack}
                        >
                            <i className="fas fa-arrow-left"></i> Atrás
                        </Button>
                    </Body>
                </div>

                <div className="col-md-12">
                    <Body>
                        <div className="card" loading={this.state.loading}>
                            <div className="card-header">
                                <i className="fas fa-coins"></i> Configuración de Boleta de Pago
                            </div>

                            <div className="card-body">
                                <Form loading={this.state.loading}>
                                    <div className="row">
                                        <div className="col-md-4 mt-3 text-center">
                                            <img src="/img/perfil.jpg"
                                            style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
                                            />
                                            <h3 className="text-center">{work && work.person ? work.person.fullname : ''}</h3>
                                        </div>

                                        <div className="col-md-8">
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Planilla</label>
                                                        <input type="text" disabled defaultValue={info.planilla && info.planilla.nombre}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Cargo</label>
                                                        <input type="text" disabled defaultValue={info.cargo && info.cargo.descripcion}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Tip. Categoría</label>
                                                        <input type="text" disabled defaultValue={info.type_categoria && info.type_categoria.descripcion}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">MetaID</label>
                                                        <input type="text" disabled defaultValue={info.meta && info.meta.metaID}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">ActividadID</label>
                                                        <input type="text" disabled defaultValue={info.meta && info.meta.actividadID}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Meta</label>
                                                        <input type="text" disabled defaultValue={info.meta && info.meta.meta}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Dependencia</label>
                                                        <input type="text" disabled defaultValue={info.dependencia && info.dependencia.nombre}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">P.A.P</label>
                                                        <input type="text" disabled defaultValue={info.pap}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Perfil Laboral</label>
                                                        <input type="text" disabled defaultValue={info.perfil_laboral}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Plaza</label>
                                                        <input type="text" disabled defaultValue={info.plaza}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Fecha de Ingreso</label>
                                                        <input type="text" disabled defaultValue={info.fecha_de_ingreso}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-4">
                                                    <Form.Field>
                                                        <label htmlFor="">Fecha de Cese</label>
                                                        <input type="text" disabled defaultValue={info.fecha_de_cese}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-8">
                                                    <Form.Field>
                                                        <label htmlFor="">Observación</label>
                                                        <textarea type="text" disabled defaultValue={info.observacion}/>
                                                    </Form.Field>
                                                </div>

                                                <Show condicion={info.file}>
                                                    <div className="col-md-4">
                                                        <Form.Field>
                                                            <label htmlFor="">File</label>
                                                            <Button color="red"
                                                                onClick={(e) => this.handleFile(info.file)}
                                                            >
                                                                <i className="fas fa-file-pdf"></i>
                                                            </Button>
                                                        </Form.Field>
                                                    </div>
                                                </Show>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>
                                        </div>
                                    </div>
                                </Form>
                            </div>

                            <div className="card-body">
                                <h4><i className="fas fa-cogs"></i> Configuración Global</h4>
                                <Form loading={this.state.loading}>
                                    <div className="row mt-4 justify-content-between">
                                        {this.state.configs.map((obj, index) => 
                                            <div className="col-md-12 mb-2" 
                                                style={{ 
                                                    border: "1.5px solid rgba(0, 0, 0, 0.3)", 
                                                    paddingTop: "0.4em", 
                                                    paddingBottom: "0.8em", 
                                                    borderRadius: "0.3em"
                                                }} 
                                                key={`config-item-${obj.id}`}
                                            >
                                                <div className="row">
                                                    <div className="col-md-9">
                                                        <Form.Field>
                                                            <b><span className="text-red">{obj.key}</span>.-<span className="text-primary">{obj.descripcion}</span></b>
                                                            <input type="number"
                                                                name="monto"
                                                                value={obj.monto}
                                                                onChange={(e) => this.handleInput(e.target, index)}
                                                                disabled={this.state.loading}
                                                            />
                                                        </Form.Field>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <b>Base imponible</b>
                                                        <Select
                                                            key={`opt-${obj.id}`}
                                                            fluid
                                                            options={[
                                                                {key: "0", value: 0, text: "SI"},
                                                                {key: "1", value: 1, text: "NO"}
                                                            ]}
                                                            disabled={this.state.loading}
                                                            name="base"
                                                            value={obj.base}
                                                            onChange={(e, o) => this.handleInput(o, index)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>    
                                        )}
                                    </div>
                                </Form>
                            </div>
                            <Show condicion={this.state.edit}>
                                <div className="card-footer">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-3">
                                                <Button color="red" fluid
                                                    onClick={this.getConfig}
                                                >
                                                    <i className="fas fa-times"></i> Cancelar
                                                </Button>
                                            </div>

                                            <div className="col-md-3">
                                                <Button color="blue" fluid>
                                                    <i className="fas fa-save"></i> Guardar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Show>
                        </div>
                    </Body>
                </div>

                <Show condicion={!this.state.edit}>
                    <BtnFloat>
                        <i className="fas fa-plus"></i>
                    </BtnFloat>
                </Show>
            </Fragment>
        )
    }

}