import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

class Square extends React.Component {
  render() {
    return (
        <button className="square">
          {this.props.value}
        </button>
    );
  }
};

class Grid extends React.Component {
  render() {
    var grid = [];
    for (let i = 0; i < this.props.side; i++) {
      var row = [];
      for (let j = 0; j < this.props.side; j++) {
        row.push(<Square key={j} value={this.props.grid[i*10+j]} />);
      }
      grid.push(<div key={i} className="board-row">{row}</div>);
    }

    return (
      <div className="grid">
          {grid}
      </div>
    );
  }
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    var secretGrid = makeSecretGrid(15, 10);
    this.state = {
      side: 10,
      playerGrid: Array(100).fill(null),
      secretGrid: secretGrid,
    };
  }

  render() {
    return (
      <Grid side={10} grid={this.state.secretGrid} />
    );
  }

};

ReactDOM.render(
  <Game />,
  document.getElementById("root")
);

function makeSecretGrid(mines, side) {
  var arr = Array(side*side).fill(null);
  arr.fill('x', 0, mines);
  for (let i = 0; i < mines; i++) {
    let des = Math.floor(Math.random(2)*100);
    let temp = arr[i];
    arr[i] = arr[des];
    arr[des] = temp;
  }
  for (let i = 0; i < 100; i++) {
    console.log(arr[i]);
  }
  return arr;
}
