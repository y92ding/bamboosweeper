import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import { Menu } from 'semantic-ui-react'

class Square extends React.Component {
  onRightClick(e) {
    e.preventDefault();
    this.props.onRightClick();
  }
  render() {
    return (
        <button className='square' onClick={this.props.onClick}
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

    return grid;
  }
};

class SimpleGame extends React.Component {
  constructor(props) {
    super(props);
    this.startTime;
    this.runTimer;
    var secretGrid = this.makeSecretGrid(this.props.size);
    var squareCount = this.props.size.width * this.props.size.height;
    var caption = "Left click to reveal a grid, " +
        "or right click to defuse a mine. Enjoy the game :)";
    this.state = {
      playerGrid: Array(squareCount).fill(null),
      secretGrid: secretGrid,
      minesLeft: this.props.size.mines,
      status: "ready",
      caption: caption,
      timer: 0.0,
    };
  }

  countSurroundingMines(pos, size, arr) {
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

  makeSecretGrid(size) {
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
          var surroundingMines = this.countSurroundingMines({x: k, y: j}, size, arr);
          arr[j*size.width+k] = surroundingMines;
        }
      }
    }
    return arr;
  }

  updateTimer(self) {
    var newTime = (Math.floor((new Date().getTime() -
        this.startTime) / 100) / 10).toFixed(1);
    self.setState({
      timer: newTime,
    })
  }

  revealSquare(pos, playerGrid) {
    if (this.state.status !== "playing" &&
        this.state.status !== "ready") {
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
    if (this.state.status === "ready") {
      this.startTime = new Date().getTime();
      this.runTimer = setInterval(()=>this.updateTimer(this), 100);
      this.setState({
        status: "playing",
      })
    } else if (this.state.status !== "playing") {
      this.setState({
        caption: "The game has ended. Ctrl+R to play again.",
      })
      return;
    }

    if (this.state.playerGrid[i] !== null) {
      this.setState({
        caption: "This grid is already revealed. Try another one.",
      })
      return;
    }

    if (this.state.secretGrid[i] === 'x') {
      clearInterval(this.runTimer);
      this.setState({
        status: "lost",
        caption: "You clicked on a mine! You lost. :(",
      })
      return;
    }

    var newPlayerGrid = this.state.playerGrid.slice();
    var width = this.props.size.width;
    this.revealSquare({x: i%width, y: Math.floor(i/width)}, newPlayerGrid);

    this.setState({
      playerGrid: newPlayerGrid,
      caption: "There are " + this.state.minesLeft + " mines left.",
    });
  }

  onRightClickSquare(i) {
    if (this.state.status === "ready") {
      this.startTime = new Date().getTime();
      this.startTimer = setInterval(()=>this.updateTimer(this), 100);
      this.setState({
        status: "playing",
      })
    } else if (this.state.status !== "playing") {
      this.setState({
        caption: "The game has ended. Ctrl+R to play again.",
      })
      return;
    }

    if (this.state.playerGrid[i] !== null) {
      this.setState({
        caption: "This grid is already revealed. Try another one.",
      })
      return;
    }

    if (this.state.secretGrid[i] !== 'x') {
      clearInterval(this.runTimer);
      this.setState({
        status: "lost",
        caption: "This is not a mine! You lost. :(",
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

    this.setState({
      playerGrid: playerGrid,
      minesLeft: newMinesLeft,
    })

    if (newMinesLeft === 0) {
      clearInterval(this.runTimer);
      this.setState({
        status: "won",
        caption: "All mines are defused. You won!!! :D",
      })
    } else {
      this.setState({
        caption: "There are " + newMinesLeft + " mines left.",
      })
    }
  }

  render() {
    return (
      <div className="grid">
        <h3>{this.state.timer}</h3>
        <Grid size={this.props.size} grid={this.state.playerGrid}
            onClickSquare={(i) => this.onClickSquare(i)}
            onRightClickSquare={(i)=>this.onRightClickSquare(i)}/>
        <h4>{this.state.caption}</h4>
      </div>
    );
  }

};

class FancyGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'intro',
      gridSize: {
        width: 15,
        height: 15,
        mines: 30,
      },
    };
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick(e, {name}) {
    this.setState({view: name,});
  }

  render() {
    var view;

    switch (this.state.view) {
      case 'intro':
        view = (
          <div>
            <img className="title" src="bamboosweeper.png" alt="Bamboosweeper"/>
            <p className="intro">
              Brenda is a cute little panda, so cute that you really want to make friends with her.<br/>
              But Brenda the panda would not become your friend easily.<br/>
              She asks you to help her find her favourite food, bamboo shoots.<br/>
              If you hurt her or disappoint her, she will become sad and run away from you.<br/>
              But if you find all the bamboo shoots for Brenda, she will gladly be your new friend.<br/><br/><br/>
              (Click 'Game' above to start your journey.)<br/><br/><br/>
              How to play:<br/>
              Left click on a square to tell Brenda where to go.<br/>
              She will tell you how many bamboo shoots there are in the surrounding area.<br/>
              If you left click on bamboos, Brenda will get hurt stepping on bamboo shoots.<br/><br/>
              Right click on a square to tell Brenda where to collect bamboo shoots.<br/>
              Her hunger points will decrease, and she will like you more.<br/>
              If you right click on a square without bamboo, Brenda will be disappointed and stop trusting you.<br/>
            </p>
          </div>
        );
        break;
      case 'game':
        view = <SimpleGame className="grid" size={this.state.gridSize} />;
        break;
      case 'rank':
        view = <p className="rank">rank</p>;
        break;
      default:
        console.error("Unexpected this.state.view... Abort!!!");
    }

    return (
      <div className="game-column">
        <Menu pointing secondary>
          <Menu.Item name='intro' active={'intro' === this.state.view} onClick={this.handleItemClick} />
          <Menu.Item name='game' active={'game' === this.state.view} onClick={this.handleItemClick} />
          <Menu.Item name='rank' active={'rank' === this.state.view} onClick={this.handleItemClick} />
        </Menu>
        {view}
      </div>
    )
  }

};

ReactDOM.render(
  <FancyGame/>,
  document.getElementById("root")
);
