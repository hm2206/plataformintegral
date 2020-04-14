import React, { Component } from 'react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import { AUTHENTICATE } from '../../../services/auth';
import { Form, Button } from 'semantic-ui-react';
import { BtnFloat } from '../../../components/Utils';
import Show from '../../../components/show';
import { allHistorial } from '../../../storage/actions/historialActions';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import { Body } from '../../../components/Utils';


export default class Boleta extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: true,
            block: false,
            query_search: ""
        }

        this.handleInput = this.handleInput.bind(this);
    }

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let date = new Date;
        let {query, pathname, store} = ctx;
        query.page = query.page ? query.page : 1;
        query.query_search = query.query_search ? query.query_search : "";
        await store.dispatch(allHistorial(ctx));
        let { page_historial } = store.getState().historial;
        return {query, pathname, page_historial }
    }

    componentDidMount = () => {
        this.setting(this.props);
    }

    setting = (props) => {
        this.setState({ 
            query_search: props.query.query_search ? props.query.query_search : "",
            loading: false
        })
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    handleSearch = async () => {
        this.setState({ loading: true });
        let { push, pathname, query } = Router;
        query.page = 1;
        query.query_search = this.state.query_search;
        await push({ pathname, query })
        this.setState({ loading: false });
    }

    handleBoleta = async (obj) => {
        this.setState({ loading: true });
        let path = `pdf/boleta/${obj.cronograma_id}?meta_id=${obj.meta_id}&historial_id=${obj.id}`;
        await unujobs.fetch(path, { method: 'POST' })
        .then(resData => resData.blob())
        .then(blob => {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.click();
        })
        .catch(err => Swal.fire({ icon: 'error', text: 'No se pudó generar la boleta' }));
        this.setState({ loading: false });
    }

    getOption = (obj, key, index) => {
        if (key == 'report') {
            this.handleBoleta(obj);
        }
    }

    render() {

        let { loading } = this.state;
        let {query, pathname, page_historial} = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo={<span><i className="fas fa-file-pdf"></i> Lista histórica de boletas</span>}
                        isFilter={false}
                        loading={loading}
                        headers={ ["#ID", "Apellidos y Nombres", "Año", "Mes", "Cargo", 'Tip. Categoría']}
                        index={[
                            { key: "id", type: "text" },
                            { key: "person.fullname", type: "text" },
                            { key: "cronograma.year", type: "icon" },
                            { key: "cronograma.mes", type: "icon", bg: "dark" },
                            { key: "cargo.alias", type: "icon", bg: "dark" },
                            { key: "type_categoria.descripcion", type: "icon", bg: "success" }
                        ]}
                        options={
                            [
                                {
                                    key: "report",
                                    icon: "fas fa-file-pdf",
                                    title: "Reporte de Boleta"
                                }, 
                            ]
                        }
                        getOption={this.getOption}
                        data={page_historial.data}>
                        <Form className="mb-3">
                            <div className="row">
                                <div className="col-md-6 mb-1 col-6 col-sm-6 col-xl-5">
                                    <Form.Field>
                                        <input type="text"  
                                            placeholder="Buscar Boletas: Apellidos y Nombres" 
                                            name="query_search"
                                            value={this.state.query_search}
                                            disabled={this.state.loading}
                                            onChange={this.handleInput}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-3 col-6 col-sm-12 col-xl-2 mb-1">
                                    <Button 
                                        fluid
                                        disabled={this.state.loading}
                                        color="blue"
                                        onClick={this.handleSearch}
                                    >
                                        <i className="fas fa-search mr-1"></i>
                                        <span>Buscar</span>
                                    </Button>
                                </div>
                            </div>
                            <hr/>
                        </Form>
                    </Datatable>
                </Body>
            </div>
        )
    }

}
