"use strict";

console.log("Debug mode enabled");

const React = require("react");
const ReactDOM = require("react-dom");
const ReactJson = require("react-json-view").default;

class Debugger extends React.Component {
  render() {
    return (
      <div>
        <h3>Developer Stuff</h3>
        <ReactJson src={STASH} name="this" theme="monokai" collapsed="true" />
      </div>
    );
  }
}

ReactDOM.render(
  <Debugger />,
  document.getElementById("debug")
);
