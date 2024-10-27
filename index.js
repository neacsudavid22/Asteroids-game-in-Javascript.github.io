const gameArea = document.getElementById("game-area");
const keys = {
    w: { pressed: false }, s: { pressed: false }, a: { pressed: false }, d: { pressed: false }
};

gameArea.style.background = "black";
gameArea.setAttribute("width", window.innerWidth);
gameArea.setAttribute("height", window.innerHeight);

class SpaceShip {
    constructor({ position, movement, color }) {
        this.position = { x: position.x, y: position.y };
        this.movement = { x: movement.x, y: movement.y };
        this.color = { stroke: color.stroke, fill: color.fill}
        this.initialize();
    }

    initialize() {
        // Create the spaceship polygon
        this.spaceShip = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.spaceShip.setAttribute("points", "30,-15 10,40 50,40");
        this.spaceShip.setAttribute("fill", this.color.fill);
        this.spaceShip.setAttribute("stroke", this.color.stroke);
        this.spaceShip.setAttribute("stroke-width", "5");

        // Create fire element (smaller triangle)
        this.fire = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.fire.setAttribute("points", "22,44 38,44 31,58");
        this.fire.setAttribute("fill", "yellow");
        this.fire.setAttribute("stroke", "red");
        this.fire.setAttribute("stroke-width", "3");

        // Create window element (circle)
        this.rocketWindow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.rocketWindow.setAttribute("r", "10");
        this.rocketWindow.setAttribute("fill", "cyan");

        // Append elements to the game area
        gameArea.appendChild(this.spaceShip);
        gameArea.appendChild(this.fire);
        gameArea.appendChild(this.rocketWindow);

        // Initial position
        this.updateTransform();
        this.fireAnimation();
    }
    updateTransform() {
        // Update the transform for the spaceship and related elements
        const { x, y } = this.position;
        this.spaceShip.setAttribute("transform", `translate(${x}, ${y})`);
        this.fire.setAttribute("transform", `translate(${x}, ${y})`);
        this.rocketWindow.setAttribute("cx", x + 30);
        this.rocketWindow.setAttribute("cy", y + 24);
    }

    fireAnimation(){
        let isYellow = true; 

        setInterval(() => {
            this.fire.setAttribute("fill", isYellow ? "yellow": "orange");
            isYellow = !isYellow;
            this.fire.setAttribute("stroke-width", `${3 + Math.floor(Math.random() * 2)}`);
        }, 300);
    }

    move() {
        // Update the position based on movement
        this.position.x += this.movement.x;
        this.position.y += this.movement.y;
        if(keys.s.pressed) {
            this.fire.setAttribute("points", "20,44 40,44 31,55");
        }
        else if(keys.w.pressed){
            this.fire.setAttribute("points", "22,44 38,44 31,61");
        }
        else{
            this.fire.setAttribute("points", "22,44 38,44 31,56");
        }
        this.updateTransform();
    }
}

const spaceShip = new SpaceShip({
    position: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    },
    movement: {
        x: 0,
        y: 0
    },
    color: {
        fill: "white",
        stroke: "orange"
    }
});

function updatePosition() {
    keys.w.pressed ? spaceShip.movement.y = -1.6 : keys.s.pressed ? spaceShip.movement.y = 1.4 : spaceShip.movement.y = 0.1;
    keys.a.pressed ? spaceShip.movement.x = -1.8 : keys.d.pressed ? spaceShip.movement.x = 1.8 : spaceShip.movement.x = 0;
    spaceShip.move();
    requestAnimationFrame(updatePosition);
}

// Start animation
updatePosition();

document.addEventListener('keydown', (event)=>{
    switch(event.code){
        case "KeyW":
            keys.w.pressed = true;
            break;
        case "KeyS":
            keys.s.pressed = true;
            break;
        case "KeyA":
            keys.a.pressed = true;
            break;
        case "KeyD":
            keys.d.pressed = true;
            break;
    }
});

document.addEventListener('keyup', (event)=>{
    switch(event.code){
        case "KeyW":
            keys.w.pressed = false;
            break;
        case "KeyS":
            keys.s.pressed = false;
            break;
        case "KeyA":
            keys.a.pressed = false;
            break;
        case "KeyD":
            keys.d.pressed = false;
            break;
    }
});