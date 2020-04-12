import React, { Component, Fragment } from 'react';
import { Form, Button, Select, Card, Image } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { Body } from '../../../components/Utils';
import Show from '../../../components/show';
import { unujobs, authentication } from '../../../services/apis';
import { responsive } from '../../../services/storage.json'
import btoa from 'btoa'
import { parseUrl } from '../../../services/utils';


export default class Preparate extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query, store } = ctx;
        return { pathname, query }
    }

    state = {
        loading: false,
        query_search: "",
        results: [],
        open: false,
        total: 0
    }

    handleBack = () => {
        let { push, pathname } = Router;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({ pathname: newPath.join('/') });
    }

    handleInput = async ({ name, value }) => {
        this.setState({ [name]: value });
    }

    handleSearch = async ({ name, value }) => {
        this.setState({ [name]: value });
        // validamos buscador
        if (value.length >= 3) {
            this.setState({ loading: true, open: true });
            if (!this.state.loading) {
                await unujobs.get(`work?query_search=${value}`)
                .then(res => this.setState({ 
                    results: res.data.data,
                    total: res.data.total
                }))
                .catch(err => console.log(err.message));
            }
        }
        // loading
        this.setState({ loading: false });
    }

    render() {

        let { query } = this.props;

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

                <div className="col-md-12 mt-3">
                    <Body>
                        <Form loading={this.state.loading}>
                            <div className="card-header">
                                <i className="fas fa-search"></i> Buscar trabajador para agregar contrato
                            </div>

                            <div className="card-header">
                                <div className="col-md-5">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Buscar por: Apellidos y Nombres"
                                            name="query_search"
                                            onChange={(e) => this.handleSearch(e.target)}
                                        />
                                    </Form.Field>
                                </div>
                            </div>

                                <div className="card-body">
                                    <Card.Group doubling itemsPerRow={4}>
                                        {this.state.results.map(obj => 
                                            <Card key={`result-item-${obj.id}`}>
                                                <Image 
                                                    style={{ height: "200px", objectFit: "cover" }}
                                                     src={obj.person && obj.person.image ? `${authentication.path}/${obj.person.image}` : '/img/perfil.jpg'}
                                                />
                                                <Card.Content>
                                                    <Card.Header>{obj.person && obj.person.fullname}</Card.Header>
                                                    <Card.Meta>N° Documento: <b>{obj.person && obj.person.document_number}</b></Card.Meta>
                                                    <Card.Description>Teléfono: <b>{obj.person && obj.person.phone ? obj.person.phone : ""}</b></Card.Description>
                                                </Card.Content>
                                                <Card.Content extra>
                                                    <div className="row">
                                                        <div className="col-md-6 col-6 mb-1">
                                                            <Button fluid
                                                                onClick={(e) => {
                                                                    this.setState({ loading: true });
                                                                    let { query } = Router;
                                                                    query.id = btoa(obj.id);
                                                                    Router.push({ pathname: `/escalafon/trabajador/profile`, query });
                                                                }}
                                                            >
                                                                {this.props.screenX > responsive.md ? 'Ver Perfil' : <i className="fas fa-user"></i>}  
                                                            </Button>
                                                        </div>
                                                        <div className="col-md-6 col-6 mb-1">
                                                            <Button fluid 
                                                                primary
                                                                onClick={(e) => {
                                                                    this.setState({ loading: true });
                                                                    let { pathname, query } = Router;
                                                                    query.id = btoa(obj.id);
                                                                    Router.push({ pathname: parseUrl(pathname, "register"), query });
                                                                }}
                                                            >
                                                                {this.props.screenX > responsive.md ? 'Agregar' : <i className="fas fa-plus"></i>}  
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card.Content>
                                            </Card>  
                                        )}
                                    </Card.Group>
                                </div>
                        </Form>
                    </Body>
                </div>
            </Fragment>
        )
    }

}