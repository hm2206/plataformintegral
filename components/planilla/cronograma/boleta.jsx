import React, { Component } from 'react';
import { Form } from 'semantic-ui-react';

export default class Boleta extends Component
{

    render() {

        let { categoria } = this.props;

        return (
            <Form>
                <Form.Group widths="equal">
                    <Form.Field>
                        <label htmlFor="">Hola</label>
                        <input type="number"/>
                    </Form.Field>

                    <Form.Field>
                        <label htmlFor="">Hola</label>
                        <input type="number"/>
                    </Form.Field>

                    <Form.Field>
                        <label htmlFor="">Hola</label>
                        <input type="number"/>
                    </Form.Field>
                </Form.Group>
            </Form>
        )
    }

}