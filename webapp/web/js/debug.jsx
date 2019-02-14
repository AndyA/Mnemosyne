"use strict";

console.log("Debug mode enabled");

const React = require("react");
const ReactDOM = require("react-dom");
const ReactJSON = require("react-json-view").default;

class Debugger extends React.Component {
  render() {
    return (
      <div>
        <h3>Developer Stuff</h3>
        <ReactJSON 
          src={STASH} 
          name="this" 
          theme="monokai" 
          collapsed="true" 
          collapseStringsAfterLength={100}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <Debugger />,
  document.getElementById("debug")
);
