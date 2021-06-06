import React, { Component } from "react";

export default class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false
    };

    this.close = this.close.bind(this);
  }

  componentDidMount() {
    this.setState((state, props) => ({
      isShow: props.show ? props.show : false
    }));
  }

  componentWillReceiveProps(Newprops) {
    if (Newprops.show != this.props.show) this.setState({ isShow: Newprops.show });
  }

  async close(e) {
    let { isClose } = this.props;
    if (typeof isClose == "function") {
      await isClose(false);
    }
  }

  render() {
    let { md, disabled = false, display, classHeader, classClose, height } = this.props;
    let { isShow } = this.state;

    if (isShow || display) {
      return (
        <div
          style={{
            width: "100%",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: "0px",
            left: "0px",
            zIndex: "1050",
            display: isShow  ? 'block' : 'none',
            padding: "0.5em 0.5em"
          }}
        >
          <div style={{ display: "flex", height: "100%", justifyContent: "center", alignItems: "center", }}>
            <div
              className={`col-md-${md ? md : "6"} card`}
              style={{ position: "relative", maxHeight: "95vh", height: height ? height : 'auto', background: 'white', overflow: 'auto'}}
            >
              <div className={`card-header ${classHeader}`}>
                {this.props.titulo}
                <button
                  className={`close ${classClose}`}
                  disabled={disabled}
                  onClick={this.close}
                >
                  <i className="fas fa-times fa-xs"></i>
                </button>
              </div>
              <div style={{ height: "100%", position: "relative" }}>
                {this.props.children}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}