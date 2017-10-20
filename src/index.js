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
  renderSquare(square_i) {
    return <Square value={square_i} />;
  }

  renderRow(row_i) {
    var row = [];
    for (let i = 0; i < 10; i++) {
      row.push(this.renderSquare(row_i*10 + i));
    }
    return (
      <div className="board-row">
        {row}
      </div>
    );
  }

  render() {
    var grid = [];
    for (let i = 0; i < 10; i++) {
      grid.push(this.renderRow(i));
    }

    return (
      <div className="grid">
          {grid}
      </div>
    );
  }
};

class Game extends React.Component {
  render() {
    return (
      <Grid />
    );
  }
};

ReactDOM.render(
  <Game />,
  document.getElementById("root")
);
