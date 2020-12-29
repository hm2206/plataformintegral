import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form, List, Image } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { unujobs } from '../../services/apis';

export default class AssignContrato extends Component
{

    state = {
        loader: false,
        people: {
            data: []
        },
        query_search: ""
        
    }

    componentDidMount = async () => {
        await this.getInfos(1, this.state);
    }

    getInfos = async (page = 1, state, update = false) => {
        this.setState({ loader: true });
        await unujobs.get(`info?page=${page}&query_search=${state.query_search || ""}&estado=1`)
        .then(res => {
            let { success, message, infos } = res.data;
            if (!success) throw new Error(message);
            this.setState(state => {
                let { data, last_page, current_page, total } = infos;
                state.people.data = update ? data : [...state.people.data, ...data];
                state.people.lastPage = last_page;
                state.people.page = current_page;
                state.people.total = total;
                return { people: state.people };
            })
        }).catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    handlePage = async (nextPage) => {
        this.setState({ loader: true });
        await this.getInfos(nextPage, this.state);
    }

    handleAdd = async (obj) => {
        let { getAdd, local } = this.props;
        if (typeof getAdd == 'function') {
            let { push, pathname, query } = Router;
            await getAdd(obj);
            if (!local) {
                query.assign = "";
                push({ pathname, query });
            }
        }
    }

    render() {

        let { loader, people, query_search } = this.state;

        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-user"></i> Asignar Contrato</span>}
            >
                <Form className="card-body" loading={loader}>

                    <div className="row justify-content-center pl-4 pr-4">
                        <div className="col-md-10 mb-2 text-left">
                            <Form.Field>
                                <input type="text"
                                    placeholder="Buscar por: Apellidos y Nombres"
                                    value={query_search || ""}
                                    name="query_search"
                                    onChange={({ target }) => this.setState({ [target.name]: target.value })}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2">
                            <Button fluid
                                onClick={async (e) => {
                                    await this.getInfos(1, this.state, true)
                                }}
                            >
                                <i className="fas fa-search"></i>
                            </Button>
                        </div>
                    </div>

                    <div className="pl-4 mt-4 pr-4">
                        <List divided verticalAlign='middle'>
                            {people && people.data && people.data.map(obj => 
                                <List.Item key={`list-people-${obj.id}`}>
                                    <List.Content floated='right'>
                                        <Button color="blue"
                                            onClick={(e) => this.handleAdd(obj)}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </Button>
                                    </List.Content>
                                    <Image avatar src={obj.person && obj.person.image ? `${obj.person.image && obj.person.image_images && obj.person.image_images.image_50x50}` : '/img/base.png'} 
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <List.Content>
                                        <span className="uppercase">{obj.person && obj.person.fullname}</span>
                                        <div className="w-100">
                                            <small className="badge badge-dark badge-sm">{obj.cargo && obj.cargo.alias} - {obj.type_categoria && obj.type_categoria.descripcion}</small>
                                        </div>
                                    </List.Content>
                                </List.Item>
                            )}
                        </List>    
                    </div>

                    <div className="col-md-12 mt-3">
                        <Button fluid
                            disabled={people.lastPage <= people.page}
                            onClick={(e) => this.handlePage(people.page + 1)}
                        >
                            Obtener más registros
                        </Button>
                    </div>
                </Form>
            </Modal>
        );
    }

}