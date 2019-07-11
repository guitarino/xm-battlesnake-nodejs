var express = require("express");
const deepcopy = require("deepcopy");
var router = express.Router();

// Handle POST request to '/start'
router.post("/start", function(req, res) {
  // NOTE: Do something here to start the game
  console.log(req.body);
  // Response data
  var data = {
    color: "#DFFF00",
    name: "ContraSnake",
    head_url: "http://www.placecage.com/c/200/200", // optional, but encouraged!
    taunt: "I won't run into walls and i am made of javascript" // optional, but encouraged!
  };

  return res.json(data);
});

// Handle POST request to '/move'
router.post("/move", function(req, res) {
  // NOTE: Do something here to generate your move
  //console.log(req.body)
  let move = getMove(req.body);
  // Response data
  var data = {
    move: move, // one of: ['up','down','left','right']
    taunt: "Outta my way, snake!" // optional, but encouraged!
  };

  return res.json(data);
});

function getMySnake(gameState) {
  return getSnake(gameState, gameState.you);
}

function getSnake(gameState, id) {
  let snake = gameState.snakes.find(snake => snake.id === id);
  return snake;
}

function getMove(gameState) {
  let nextDirection = getNextPreferredDirection(gameState);
  let isDangerous = determineDangerous(gameState);

  if (!isDangerous(nextDirection)) {
    return nextDirection;
  }

  if (!isDangerous("left")) {
    return "left";
  }

  if (!isDangerous("right")) {
    return "right";
  }

  if (!isDangerous("up")) {
    return "up";
  }

  if (!isDangerous("down")) {
    return "down";
  }

  const distanceToWalls = howManySaveMovesToWalls(mySnake, width, height);
  const distanceToSnakesAndWalls = accountForSnakes(
    mySnake,
    snakes,
    distanceToWalls
  );

  let nextMove = "left";
  let nextSteps = 0;

  if (distanceToSnakesAndWalls.left > 0) {
    nextMove = "left";
    nextSteps = distanceToSnakesAndWalls.left;
  }

  if (distanceToSnakesAndWalls.right > nextSteps) {
    nextMove = "right";
    nextSteps = distanceToSnakesAndWalls.right;
  }

  if (distanceToSnakesAndWalls.down > nextSteps) {
    nextMove = "down";
    nextSteps = distanceToSnakesAndWalls.down;
  }

  if (distanceToSnakesAndWalls.up > nextSteps) {
    nextMove = "up";
    nextSteps = distanceToSnakesAndWalls.up;
  }

  return nextMove;
}

function getHead(snake) {
  return snake.coords[0];
}

function getX(coord) {
  return coord[0];
}

function getY(coord) {
  return coord[1];
}

function howManySaveMovesToWalls(mySnake, width, height) {
  const head = getHead(mySnake);
  const up = getY(head);
  const left = getX(head);
  const right = width - 1 - getX(head);
  const down = height - 1 - getY(head);
  return {
    up,
    down,
    left,
    right
  };
}

function determineDangerous(gameState) {
  let mySnake = getMySnake(gameState);
  let { snakes, width, height } = gameState;
  return function isDangerous(direction) {
    for (let i = 0; i < 30; i++) {
      const distanceToWalls = howManySaveMovesToWalls(mySnake, width, height);
      const distanceToSnakesAndWalls = accountForSnakes(
        mySnake,
        snakes,
        distanceToWalls
      );
      const distance = distanceToSnakesAndWalls[direction];
      if (distance === 0) {
        return true;
      }
      const nextDirection = getNextPreferredDirection(gameState);
      const nextState = getNextState(nextDirection, mySnake, snakes);
      mySnake = nextState.mySnake;
      snakes = nextState.snakes;
    }
    return false;
  };
}

function getNextPreferredDirection(gameState) {
  return getPreferredFoodDirection(gameState);
  // if (health_points < 30) {
  //   return
  // }
}

function getNextState(nextDirection, myOldSnake, oldSnakes) {
  const mySnake = deepcopy(myOldSnake);
  const snakes = deepcopy(oldSnakes);
  mySnake.coords.pop();
  if (nextDirection === "up") {
    mySnake.coords.unshift([mySnake.coords[0], mySnake.coords[1] - 1]);
  }
  if (nextDirection === "down") {
    mySnake.coords.unshift([mySnake.coords[0], mySnake.coords[1] + 1]);
  }
  if (nextDirection === "right") {
    mySnake.coords.unshift([mySnake.coords[0] + 1, mySnake.coords[1]]);
  }
  if (nextDirection === "left") {
    mySnake.coords.unshift([mySnake.coords[0] - 1, mySnake.coords[1]]);
  }
  for (let i = 0; i < snakes.length; i++) {
    snakes[i].coords.pop();
  }
  return { mySnake, snakes };
}

function getPreferredFoodDirection(gameState) {
  let foodCoord = gameState.food[0];
  let mySnake = getMySnake(gameState);
  let head = getHead(mySnake);
  let move;

  if (getX(foodCoord) < getX(head)) {
    move = "left";
  }

  if (getX(foodCoord) > getX(head)) {
    move = "right";
  }

  if (getY(foodCoord) < getY(head)) {
    move = "up";
  }

  if (getY(foodCoord) > getY(head)) {
    move = "down";
  }

  return move;
}

function accountForSnakes(mySnake, snakes, distanceToWalls) {
  const head = getHead(mySnake);
  let minUp = distanceToWalls.up;
  let minLeft = distanceToWalls.left;
  let minRight = distanceToWalls.right;
  let minDown = distanceToWalls.down;
  for (let i = 0; i < snakes.length; i++) {
    const snake = snakes[i];
    for (let j = 0; j < snake.coords.length; j++) {
      const coord = snake.coords[j];
      if (getX(head) === getX(coord) && getY(head) === getY(coord)) {
        continue;
      }
      if (getX(head) === getX(coord)) {
        if (getY(head) > getY(coord)) {
          minUp = Math.min(getY(head) - getY(coord) - 1, minUp);
        } else {
          minDown = Math.min(getY(coord) - getY(head) - 1, minDown);
        }
      }
      if (getY(head) === getY(coord)) {
        if (getX(head) > getX(coord)) {
          minLeft = Math.min(getX(head) - getX(coord) - 1, minLeft);
        } else {
          minRight = Math.min(getX(coord) - getX(head) - 1, minRight);
        }
      }
    }
  }
  return {
    up: minUp,
    down: minDown,
    left: minLeft,
    right: minRight
  };
}

module.exports = router;
