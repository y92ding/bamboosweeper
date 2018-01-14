import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import { Menu, Table } from 'semantic-ui-react';
const axios = require('axios');

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

class Board extends React.Component {
  render() {
    var board = [];
    for (let i = 0; i < this.props.size.height; i++) {
      var row = [];
      for (let j = 0; j < this.props.size.width; j++) {
        row.push(<Square key={j} value={this.props.board[i*this.props.size.width+j]}
            onClick={()=>this.props.onClickSquare(i*this.props.size.width+j)}
            onRightClick={()=>this.props.onRightClickSquare(i*this.props.size.width+j)}/>);
      }
      board.push(<div key={i} className="board-row">{row}</div>);
    }

    return board;
  }
};

class SimpleGame extends React.Component {
  constructor(props) {
    super(props);
    this.startTime;
    this.runTimer;
    var secretBoard = this.makeSecretBoard(this.props.size);
    var squareCount = this.props.size.width * this.props.size.height;
    this.state = {
      playerBoard: Array(squareCount).fill(null),
      secretBoard: secretBoard,
      hungerPoints: this.props.size.bamboos,
      status: "ready",
      caption: "Click 'Intro' above if you are not sure how to play. Enjoy the game :)",
      timer: 0.0,
    };
  }

  countSurroundingBamboos(pos, size, arr) {
    var y = pos.y;
    var x = pos.x;
    var width = size.width;
    var height = size.height;
    if (arr[y*width+x] === 'x') {
      console.error("Counting surrounding bamboos for a bamboo square...Abort!!!");
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

  makeSecretBoard(size) {
    var arr = Array(size.width*size.height).fill(null);
    arr.fill('x', 0, size.bamboos);
    for (let i = 0; i < size.bamboos; i++) {
      let des = Math.floor(Math.random()*(size.width*size.height));
      let temp = arr[i];
      arr[i] = arr[des];
      arr[des] = temp;
    }
    for (let j = 0; j < size.height; j++) {
      for (let k = 0; k < size.width; k++) {
        if (arr[j*size.width+k] !== 'x') {
          var surroundingBamboos = this.countSurroundingBamboos({x: k, y: j}, size, arr);
          arr[j*size.width+k] = surroundingBamboos;
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

  revealSquare(pos, playerBoard) {
    if (this.state.status !== "playing" &&
        this.state.status !== "ready") {
      console.error("Calling revealSquare when status is not 'playing'...Abort!!!");
      return;
    }

    var y = pos.y;
    var x = pos.x;
    var width = this.props.size.width;
    var height = this.props.size.height;
    var arr = this.state.secretBoard;
    if (arr[y*width+x] === 'x') {
      console.error("Calling revealSquare on a bamboo square...Abort!!!");
      return;
    }

    playerBoard[y*width+x] = arr[y*width+x];

    if (playerBoard[y*width+x] === 0) {
      if (y > 0 && x > 0 && playerBoard[(y-1)*width+x-1] == null) this.revealSquare({x: x-1, y: y-1}, playerBoard);
      if (y > 0 && playerBoard[(y-1)*width+x] == null) this.revealSquare({x: x, y: y-1}, playerBoard);
      if (y > 0 && x < width-1 && playerBoard[(y-1)*width+x+1] == null) this.revealSquare({x: x+1, y: y-1}, playerBoard);
      if (x > 0 && playerBoard[y*width+x-1] == null) this.revealSquare({x: x-1, y: y}, playerBoard);
      if (x < width-1 && playerBoard[y*width+x+1] == null) this.revealSquare({x: x+1, y: y}, playerBoard);
      if (y < height-1 && x > 0 && playerBoard[(y+1)*width+x-1] == null) this.revealSquare({x: x-1, y: y+1}, playerBoard);
      if (y < height-1 && playerBoard[(y+1)*width+x] == null) this.revealSquare({x: x, y: y+1}, playerBoard);
      if (y < height-1 && x < width-1 && playerBoard[(y+1)*width+x+1] == null) this.revealSquare({x: x+1, y: y+1}, playerBoard);
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

    if (this.state.playerBoard[i] !== null) {
      this.setState({
        caption: "This square is already revealed. Try another one.",
      })
      return;
    }

    if (this.state.secretBoard[i] === 'x') {
      clearInterval(this.runTimer);
      this.setState({
        status: "lost",
        caption: "You let Brenda the panda step on a bamboo shoot! Brenda is hurt. :(",
      })
      return;
    }

    var newplayerBoard = this.state.playerBoard.slice();
    var width = this.props.size.width;
    this.revealSquare({x: i%width, y: Math.floor(i/width)}, newplayerBoard);

    this.setState({
      playerBoard: newplayerBoard,
      caption: "Brenda the panda's hunger points: " + this.state.hungerPoints,
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

    if (this.state.playerBoard[i] !== null) {
      this.setState({
        caption: "This square is already revealed. Try another one.",
      })
      return;
    }

    if (this.state.secretBoard[i] !== 'x') {
      clearInterval(this.runTimer);
      this.setState({
        status: "lost",
        caption: "This is not a bamboo shoot! Brenda is disappointed. :(",
      });
      return;
    }

    var playerBoard = this.state.playerBoard.slice();
    playerBoard[i] = '^';
    if (this.state.hungerPoints <= 0) {
      console.error("hunger points already <= 0...Abort!!!");
      return;
    }
    var newHungerPoints = this.state.hungerPoints - 1;

    this.setState({
      playerBoard: playerBoard,
      hungerPoints: newHungerPoints,
    })

    if (newHungerPoints === 0) {
      clearInterval(this.runTimer);
      this.setState({
        status: "won",
        caption: "All bamboos are collected. You are Brenda's new friend now!!! :D",
      })
    } else {
      this.setState({
        caption: "Brenda the panda's hunger points: " + newHungerPoints,
      })
    }
  }

  render() {
    return (
      <div className="board">
        <h3>{this.state.timer}</h3>
        <Board size={this.props.size} board={this.state.playerBoard}
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
      boardSize: {
        width: 15,
        height: 15,
        bamboos: 30,
      },
      rankings: [],
    };
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick(e, {name}) {
    this.setState({view: name,});

    if ('rank' === name) {
      this.getRankings();
    }
  }

  getRankings() {
    axios.get('/rankings')
      .then((response) => {
        this.setState({
          rankings: response.data,
        });
      })
      .catch((error) => {
        if (error.response) {
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          console.error(error.request);
        } else {
          console.error('Error', error.message);
        }

        console.error(error.config);
      });
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
        view = <SimpleGame className="board" size={this.state.boardSize} />;
        break;
      case 'rank':
        var rankings = [];
        for (let i in this.state.rankings) {
            rankings.push(
              <Table.Row>
                <Table.Cell>{i+1}</Table.Cell>
                <Table.Cell>{this.state.rankings[i].name}</Table.Cell>
                <Table.Cell>{this.state.rankings[i].time}</Table.Cell>
              </Table.Row>
            );
        }
        view = (
          <Table basic='very' className="rank">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell> </Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Time</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
              {rankings}
            <Table.Body>
          </Table>
        );
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
