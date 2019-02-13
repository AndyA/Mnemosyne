"use strict";

console.log("Debug mode enabled");

const React = require("react");
const ReactDOM = require("react-dom");
const ReactJson = require("react-json-view").default;

class Debugger extends React.Component {
  render() {
    return (
      <div>
        <ReactJson src={STASH} theme="monokai" collapsed="true" sortKeys="true" />
      </div>
    );
  }
}

console.log({Debugger, ReactJson});

ReactDOM.render(
  <Debugger />,
  document.getElementById("debug")
);
