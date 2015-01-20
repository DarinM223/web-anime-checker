/** @jsx React.DOM */
'use strict';

/**
 * @property {function(username, password)} onLogin
 */
var LoginPageComponent = React.createClass({displayName: 'LoginPageComponent',
  onLoginClicked: function(event) {
    var username = this.refs.username.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;

    this.props.onLogin(username, password);
  },
  render: function() {
    return (
      React.createElement("div", {className: "container"}, 
        React.createElement("form", {className: "form-horizontal"}, 
          React.createElement("legend", null, React.createElement("h1", null, "Login to Hummingbird")), 
          React.createElement("fieldset", null, 
            React.createElement("div", {className: "form-group"}, 
              React.createElement("div", {className: "col-lg-10"}, 
                React.createElement("input", {type: "text", className: "form-control", id: "inputUsername", 
                       ref: "username", placeholder: "Hummingbird username"})
              )
            ), 
            React.createElement("div", {className: "form-group"}, 
              React.createElement("div", {className: "col-lg-10"}, 
                React.createElement("input", {type: "password", id: "inputUsername", className: "form-control", 
                       ref: "password", placeholder: "Hummingbird password"})
              )
            ), 
            React.createElement("div", {className: "form-group col-lg-11 col-lg-offset-1"}, 
              React.createElement("a", {className: "btn btn-primary", onClick: this.onLoginClicked}, 
                "Login"
              )
            )
          )
        )
      )
    );
  }
});