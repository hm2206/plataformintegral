import React, { Component, Fragment } from "react";

class Loader extends Component {
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
            <span className="spinner-border"></span>
        </div>
      </Fragment>
    );
  }
}

export default Loader;