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
  let move = findFood(req.body);
  // Response data
  var data = {
    move: move, // one of: ['up','down','left','right']
    taunt: "Outta my way, snake!" // optional, but encouraged!
  };

  return res.json(data);
});

function getMove(gameState) {
  return;
}

function getMySnake(gameState) {
  return getSnake(gameState, gameState.you);
}

function getSnake(gameState, id) {
  let snake = gameState.snakes.find(snake => snake.id === id);
  return snake;
}

function findFood(gameState) {
  let mySnake = getMySnake(gameState);
  let head = mySnake.coords[0];

  const { width, height, snakes } = gameState;

  const isBadMove = isDistanceZero(mySnake, width, height, snakes);

  if (gameState.food[0][0] < head[0] && !isBadMove("left")) {
    move = "left";
  }

  if (gameState.food[0][0] > head[0] && !isBadMove("right")) {
    move = "right";
  }

  if (gameState.food[0][1] < head[1] && !isBadMove("up")) {
    move = "up";
  }

  if (gameState.food[0][1] > head[1] && !isBadMove("down")) {
    move = "down";
  }

  return move || "up";
}

function isDistanceZero(mySnake, width, height, snakes) {
  return function(direction) {
    const distanceToWalls = howManySaveMovesToWalls(mySnake, width, height);
    const distanceToSnakesAndWalls = accountForSnakes(
      mySnake,
      snakes,
      distanceToWalls
    );
    const distance = distanceToSnakesAndWalls[direction];
    return distance === 0;
  };
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

function determineDangerous(mySnake, snakes, width, height) {
  function isDangerous(direction) {
    for (let i = 0; i < 10; i++) {
      const distanceToWalls = howManySaveMovesToWalls(mySnake, width, height);
      const distanceToSnakesAndWalls = accountForSnakes(
        mySnake,
        snakes,
        distanceToWalls
      );
      const distance = distanceToSnakesAndWalls[direction];
      if (
        distance.up === 0 &&
        distance.down === 0 &&
        distance.left === 0 &&
        distance.right === 0
      ) {
        return true;
      }
      const direction = getNextPreferredDirection();
      const nextState = getNextState(direction);
      mySnake = nextState.mySnake;
      snakes = nextState.snakes;
    }
    return false;
  }
}

function getNextPreferredDirection() {
  if (health_points < 30) {
    return getPreferredFoodDirection();
  }
}

// function getPreferredFoodDirection() {
//   let foodCoord = gameState.food[0];
//   if (get[0] < head[0] && !isBadMove("left")) {
//     move = "left";
//   }

//   if (gameState.food[0][0] > head[0] && !isBadMove("right")) {
//     move = "right";
//   }

//   if (gameState.food[0][1] < head[1] && !isBadMove("up")) {
//     move = "up";
//   }

//   if (gameState.food[0][1] > head[1] && !isBadMove("down")) {
//     move = "down";
//   }
// }

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
