import React, { Component } from 'react';
import Datatable from '../../components/datatable';
import Router from 'next/router';
import { AUTHENTICATE, AUTH } from '../../services/auth';
import { Form, Button, Pagination} from 'semantic-ui-react';
import { allHistorial } from '../../storage/actions/historialActions';
import { unujobs } from '../../services/apis';
import Swal from 'sweetalert2';
import { Body } from '../../components/Utils';
import Show from '../../components/show'


export default class DuplicadoBoleta extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 2,
            loading: true,
            block: false,
            query_search: "",
            historial: [],
            total: 0,
            stop: false
        }

        this.handleInput = this.handleInput.bind(this);
    }

    static getInitialProps  = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname, store} = ctx;
        query.page = query.page ? query.page : 1;
        query.query_search = await query.query_search ? query.query_search : "";
        await store.dispatch(allHistorial(ctx));
        let { page_historial } = store.getState().historial;
        let auth_token = await AUTH(ctx);
        return {query, pathname, page_historial, auth_token }
    }

    componentDidMount = () => {
        this.props.fireEntity({ render: true });
        this.setting(this.props);
    }

    componentWillReceiveProps = async (nextProps) => {
        let { query, page_historial } = this.props;
        if (nextProps.query.query_search != query.query_search || nextProps.page_historial != page_historial) {
            await this.setting(nextProps);
        }
    }

    setting = (props) => {
        this.setState(state => ({ 
            query_search: props.query.query_search ? props.query.query_search : "",
            loading: false,
            historial: props.page_historial.data,
        }))
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    handleSearch = async () => {
        this.setState({ loading: true });
        let { push, pathname, query } = Router;
        query.query_search = this.state.query_search;
        query.page = 1;
        await push({ pathname, query })
        this.setState({ loading: false, stop: false });
    }

    handlePage = async (e, { activePage }) => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
        this.setState({ loading: false });
    }

    handleBoleta = async (obj) => {
        this.props.fireLoading(true);
        let path = `pdf/boleta/${obj.cronograma_id}?meta_id=${obj.meta_id}&historial_id=${obj.id}`;
        await unujobs.fetch(path, { method: 'POST' })
        .then(resData => resData.blob())
        .then(blob => {
            this.props.fireLoading(false);
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.click();
        })
        .catch(err => {
            this.props.fireLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudó generar la boleta' })
        });
    }

    getOption = (obj, key, index) => {
        if (key == 'report') {
            this.handleBoleta(obj);
        }
    }


    render() {

        let { loading, historial } = this.state;
        let {query, pathname, page_historial} = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Datatable titulo={<span> Lista histórica de boletas de pago</span>}
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
                        data={historial}
                    >
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
                    <div className="text-center">
                        <Show condicion={page_historial && page_historial.data && page_historial.data.length > 0}>
                            <hr/>
                            <Pagination defaultActivePage={query.page} 
                                totalPages={page_historial.last_page}
                                enabled={loading}
                                onPageChange={this.handlePage}
                            />
                        </Show>
                    </div>
                </Body>
            </div>
        )
    }

}
