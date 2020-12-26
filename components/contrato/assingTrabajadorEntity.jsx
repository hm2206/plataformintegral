import React, { Component } from 'react'
import Modal from '../modal';
import { Button, Form, List, Image, Checkbox  } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { escalafon } from '../../services/apis';

export default class AssignTrabajadorEntity extends Component
{

    state = {
        loader: false,
        people: {
            data: []
        },
        query_search: ""
        
    }

    componentDidMount = async () => {
        await this.getPeople(1, this.state);
    }

    getPeople = async (page = 1, state, update = false) => {
        this.setState({ loader: true });
        await escalafon.get(`work?page=${page}&query_search=${state.query_search || ""}`)
        .then(res => {
            let { success, message } = res.data;
            if (success === false) throw new Error(message);
            this.setState(state => {
                let { data, last_page, current_page, total } = res.data;
                state.people.data = update ? data : [...state.people.data, ...data];
                state.people.lastPage = last_page;
                state.people.page = current_page;
                state.people.total = total;
                return { people: state.people };
            })
        })
        .catch(err => this.setState(state => {
            state.people.lastPage = 1;
            state.people.page = 1;
            return { people: state.people }
        }));
        this.setState({ loader: false });
    }

    handlePage = async (nextPage) => {
        this.setState({ loader: true });
        await this.getPeople(nextPage, this.state);
    }

    handleAdd = async (obj) => {
        let { getAdd,local } = this.props;
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
                titulo={<span><i className="fas fa-user"></i> Asignar Trabajador</span>}
            >
                <Form className="card-body" loading={loader}>

                    <div className="row justify-content-center pl-4 pr-4">
                        <div className="col-md-10 mb-2 text-left">
                            <Form.Field>
                                <input type="text"
                                    placeholder="Buscar persona por: Apellidos y Nombres"
                                    value={query_search || ""}
                                    name="query_search"
                                    onChange={({ target }) => this.setState({ [target.name]: target.value })}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2">
                            <Button fluid
                                onClick={async (e) => {
                                    await this.getPeople(1, this.state, true)
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
                                    <List.Content><span className="uppercase">{obj.person && obj.person.fullname}</span></List.Content>
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