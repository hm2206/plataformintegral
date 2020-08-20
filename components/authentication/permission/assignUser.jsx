import React, { Component } from 'react'
import Modal from '../../modal';
import atob from 'atob';
import { Button, Form, List, Image } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { authentication } from '../../../services/apis';

export default class AssignUser extends Component
{

    state = {
        loader: false,
        people: {
            data: []
        },
        query_search: ""
        
    }

    componentDidMount = async () => {
        await this.getUser(1, this.state);
    }

    componentDidMount = async () => {
        await this.getUser(1, this.state);
    }

    getUser = async (page = 1, state, update = false) => {
        this.setState({ loader: true });
        await authentication.get(`user?page=${page}&query_search=${state.query_search || ""}`)
        .then(res => this.setState(state => {
            let { data, lastPage, page, total } = res.data;
            state.people.data = update ? data : [...state.people.data, ...data];
            state.people.lastPage = lastPage;
            state.people.page = page;
            state.people.total = total;
            return { people: state.people };
        }))
        .catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    handlePage = async (nextPage) => {
        this.setState({ loader: true });
        await this.getUser(nextPage, this.state);
    }

    handleAdd = async (obj) => {
        let { getAdd } = this.props;
        if (typeof getAdd == 'function') {
            let { push, pathname, query } = Router;
            await getAdd(obj);
            query.assign = "";
            push({ pathname, query });
        }
    }

    render() {

        let { loader, people, query_search } = this.state;

        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-user"></i> Seleccionar Usuario</span>}
            >
                <Form className="card-body" loading={loader}>

                    <div className="row justify-content-center pl-4 pr-4">
                        <div className="col-md-10 mb-2 text-left">
                            <Form.Field>
                                <input type="text"
                                    placeholder="Buscar usuario por: email o username"
                                    value={query_search || ""}
                                    name="query_search"
                                    onChange={({ target }) => this.setState({ [target.name]: target.value })}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2">
                            <Button fluid
                                onClick={async (e) => {
                                    await this.getUser(1, this.state, true)
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
                                    <Image avatar src={obj.image ? obj.image && obj.image_images && obj.image_images.image_50x50 : '/img/base.png'} style={{ objectFit: 'cover' }}/>
                                    <List.Content>{obj.email || ""} - <small className="badge badge-warning">{obj.username || ""}</small></List.Content>
                                </List.Item>
                            )}
                        </List>    
                    </div>
                    
                    <div className="row justify-content-center mt-3">
                        <div className="col-md-12">
                            <hr/>
                        </div>
                        <div className="col-md-12">
                            <Button fluid
                                disabled={loader || people.lastPage == people.page}
                                onClick={(e) => this.handlePage(people.page + 1)}
                            >
                                Obtener más registros
                            </Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        );
    }

}