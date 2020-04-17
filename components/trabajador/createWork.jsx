import React, { Component, Fragment } from 'react';
import ConsultaIframe from '../consultaIframe';


export default class CreateWork extends Component
{

    state = {
        afps: [],
        ssp: false,
        essalud: false,
    }

    getAFPs = async () => {
        await unujobs.get('afp')
        .then(res => this.setState({ afps: res.data }))
        .catch(err => console.log(err.message));
    }


    render() {
        return (
            <Fragment>
                <div className="col-md-4">
                    <Form.Field>
                        <label htmlFor="">Tip. Banco <b className="text-red">*</b></label>
                        <input type="text"
                            defaultValue="B NACIÓN"
                            disabled
                        />
                    </Form.Field>
                
                    <Form.Field>
                        <label htmlFor="">Ley Social <b className="text-red">*</b></label>
                        <select name="afp_id"
                            value={work.afp_id ? work.afp_id : ''}
                            onChange={(e) => this.handleInput(e.target, 'work')}
                        >
                            <option value="">Select. Ley Social</option>
                            {this.state.afps.map(obj => 
                                <option value={obj.id} key={`afp-${obj.id}`}>{obj.descripcion}</option>    
                            )}
                        </select>
                    </Form.Field>
                
                    <Form.Field>
                        <label htmlFor="">Prima Seguro <b className="text-red">*</b></label>
                        <select name="prima_seguro"
                            value={work.prima_seguro ? work.prima_seguro : ''}
                            onChange={(e) => this.handleInput(e.target, 'work')}
                        >
                            <option value="">No afecto</option>
                            <option value="1">Afecto</option>
                        </select>
                    </Form.Field>
                </div>
                
                <div className="col-md-4">
                    <Form.Field>
                        <label htmlFor="">N° Cuenta</label>
                        <input type="text"
                            name="numero_de_cuenta"
                            value={work.numero_de_cuenta ? work.numero_de_cuenta : ''}
                            onChange={(e) => this.handleInput(e.target, 'work')}
                        />
                    </Form.Field>
                
                    <Form.Field>
                        <label htmlFor="">N° Cussp</label>
                        <input type="text"
                            name="numero_de_cussp"
                            value={work.numero_de_cussp ? work.numero_de_cussp : ''}
                            onChange={(e) => this.handleInput(e.target, 'work')}
                        />
                    </Form.Field>
                
                    <Form.Field>
                        <label htmlFor="">Consulta SSP</label>
                        <Button color="orange" basic fluid
                            onClick={(e) => this.setState({ ssp: true })}
                        >
                            Realizar consulta
                        </Button>
                    </Form.Field>
                </div>
                
                <div className="col-md-4">
                    <Form.Field>
                        <label htmlFor="">N° Essalud</label>
                        <input type="text"
                            name="numero_de_essalud"
                            value={work.numero_de_essalud ? work.numero_de_essalud : ''}
                            onChange={(e) => this.handleInput(e.target, 'work')}
                        />
                    </Form.Field>
                
                    <Form.Field>
                        <label htmlFor="">Fecha de Afiliación</label>
                        <input type="date"
                            name="fecha_de_afiliacion"
                            value={work.fecha_de_afiliacion ? work.fecha_de_afiliacion : ''}
                            onChange={(e) => this.handleInput(e.target, 'work')}
                        />
                    </Form.Field>
                
                    <Form.Field>
                        <label htmlFor="">Consulta Essalud</label>
                        <Button color="orange" fluid basic
                            onClick={(e) => this.setState({ essalud: true })}
                        >
                            Realizar consulta
                        </Button>
                    </Form.Field>
                </div>
                
                <div className="col-md-12 text-right">
                    <hr/>
                    <Button color="teal"
                        onClick={this.create}
                    >
                        <i className="fas fa-save"></i> Guardar y Continuar
                    </Button>
                </div>

                <ConsultaIframe 
                    isClose={(e) => this.setState({ ssp: 'none' })}
                    display={this.state.ssp}
                    titulo="Consulta al Sistema Privado de Pensiones"
                    url="https://www2.sbs.gob.pe/afiliados/paginas/Consulta.aspx"
                />
    
                <ConsultaIframe 
                    isClose={(e) => this.setState({ essalud: 'none' })}
                    md="8"
                    display={this.state.essalud}
                    titulo="Consulta al Sistema de  Essalud"
                    url="http://ww4.essalud.gob.pe:7777/acredita/"
                />
            </Fragment>
        )
    }

}