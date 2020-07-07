import React, { Fragment, Component } from 'react';
import { Accordion, Menu, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';


export default class ListCheck extends Component
{

    state = {
        parents: [],
        children: [],
        indexCheck: null,
        childIndexCheck: null
    };

    componentDidMount = () => {
        this.setting(this.props);
    }

    componentWillReceiveProps = (nextProps) => {
        this.setting(nextProps);
    }

    setting = (props) => {
        this.setState({ parents: props.list, children: props.listChild })
    }

    handleClick = async (par, index) => {
        let { onParent } = this.props;
        if (typeof onParent == 'function') {
            let next = await onParent(par, index);
            if (next) await this.setState({ indexCheck: index });
        }   
    }

    handleCheck = async (child, index, checked) => {
        // fire event
        let { onChild } = this.props;
        if (typeof onChild == 'function') {
            let next = await onChild(child, index, checked);
            if (next) await  this.setState(state => {
                state.children[index].checked = checked;
                return { childIndexCheck: index, children: state.children };
            });
        }
    }

    render() {

        let { parents, children, indexCheck } = this.state;
        let { id, disabled } = this.props;

        return (
            <Accordion as={Menu} vertical fluid>
                {parents.map((par, index) => 
                    <Menu.Item key={`${id}-parent-${par.id}`} disabled={disabled || false}>
                        <Accordion.Title
                            active={indexCheck === index}
                            content={<b>{par.name}</b>}
                            index={0}
                            onClick={(e) => this.handleClick(par,index)}
                        />
                        <Accordion.Content active={indexCheck === index}>
                            <Fragment>
                                <Form.Group grouped>
                                    {children.map((child, childIndex) => 
                                        <Form.Checkbox 
                                            label={child.name} 
                                            key={`${id}-child-${child.id}`}
                                            checked={child.checked ? true : false}
                                            onChange={(e, obj) => this.handleCheck(child, childIndex, obj.checked)}
                                        />    
                                    )}
                                </Form.Group>
                            </Fragment>
                        </Accordion.Content>
                    </Menu.Item>    
                )}
            </Accordion>
        )
    }

}


ListCheck.propTypes = {
    id: PropTypes.string.isRequired,
    onParent: PropTypes.func.isRequired,
    onChild: PropTypes.func.isRequired,
    list: PropTypes.array.isRequired,
    listChild: PropTypes.array.isRequired
};