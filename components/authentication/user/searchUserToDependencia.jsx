import React, { Component } from 'react'
import Modal from '../../modal';
import atob from 'atob';
import { Button, Form, List, Image, Pagination } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { authentication } from '../../../services/apis';

export default class SearchUserToDependencia extends Component
{

    state = {
        loader: false,
        user: {
            total: 0,
            page: 1,
            lastPage: 1,
            data: []
        },
        query_search: ""
    }

    componentDidMount = async () => {
        await this.getUserEntity(1);
    }

    getUserEntity = async (page = 1, up = false) => {
        this.setState({ loader: true });
        let { entity_id, dependencia_id } = this.props;
        let { query_search } = this.state;
        await authentication.get(`dependencia/${dependencia_id || "_error"}/user_entity/${entity_id || '_error'}?page=${page}&query_search=${query_search || ""}`)
        .then(res => {
            let { success, message, user } = res.data;
            if (!success) throw new Error(message);
            this.setState(state => {
                state.user.total = user.total;
                state.user.page = user.page;
                state.user.lastPage = user.lastPage;
                state.user.data = up ? [...state.user.data, ...user.data] : user.data;
                return { user: state.user };
            });
        })
        .catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    handlePage = async (nextPage) => {
        this.setState({ loader: true });
        await this.getUserEntity(nextPage);
    }

    handleAdd = async (obj) => {
        let { getAdd } = this.props;
        if (typeof getAdd == 'function') {
            let { push, pathname, query } = Router;
            await getAdd(obj);
        }
    }

    render() {

        let { loader, user, query_search } = this.state;

        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-user"></i> Asignar Usuario</span>}
            >
                <Form className="card-body" loading={loader}>

                    <div className="row justify-content-center pl-4 pr-4">
                        <div className="col-md-10 mb-2 text-left">
                            <Form.Field>
                                <input type="text"
                                    placeholder="Buscar persona por: Nombre Completos"
                                    value={query_search || ""}
                                    name="query_search"
                                    onChange={({ target }) => this.setState({ [target.name]: target.value })}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2">
                            <Button fluid
                                onClick={async (e) => {
                                    await this.getUserEntity(1, false)
                                }}
                            >
                                <i className="fas fa-search"></i>
                            </Button>
                        </div>
                    </div>

                    <div className="pl-4 mt-4 pr-4">
                        <List divided verticalAlign='middle'>
                            {user && user.data && user.data.map(obj => 
                                <List.Item key={`list-people-${obj.id}`}>
                                    <List.Content floated='right'>
                                        <Button color="blue"
                                            onClick={(e) => this.handleAdd(obj)}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </Button>
                                    </List.Content>
                                    <Image avatar src={obj.image ? `${obj.image && obj.image_images && obj.image_images.image_50x50}` : '/img/base.png'} 
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <List.Content><span className="uppercase">{obj.fullname}</span></List.Content>
                                </List.Item>
                            )}
                        </List>    
                    </div>

                    <div className="col-md-12 mt-3">
                        <Button fluid
                            disabled={loader || !(user.lastPage > user.page)}
                            onClick={(e) => this.handlePage(user.page + 1)}
                        >
                            Obtener más registros
                        </Button>
                    </div>
                </Form>
            </Modal>
        );
    }

}