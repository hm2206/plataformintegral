import React, { Component } from 'react';

export default class NavCover extends Component
{

    state = {
      newOptions: []
    }

    handleOption = (key) => {
      if (typeof this.props.getOption == 'function') {
        this.props.getOption(key);
      }
      return false;
    }

    componentDidMount = async () => {
      await this.checkActive();
    }

    componentWillReceiveProps = async (nextProps) => {
      let { props } = this;
      if (props.active != nextProps.active) await this.checkActive();
    }

    checkActive = () => {
      this.setState((state, props) => {
        state.newOptions = props.options ? props.options.map(obj => {
          obj.active = obj.key == props.active ? true : false;
          return obj;
        }) : [];
        return { newOptions: state.newOptions }
      });
    }

    render() {
        return (
            <nav class="page-navs">
              <div class="nav-scroller">
                <div class="nav nav-center nav-tabs">
                  {this.state.newOptions && this.state.newOptions.map(obj => 
                    <a class={`nav-link ${obj.active ? 'active' : ''}`}
                      key={`option-${obj.key}`}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => this.handleOption(obj.key)}
                    >{obj.text}</a>   
                  )}
                </div>
              </div>
            </nav>
        )
    }

}