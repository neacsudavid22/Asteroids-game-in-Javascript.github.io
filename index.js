const gameArea = document.getElementById("game-area");
let bullets = [];
let asteroids = [];
const keys = {
    w: { pressed: false }, s: { pressed: false }, a: { pressed: false }, d: { pressed: false },
    n: { pressed: false }, m: { pressed: false },
    x: { pressed: false }
};

gameArea.style.background = "black";
gameArea.setAttribute("width", window.innerWidth);
gameArea.setAttribute("height", window.innerHeight);

class SpaceShip {
    constructor({ position, movement, color }) {
        this.position = { x: position.x, y: position.y };
        this.angle = 0; 
        this.movement = { x: movement.x, y: movement.y };
        this.color = { stroke: color.stroke, fill: color.fill}
        this.spaceShip = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.initialize();
    }

    initialize() {
        // Create the spaceship polygon
        this.spaceShipBody = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.spaceShipBody.setAttribute("points", "30,-15 10,40 50,40");
        this.spaceShipBody.setAttribute("fill", this.color.fill);
        this.spaceShipBody.setAttribute("stroke", this.color.stroke);
        this.spaceShipBody.setAttribute("stroke-width", "5");

        // Create fire element (triangle)
        this.fire = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.fire.setAttribute("points", "22,44 38,44 31,58");
        this.fire.setAttribute("fill", "yellow");
        this.fire.setAttribute("stroke", "red");
        this.fire.setAttribute("stroke-width", "3");

        // Create window element (circle)
        this.rocketWindow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.rocketWindow.setAttribute("r", "10");
        this.rocketWindow.setAttribute("fill", "cyan");
        this.rocketWindow.setAttribute("cx", "30");
        this.rocketWindow.setAttribute("cy", "25");

        this.spaceShip.appendChild(this.spaceShipBody);
        this.spaceShip.appendChild(this.fire);
        this.spaceShip.appendChild(this.rocketWindow);

        gameArea.appendChild(this.spaceShip);
 
        this.updateTransform();
        this.engineAnimation();
    }
    updateTransform() {
        const { x, y } = this.position;
        const angle = this.angle;
        this.spaceShip.setAttribute("transform", `translate(${x}, ${y}) rotate(${angle} ,30, 40)`);
    }

    engineAnimation(){
        let isYellow = true; 

        setInterval(() => {
            this.fire.setAttribute("fill", isYellow ? "yellow": "orange");
            isYellow = !isYellow;
            this.fire.setAttribute("stroke-width", `${3 + Math.floor(Math.random() * 2)}`);
        }, 300);
    }

    shootBullet() {
        let bullet = document.createElementNS("http://www.w3.org/2000/svg", "line");
        bullet.setAttribute("stroke", "lime");
        bullet.setAttribute("stroke-width", 4);
    
        bullets.push(bullet);
        gameArea.appendChild(bullet);
    
        let bulletPosition = {
            x1: this.position.x + 30, 
            y1: this.position.y - 50, 
            x2: this.position.x + 30, 
            y2: this.position.y - 15  
        };
    
        const moveBullet = () => {
            bulletPosition.y1 -= 10; 
            bulletPosition.y2 -= 10;
    
            bullet.setAttribute('x1', bulletPosition.x1);
            bullet.setAttribute('y1', bulletPosition.y1);
            bullet.setAttribute('x2', bulletPosition.x2);
            bullet.setAttribute('y2', bulletPosition.y2);
    
            if (bulletPosition.y1 < 0) {
                gameArea.removeChild(bullet);
            } else {
                requestAnimationFrame(moveBullet);
            }
        };
    
        requestAnimationFrame(moveBullet);
    }

    move() {
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
    keys.w.pressed ? spaceShip.movement.y = -4 : keys.s.pressed ? spaceShip.movement.y = 3 : spaceShip.movement.y = 0.;
    keys.a.pressed ? spaceShip.movement.x = -4.5 : keys.d.pressed ? spaceShip.movement.x = 4.5 : spaceShip.movement.x = 0;
    keys.n.pressed ? spaceShip.angle -= 1.5 : keys.m.pressed ? spaceShip.angle += 1.5 : spaceShip.angle += 0;
    spaceShip.move();
    requestAnimationFrame(updatePosition);
}

// Start animation
updatePosition();

class Asteroid {
    
    constructor({ spawnPoint, level}) {
        const colors = ['green','orange','red','darkred'];
        this.spawnPoint = spawnPoint;
        this.movePoint = -50;
        this.level = level;
        this.color = colors[level-1];
        this.speed = 6 - level + Math.random();
        this.radius = this.level * 20;
        this.drawAsteroid();
    }

    drawAsteroid() {
        const points = [];
        const sides = 5 + Math.floor(Math.random() * 3); // Random number of sides (5-10)
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const distance = this.radius * (0.8 + Math.random() * 0.2); // Vary distance for irregularity
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            points.push(`${x},${y}`);
        }

        this.asteroidPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        this.asteroidPolygon.setAttribute("points", points.join(" "));
        this.asteroidPolygon.setAttribute("stroke", "white");
        this.asteroidPolygon.setAttribute("fill", `${this.color}`);
        this.asteroidPolygon.setAttribute("stroke-width", "2");
        this.asteroidPolygon.setAttribute("transform", `translate(${this.spawnPoint}, ${this.movePoint})`);

        this.text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.text.setAttribute("x", this.spawnPoint); // Centered horizontally at the spawn point
        this.text.setAttribute("y", this.movePoint); // Centered vertically at the spawn point
        this.text.setAttribute("fill", "white");
        this.text.setAttribute("font-size", `${this.level * 15}`);
        this.text.setAttribute("font-family", "Arial");
        this.text.setAttribute("x", this.spawnPoint - 5); 
        this.text.setAttribute("y", this.movePoint + 5);
        this.text.textContent = `${this.level}`;

        this.asteroid = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.asteroid.appendChild(this.asteroidPolygon);
        this.asteroid.appendChild(this.text);

        gameArea.appendChild(this.asteroid);
    }

    move() {
        this.movePoint += this.speed;
        this.asteroid.setAttribute("transform", `translate(${this.spawnPoint}, ${this.movePoint})`);
        if(this.movePoint >= 800 && this.asteroid.parentNode === gameArea){
            asteroids.splice(asteroids.indexOf(this.asteroid), 1);
            gameArea.removeChild(this.asteroid);
        }
    }
}

function animateAsteroids(asteroid) {
    asteroid.move(); 
    asteroid.speed = keys.w.pressed ? 6.5 - asteroid.level + Math.random()
                    : keys.s.pressed ?  5.5 - asteroid.level + Math.random() 
                    : 6 - asteroid.level + Math.random() 
    requestAnimationFrame(() => animateAsteroids(asteroid));
}

function spawnAsteroids(){
    setInterval(() => {
        const asteroid = new Asteroid({
            spawnPoint: 100 + Math.random() * window.innerWidth, 
            level: 4
        });
        asteroids.push(asteroid);
        animateAsteroids(asteroid);
    }, 3000);
    
    setInterval(() => {
        const asteroid = new Asteroid({
            spawnPoint: 100 + Math.random() * window.innerWidth, 
            level: 3
        });        
        asteroids.push(asteroid);
        animateAsteroids(asteroid);
    }, 2000);
    
    setInterval(() => {
        const asteroid = new Asteroid({
            spawnPoint: 100 + Math.random() * window.innerWidth, 
            level: 2
        });    
        asteroids.push(asteroid);
        animateAsteroids(asteroid);
    }, 1500);
    
    setInterval(() => {
        const asteroid = new Asteroid({
            spawnPoint: 100 + Math.random() * window.innerWidth, 
            level: 1
        });
        asteroids.push(asteroid);
        animateAsteroids(asteroid);
    }, 1000);
}

spawnAsteroids();

function updateLasers() {
    lasers.forEach(laser => laser.move());
    requestAnimationFrame(updateLasers);
}

updateLasers();

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
        case "KeyN":
            keys.n.pressed = true;
            break;
        case "KeyM":
            keys.m.pressed = true;
            break;
        case "KeyX":
            spaceShip.shootBullet();
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
        case "KeyN":
            keys.n.pressed = false;
            break;
        case "KeyM":
            keys.m.pressed = false;
            break;
    }
});