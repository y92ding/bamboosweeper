import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

class Square extends React.Component {
  onRightClick(e) {
    e.preventDefault();
    this.props.onRightClick();
  }
  render() {
    return (
        <button className="square" onClick={this.props.onClick}
            onContextMenu={(e)=>{this.onRightClick(e)}}>
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
        row.push(<Square key={j} value={this.props.grid[i*this.props.size.width+j]}
            onClick={()=>this.props.onClickSquare(i*this.props.size.width+j)}
            onRightClick={()=>this.props.onRightClickSquare(i*this.props.size.width+j)}/>);
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

class SimpleGame extends React.Component {
  constructor(props) {
    super(props);
    var secretGrid = makeSecretGrid(this.props.size);
    var squareCount = this.props.size.width * this.props.size.height;
    this.state = {
      playerGrid: Array(squareCount).fill(null),
      secretGrid: secretGrid,
      minesLeft: this.props.size.mines,
      status: "playing",
    };
  }

  revealSquare(pos, playerGrid) {
    if (this.state.status !== "playing") {
      console.error("Calling revealSquare when status is not 'playing'...Abort!!!");
      return;
    }

    var y = pos.y;
    var x = pos.x;
    var width = this.props.size.width;
    var height = this.props.size.height;
    var arr = this.state.secretGrid;
    if (arr[y*width+x] === 'x') {
      console.error("Calling revealSquare on a mine square...Abort!!!");
      return;
    }

    playerGrid[y*width+x] = arr[y*width+x];

    if (playerGrid[y*width+x] === 0) {
      if (y > 0 && x > 0 && playerGrid[(y-1)*width+x-1] == null) this.revealSquare({x: x-1, y: y-1}, playerGrid);
      if (y > 0 && playerGrid[(y-1)*width+x] == null) this.revealSquare({x: x, y: y-1}, playerGrid);
      if (y > 0 && x < width-1 && playerGrid[(y-1)*width+x+1] == null) this.revealSquare({x: x+1, y: y-1}, playerGrid);
      if (x > 0 && playerGrid[y*width+x-1] == null) this.revealSquare({x: x-1, y: y}, playerGrid);
      if (x < width-1 && playerGrid[y*width+x+1] == null) this.revealSquare({x: x+1, y: y}, playerGrid);
      if (y < height-1 && x > 0 && playerGrid[(y+1)*width+x-1] == null) this.revealSquare({x: x-1, y: y+1}, playerGrid);
      if (y < height-1 && playerGrid[(y+1)*width+x] == null) this.revealSquare({x: x, y: y+1}, playerGrid);
      if (y < height-1 && x < width-1 && playerGrid[(y+1)*width+x+1] == null) this.revealSquare({x: x+1, y: y+1}, playerGrid);
    }
  }

  onClickSquare(i) {
    if (this.state.status !== "playing") {
      return;
    }

    if (this.state.playerGrid[i] !== null) {
      return;
    }

    if (this.state.secretGrid[i] === 'x') {
      //alert("Clicked on mine! You lost!");
      this.setState({
        status: "lost",
      })
      return;
    }

    var newPlayerGrid = this.state.playerGrid.slice();
    var width = this.props.size.width;
    this.revealSquare({x: i%width, y: Math.floor(i/width)}, newPlayerGrid);

    this.setState({
      playerGrid: newPlayerGrid,
    });
  }

  onRightClickSquare(i) {
    if (this.state.status !== "playing") {
      return;
    }

    if (this.state.playerGrid[i] !== null) {
      return;
    }

    if (this.state.secretGrid[i] !== 'x') {
      // alert("It's not a mine! You lost!");
      this.setState({
        status: "lost",
      });
      return;
    }

    var playerGrid = this.state.playerGrid.slice();
    playerGrid[i] = 'M';
    if (this.state.minesLeft <= 0) {
      console.error("# of mines left already <= 0...Abort!!!");
      return;
    }
    var newMinesLeft = this.state.minesLeft - 1;
    var newStatus = newMinesLeft === 0 ? "won" : "playing";
    // // if won, the following message will be displayed,
    // // and then M will show on the square clicked.
    // // it's a feature, not a bug :)
    // if (newStatus === "won") {
    //   alert("Congratulatousationalimory! You won! Good for you!");
    // }
    this.setState({
      playerGrid: playerGrid,
      minesLeft: newMinesLeft,
      status: newStatus,
    })
  }

  render() {
    var gameStatusCaption;
    if (this.state.status === "won") {
      gameStatusCaption = "Congratulations! You won!";
    } else if (this.state.status === "lost") {
      gameStatusCaption = "You lost! :D!";
    } else if (this.state.status === "playing") {
      gameStatusCaption = "There are " + this.state.minesLeft + " mines left.";
    }
    return (
      <div>
        <Grid size={this.props.size} grid={this.state.playerGrid}
            onClickSquare={(i) => this.onClickSquare(i)}
            onRightClickSquare={(i)=>this.onRightClickSquare(i)}/>
        <p>{gameStatusCaption}</p>
      </div>
    );
  }

};

class FancyGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size: {
        width: 15,
        height: 15,
        mines: 30,
      },
    };
  }

  render() {
    return <SimpleGame size={this.state.size} />;
  }

};

ReactDOM.render(
  <FancyGame />,
  document.getElementById("root")
);

function countSurroundingMines(pos, size, arr) {
  var y = pos.y;
  var x = pos.x;
  var width = size.width;
  var height = size.height;
  if (arr[y*width+x] === 'x') {
    console.error("Counting surrounding mines for a mine square...Abort!!!");
    return -1;
  }
  var count = 0;
  if (y > 0 && x > 0 && arr[(y-1)*width+x-1] === 'x') count++;
  if (y > 0 && arr[(y-1)*width+x] === 'x') count++;
  if (y > 0 && x < width-1 && arr[(y-1)*width+x+1] === 'x') count++;
  if (x > 0 && arr[y*width+x-1] === 'x') count++;
  if (x < width-1 && arr[y*width+x+1] === 'x') count++;
  if (y < height-1 && x > 0 && arr[(y+1)*width+x-1] === 'x') count++;
  if (y < height-1 && arr[(y+1)*width+x] === 'x') count++;
  if (y < height-1 && x < width-1 && arr[(y+1)*width+x+1] === 'x') count++;
  return count;
}

function makeSecretGrid(size) {
  var arr = Array(size.width*size.height).fill(null);
  arr.fill('x', 0, size.mines);
  for (let i = 0; i < size.mines; i++) {
    let des = Math.floor(Math.random()*(size.width*size.height));
    console.log(des);
    let temp = arr[i];
    arr[i] = arr[des];
    arr[des] = temp;
  }
  for (let j = 0; j < size.height; j++) {
    for (let k = 0; k < size.width; k++) {
      if (arr[j*size.width+k] !== 'x') {
        var surroundingMines = countSurroundingMines({x: k, y: j}, size, arr);
        arr[j*size.width+k] = surroundingMines;
      }
    }
  }
  return arr;
}
