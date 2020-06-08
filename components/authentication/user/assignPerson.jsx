import React, { Component } from 'react'
import Modal from '../../modal';
import atob from 'atob';
import { Button, Form, List, Image, Pagination } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { authentication } from '../../../services/apis';

export default class AssignPerson extends Component
{

    state = {
        loader: false,
        people: {},
        query_search: ""
        
    }

    componentDidMount = async () => {
        await this.getPeople(1, this.state);
    }

    getPeople = async (page = 1, state) => {
        this.setState({ loader: true });
        await authentication.get(`person?page=${page}&query_search=${state.query_search || ""}`)
        .then(res => this.setState({ people: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    handlePage = async (e, { activePage }) => {
        this.setState({ loader: true });
        await this.getPeople(activePage, this.state);
        
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
                titulo={<span><i className="fas fa-user"></i> Asignar Persona</span>}
            >
                <Form className="card-body" loading={loader}>

                    <div className="row justify-content-center pl-4 pr-4">
                        <div className="col-md-10 mb-2 text-left">
                            <Form.Field>
                                <input type="text"
                                    placeholder="Buscar persona por: Apellidos Completos"
                                    value={query_search || ""}
                                    name="query_search"
                                    onChange={({ target }) => this.setState({ [target.name]: target.value })}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2">
                            <Button fluid
                                onClick={async (e) => {
                                    await this.getPeople(1, this.state)
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
                                            Add
                                        </Button>
                                    </List.Content>
                                    <Image avatar src={obj.image ? `${authentication.path}${obj.image}` : '/img/base.png'} />
                                    <List.Content>{obj.fullname}</List.Content>
                                </List.Item>
                            )}
                        </List>    
                    </div>
                    
                    <div className="row justify-content-center mt-3">
                        <div className="col-md-12">
                            <hr/>
                        </div>
                        <div className="col-md-12">
                            <Pagination 
                                defaultActivePage={people && people.page || 1} 
                                totalPages={people && people.lastPage}
                                enabled={loader}
                                onPageChange={this.handlePage}
                            />
                        </div>
                    </div>
                </Form>
            </Modal>
        );
    }

}