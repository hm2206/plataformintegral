import React, { Component } from 'react';


export default class ContentControl extends Component
{

    render() {
        return (
            <div style={{ 
                width: "100%", heigth: "100px",
                position: "fixed", bottom: "0px",
                right: "0px", background: "#fff",
                padding: "0.5em", borderTop: "1px solid #eeeeee"
            }}>
                <div className="row align-items-center justify-content-end">
                    <div className="col-md-3 col-lg-2"></div>
                    <div className="col-md-9 col-lg-10">
                        <div className="row h-100 justify-content-end">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}