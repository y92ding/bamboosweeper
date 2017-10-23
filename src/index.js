import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

class Square extends React.Component {
  render() {
    return (
        <button className="square" onClick={this.props.onClick}>
          {this.props.value}
        </button>
    );
  }
};

class Grid extends React.Component {
  render() {
    var grid = [];
    for (let i = 0; i < this.props.size.height; i++) {
      var row = [];
      for (let j = 0; j < this.props.size.width; j++) {
        row.push(<Square key={j} value={this.props.grid[i*10+j]}
            onClick={() => this.props.onClickSquare(i*this.props.size.width+j)} />);
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
    var secretGrid = makeSecretGrid(15, {width:10, height:10});
    this.state = {
      size: {
        width: 10,
        height: 10,
      },
      playerGrid: Array(100).fill(null),
      secretGrid: secretGrid,
    };
  }

  revealSquare(pos, playerGrid, calledOnNull = true) {
    var y = pos.y;
    var x = pos.x;
    var width = this.state.size.width;
    var height = this.state.size.height;
    var arr = this.state.secretGrid;
    var revealSquare = this.revealSquare;
    if (arr[y*width+x] == 'x') {
      console.error("Calling revealSquare on a mine square...Abort!!!");
      return;
    }
    if (calledOnNull && arr[y*width+x] != null) {
      console.error("Calling revealSquare(calledOnNull == true) on a not null square...Abort!!!");
    }
    playerGrid[y*width+x] = arr[y*width+x];
    if (y > 0 && x > 0 && arr[(y-1)*width+x-1] == 'x') revealSquare({x: x-1, y: y-1}, playerGrid);
    if (y > 0 && arr[(y-1)*width+x] == 'x') revealSquare({x: x, y: y-1}, playerGrid);
    if (y > 0 && x < width-1 && arr[(y-1)*width+x+1] == 'x') revealSquare({x: x+1, y: y-1}, playerGrid);
    if (x > 0 && arr[y*width+x-1] == 'x') revealSquare({x: x-1, y: y}, playerGrid);
    if (x < width-1 && arr[y*width+x+1] == 'x') revealSquare({x: x+1, y: y}, playerGrid);
    if (y < height-1 && x > 0 && arr[(y+1)*width+x-1] == 'x') revealSquare({x: x-1, y: y+1}, playerGrid);
    if (y < height-1 && arr[(y+1)*width+x] == 'x') revealSquare({x: x, y: y+1}, playerGrid);
    if (y < height-1 && x < width-1 && arr[(y+1)*width+x+1] == 'x') revealSquare({x: x+1, y: y+1}, playerGrid);
  }

  onClickSquare(i) {
    var playerGrid = this.state.playerGrid.slice();

    if (this.state.secretGrid[i] == 'x') {
      alert("Clicked on mine!");
      return;
    }

    var width = this.state.size.width;
    this.revealSquare({x: i%width, y: i/width}, playerGrid, false)

    this.setState({
      playerGrid: playerGrid,
    });
  }

  render() {
    return (
      <Grid size={this.state.size} grid={this.state.playerGrid}
          onClickSquare={(i) => this.onClickSquare(i)}/>
    );
  }

};

ReactDOM.render(
  <Game />,
  document.getElementById("root")
);

function countSurroundingMines(pos, size, arr) {
  var y = pos.y;
  var x = pos.x;
  var width = size.width;
  var height = size.height;
  if (arr[y*width+x] == 'x') {
    console.error("Counting surrounding mines for a mine square...Abort!!!");
    return -1;
  }
  var count = 0;
  if (y > 0 && x > 0 && arr[(y-1)*width+x-1] == 'x') count++;
  if (y > 0 && arr[(y-1)*width+x] == 'x') count++;
  if (y > 0 && x < width-1 && arr[(y-1)*width+x+1] == 'x') count++;
  if (x > 0 && arr[y*width+x-1] == 'x') count++;
  if (x < width-1 && arr[y*width+x+1] == 'x') count++;
  if (y < height-1 && x > 0 && arr[(y+1)*width+x-1] == 'x') count++;
  if (y < height-1 && arr[(y+1)*width+x] == 'x') count++;
  if (y < height-1 && x < width-1 && arr[(y+1)*width+x+1] == 'x') count++;
  return count;
}

function makeSecretGrid(mines, size) {
  var arr = Array(size.width*size.height).fill(null);
  arr.fill('x', 0, mines);
  for (let i = 0; i < mines; i++) {
    let des = Math.floor(Math.random(2)*100);
    let temp = arr[i];
    arr[i] = arr[des];
    arr[des] = temp;
  }
  for (let j = 0; j < size.height; j++) {
    for (let k = 0; k < size.width; k++) {
      if (arr[j*size.width+k] != 'x') {
        var surroundingMines = countSurroundingMines({x: k, y: j}, size, arr);
        if (surroundingMines) arr[j*size.width+k] = surroundingMines;
      }
    }
  }
  return arr;
}
