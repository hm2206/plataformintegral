import React, { Component, Fragment } from "react";
import { Loader } from 'semantic-ui-react';

class Loading extends Component {
  render() {
    return (
      <Fragment>
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
             <Loader active />
        </div>
      </Fragment>
    );
  }
}

export default Loading;