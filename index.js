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

let score = 0;
const scoreDisplay = document.createElementNS("http://www.w3.org/2000/svg", "text");
scoreDisplay.setAttribute("fill", "white");
scoreDisplay.setAttribute("font-size", 30);
scoreDisplay.setAttribute("font-family", "Arial");
scoreDisplay.setAttribute("x", window.innerWidth / 20);
scoreDisplay.setAttribute("y", window.innerHeight / 10);
gameArea.appendChild(scoreDisplay);

const scoreInterval = setInterval( () => scoreDisplay.textContent = `Score: ${score}`, 100 );

let timeCombo = Date.now();
let combo = 1;

const multiplier = document.createElementNS("http://www.w3.org/2000/svg", "text");
multiplier.setAttribute("fill", "red");
multiplier.setAttribute("font-size", 18);
multiplier.setAttribute("font-family", "Arial");
multiplier.setAttribute("x", window.innerWidth / 20);
multiplier.setAttribute("y", window.innerHeight / 10 + 40);
gameArea.appendChild(multiplier);

const multiplierInterval = setInterval( () => {
    if(Date.now() - timeCombo >= 3000) combo = 1;
    multiplier.textContent = `Multiplier: x${combo.toPrecision(2)}`;
}, 100 );

function gameOver(){
    clearInterval(scoreInterval);
    clearInterval(multiplierInterval)
    const finalText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    finalText.setAttribute("fill", "white");
    finalText.setAttribute("font-size", 100);
    finalText.setAttribute("font-family", "Arial");
    finalText.setAttribute("x", window.innerWidth / 2);
    finalText.setAttribute("y", window.innerHeight * 0.45);
    finalText.setAttribute("text-anchor", "middle");
    finalText.setAttribute("baseline-direction", "middle");

    finalText.textContent = `GAME OVER!`;
    const finalScore = document.createElementNS("http://www.w3.org/2000/svg", "text");
    finalScore.setAttribute("fill", "white");
    finalScore.setAttribute("font-size", 40);
    finalScore.setAttribute("font-family", "Arial");
    finalScore.setAttribute("x", window.innerWidth / 2);
    finalScore.setAttribute("y", window.innerHeight * 0.55);
    finalScore.setAttribute("text-anchor", "middle");
    finalScore.setAttribute("baseline-direction", "middle"); 
    finalScore.textContent = `Your Score Was ${score}`;

    gameArea.appendChild(finalText);
    gameArea.appendChild(finalScore);
}

const lifes = [];
for(let i = 0; i < 3; i++){
    const heart = document.createElementNS("http://www.w3.org/2000/svg", "text");
    heart.setAttribute("x", 15 + 15 * i * 2);
    heart.setAttribute("y", window.innerHeight - 30);
    heart.setAttribute("font-size", 25);

    heart.textContent = "💛";
    lifes.push(heart);
    gameArea.appendChild(lifes[i]);
}

class Bullet{
    constructor({spaceShipPosition, spaceShipAngle}) {
        this.bullet = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.bullet.setAttribute("stroke", "lime");
        this.bullet.setAttribute("stroke-width", 4);

        this.angle = spaceShipAngle;
            
        this.position = {
            x1: spaceShipPosition.x + 30,
            y1: spaceShipPosition.y,
            x2: spaceShipPosition.x + 30, 
            y2: spaceShipPosition.y + 21
        };

        this.bullet.setAttribute('x1', this.position.x1);
        this.bullet.setAttribute('y1', this.position.y1);
        this.bullet.setAttribute('x2', this.position.x2);
        this.bullet.setAttribute('y2', this.position.y2);

        this.bullet.setAttribute("transform", `rotate(${this.angle},${this.position.x2}, ${this.position.y2})`);

        bullets.push(this);
        gameArea.appendChild(this.bullet);
        
        const moveBullet = () => {

            this.position.y1 -= 4;
            this.position.y2 -= 4;
    
            this.bullet.setAttribute("x1", this.position.x1);
            this.bullet.setAttribute("y1", this.position.y1);
            this.bullet.setAttribute("x2", this.position.x2);
            this.bullet.setAttribute("y2", this.position.y2);

            if (this.position.y2 < -200 && this.bullet.parentNode === gameArea) {
                gameArea.removeChild(this.bullet);
                bullets.splice(bullets.indexOf(this), 1); 
            } else {
                requestAnimationFrame(moveBullet);
            }
        }

        requestAnimationFrame(moveBullet);
    }

    getRealCoord(){
        const ctm = this.bullet.getScreenCTM();
        const bulletPoint1 = this.bullet.ownerSVGElement.createSVGPoint();
        bulletPoint1.x = this.position.x1;
        bulletPoint1.y = this.position.y1;
        const bulletPoint2 = this.bullet.ownerSVGElement.createSVGPoint();
        bulletPoint2.x = this.position.x2;
        bulletPoint2.y = this.position.y2;
        const bulletPoint1Modified = bulletPoint1.matrixTransform(ctm);
        const bulletPoint2Modified = bulletPoint1.matrixTransform(ctm);
        return [bulletPoint1Modified, bulletPoint2Modified];
    }
}

class SpaceShip {
    constructor({ position, movement, color }) {
        this.invulnerable = false;
        this.active = true;
        this.lifes = 3;
        this.position = { x: position.x, y: position.y };
        this.angle = 0; 
        this.movement = { x: movement.x, y: movement.y };
        this.color = { stroke: color.stroke, fill: color.fill}
        this.spaceShip = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.initialize();
    }

    initialize() {
        this.spaceShipBody = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.spaceShipBody.setAttribute("points", "30,-15 10,40 50,40");
        //tip(30,-15); left(10,40); right(50,40)
        this.spaceShipBody.setAttribute("fill", this.color.fill);
        this.spaceShipBody.setAttribute("stroke", this.color.stroke);
        this.spaceShipBody.setAttribute("stroke-width", "5");

        this.fire = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.fire.setAttribute("points", "22,44 38,44 31,58");
        this.fire.setAttribute("fill", "yellow");
        this.fire.setAttribute("stroke", "red");
        this.fire.setAttribute("stroke-width", "3");

        this.rocketWindow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.rocketWindow.setAttribute("r", "10");
        this.rocketWindow.setAttribute("fill", "cyan");
        this.rocketWindow.setAttribute("cx", "30");
        this.rocketWindow.setAttribute("cy", "26");

        this.gun = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.gun.setAttribute("r", "4");
        this.gun.setAttribute("fill", "grey");
        this.gun.setAttribute("cx", "30");
        this.gun.setAttribute("cy", "15");

        this.spaceShip.appendChild(this.spaceShipBody);
        this.spaceShip.appendChild(this.fire);
        this.spaceShip.appendChild(this.gun);
        this.spaceShip.appendChild(this.rocketWindow);

        gameArea.appendChild(this.spaceShip);
 
        this.move();
        this.engineAnimation();
    }

    damagedAnimation(){
        return new Promise((resolve) => {
            spaceShip.invulnerable = true;
            setTimeout( () => {
                this.spaceShipBody.setAttribute("fill", "orange")
                this.spaceShipBody.setAttribute("stroke", "white")
            }, 100);
            setTimeout( () => {
                this.spaceShipBody.setAttribute("fill", "white")
                this.spaceShipBody.setAttribute("stroke", "orange")
                }, 200);
                setTimeout( () => {
                    this.spaceShipBody.setAttribute("fill", "orange")
                    this.spaceShipBody.setAttribute("stroke", "white")
                }, 300);
            setTimeout( () => {
                this.spaceShipBody.setAttribute("fill", "white")
                this.spaceShipBody.setAttribute("stroke", "orange")
                resolve()
                }, 400);
            }
        );
    }

    engineAnimation(){
        let isYellow = true; 

        setInterval(() => {
            this.fire.setAttribute("fill", isYellow ? "yellow": "orange");
            isYellow = !isYellow;
            this.fire.setAttribute("stroke-width", `${3 + Math.floor(Math.random() * 2)}`);
        }, 300);
    }

    shootBullet(){
        if (bullets.length < 3 && this.active) {
            new Bullet({ spaceShipPosition: this.position, spaceShipAngle: this.angle});
        }
    }

    move() {
        if(this.active){
            this.position.x += this.movement.x;
            this.position.y += this.movement.y;
            this.spaceShip.setAttribute("transform", 
                `translate(${this.position.x}, ${this.position.y}) rotate(${this.angle}, 30, 21)`);
        }

        if ((this.position.y < -200 || this.position.x < -200 || 
            this.position.y > window.innerHeight + 200|| this.position.x > window.innerWidth + 200) 
            && this.spaceShip.parentNode === gameArea) {

                gameArea.removeChild(this.spaceShip);
                
                for(let i = 0; i < this.lifes; i++)
                    gameArea.removeChild(lifes.pop()); 
                this.lifes = 0; 

                gameOver();
        }
    }

    getSpaceShipPoints(){
        //"30,-15 10,40 50,40";
        if (!this.spaceShipBody.ownerSVGElement) 
            return [];

        const ctm = this.spaceShipBody.getScreenCTM();
        const tip = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        tip.x = 30; 
        tip.y = -15;
        const tipFinal = tip.matrixTransform(ctm);

        const left = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        left.x = 10;
        left.y = 40;
        const leftFinal = left.matrixTransform(ctm);

        const right = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        right.x = 50;
        right.y = 40;
        const rightFinal = right.matrixTransform(ctm);

        return [tipFinal, leftFinal, rightFinal];
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
    keys.w.pressed ? spaceShip.movement.y = -4 : keys.s.pressed ? spaceShip.movement.y = 4 : spaceShip.movement.y = 0;
    keys.a.pressed ? spaceShip.movement.x = -4 : keys.d.pressed ? spaceShip.movement.x = 4 : spaceShip.movement.x = 0;
    keys.n.pressed ? spaceShip.angle -= 3.5 : keys.m.pressed ? spaceShip.angle += 3.5 : spaceShip.angle += 0;
    spaceShip.move();
    requestAnimationFrame(updatePosition);
}

updatePosition();

class Asteroid {    
    constructor(level, {position, direction}) {
        const index = Math.round(Math.random() * 7);

        if(!position && !direction){
            switch(index){
                case 0:
                    this.position = { 
                        x: -200, 
                        y: Math.random() * window.innerHeight / 2
                    };
                    this.direction = {
                         horizontal: 1,
                         vertical: Math.random() * 0.5
                    };
                    break;
                case 1:
                    this.position = { 
                        x: -200,
                        y: window.innerHeight/2 + Math.random() * window.innerHeight/2, 
                    };
                    this.direction = {
                            horizontal: 1,
                            vertical: Math.random() * 0.5
                    };
                    break;
                case 2:
                    this.position = { 
                        x: Math.random() * window.innerWidth/2,
                        y: window.innerHeight + 200
                    };
                    this.direction = {
                            horizontal: Math.random() * 0.5,
                            vertical:  - 1
                    };
                    break;
                case 3:
                    this.position = { 
                        x: window.innerWidth/2 + Math.random() * window.innerWidth/2,
                        y: window.innerHeight + 200
                    };
                    this.direction = {
                            horizontal: -1 * Math.random() * 0.5,
                            vertical: -1
                    };
                    break;
    
                case 4:
                    this.position = { 
                        x: window.innerWidth + 200,
                        y: window.innerHeight/2 + Math.random() * window.innerHeight/2
                    };
                    this.direction = {
                            horizontal: -1,
                            vertical: -1 * Math.random() * 0.5,
                    };
                    break;
                case 5:
                    this.position = { 
                        x: window.innerWidth + 200,
                        y: Math.random() * window.innerHeight/2
                    };
                    this.direction = {
                            horizontal: -1,
                            vertical: Math.random() * 0.5,
                    };
                    break;
                case 6:
                    this.position = { 
                        x: window.innerWidth/2 + Math.random() * window.innerWidth/2,
                        y: -200
                    };
                    this.direction = {
                            horizontal: -1 * Math.random() * 0.5,
                            vertical: 1
                    };
                    break;
                case 7:
                    this.position = { 
                        x: Math.random() * window.innerWidth/2,
                        y: -200
                    };
                    this.direction = {
                            horizontal: Math.random() * 0.5,
                            vertical: 1
                    };
                    break;
            }
        }
        else{
            this.position = { x: position.x, y: position.y };
            this.direction = { horizontal: direction.horizontal, vertical: direction.vertical };
        }

        const colors = ['green','orange','red','darkred'];
        this.level = level;
        this.color = colors[level-1];
        this.speed = 5.5 - level + Math.random();
        this.radius = this.level * 20;

        this.drawAsteroidCircle();
    }

    drawAsteroidCircle() {

        this.asteroidCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        this.asteroidCircle.setAttribute("cx", 0);
        this.asteroidCircle.setAttribute("cy", 0);
        this.asteroidCircle.setAttribute("r", this.radius);
        this.asteroidCircle.setAttribute("stroke", "white");
        this.asteroidCircle.setAttribute("fill", `${this.color}`);
        this.asteroidCircle.setAttribute("stroke-width", "2");

        this.text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.text.setAttribute("fill", "white");
        this.text.setAttribute("font-size", `${this.level * 16}`);
        this.text.setAttribute("font-family", "Arial");
        this.text.setAttribute("text-anchor", "middle");
        this.text.setAttribute("alignment-baseline", "middle");
        this.text.textContent = `${this.level}`;

        this.asteroid = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.asteroid.appendChild(this.asteroidCircle);
        this.asteroid.appendChild(this.text);

        if(this.direction.vertical !== 0 && this.direction.horizontal !== 0)
            gameArea.appendChild(this.asteroid);
        else 
            asteroids.splice(asteroids.indexOf(this), 1);
    }

    destroyedAnimation(){
        return new Promise((resolve) => {
            setTimeout( () => {
                this.asteroidCircle.setAttribute("fill", "grey")
                this.asteroidCircle.setAttribute("stroke", "white")
            }, 50);
            setTimeout( () => {
                this.asteroidCircle.setAttribute("fill", "black")
                this.asteroidCircle.setAttribute("stroke", "white")
            }, 100);
            setTimeout( () => {
                this.asteroidCircle.setAttribute("fill", "grey")
                this.asteroidCircle.setAttribute("stroke", "white")
            }, 150);
            setTimeout( () => {
                this.asteroidCircle.setAttribute("fill", "black")
                this.asteroidCircle.setAttribute("stroke", "white")
                resolve()
            }, 200);
            }
        );
    }

    async move() {
        this.position.y += this.speed * this.direction.vertical;
        this.position.x += this.speed * this.direction.horizontal;
        this.asteroid.setAttribute("transform", `translate(${this.position.x}, ${this.position.y})`);
        
        const hit = () => {
            for (const bullet of bullets) {
                const coord = bullet.getRealCoord();
                const dx1 = coord[0].x - this.position.x;
                const dy1 = coord[0].y - this.position.y;
                const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

                const dx2 = coord[1].x - this.position.x;
                const dy2 = coord[1].y - this.position.y;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
                if (distance1 < this.radius || distance2 < this.radius) 
                    return bullet; // Collision detected

            }
            return null; 
        };
        const bulletHit = hit();

        const hitSpaceShip = () => {
            const points = spaceShip.getSpaceShipPoints();

            for(let point of points){
                const dx = point.x - this.position.x;
                const dy = point.y - this.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if(distance < this.radius)
                    return true;
            }

            return false;
        }
        const spaceShipHit = hitSpaceShip();

        if((this.position.y >= innerHeight + 600 || this.position.y < -600
            || this.position.x >= innerWidth + 600 || this.position.x < -600)
            && this.asteroid.parentNode === gameArea){
            asteroids.splice(asteroids.indexOf(this), 1);
            gameArea.removeChild(this.asteroid);
        }
        else if(spaceShipHit && spaceShip.spaceShip.parentNode === gameArea && spaceShip.active && !spaceShip.invulnerable){
            spaceShip.lifes--;
            gameArea.removeChild(lifes.pop());
            gameArea.removeChild(this.asteroid);
            combo = 1;

            if(!spaceShip.lifes){
                spaceShip.active = false;
                await spaceShip.damagedAnimation();
                await spaceShip.damagedAnimation();
                await spaceShip.damagedAnimation();
                gameArea.removeChild(spaceShip.spaceShip);
                stopSpawning();
                gameOver();
            }
            else{
                await spaceShip.damagedAnimation();
                await spaceShip.damagedAnimation();
                spaceShip.invulnerable = false;
            }
        }
        else if(bulletHit){

            gameArea.removeChild(bulletHit.bullet);
            bullets.splice(bullets.indexOf(bulletHit), 1);

            await this.destroyedAnimation();
            gameArea.removeChild(this.asteroid);

            if(this.level > 1){

                const spaced = Math.abs(this.direction.horizontal) === 1 ?
                 {x: 0, y: 1} : {x: 1, y: 0} 

                const asteroidTemp = new Asteroid(this.level - 1, 
                    { position: {x: this.position.x + this.radius * spaced.x * (0.4 + Math.random() * 0.4), 
                        y: this.position.y + this.radius * (0.4 + Math.random() * 0.3) * spaced.y },
                     direction: this.direction})
                asteroidTemp.move();
                const asteroidTemp2 = new Asteroid(this.level - 1, 
                    { position: {x: this.position.x + this.radius * (0.4 + Math.random() * 0.3) * spaced.x * -1,
                         y: this.position.y + this.radius * (0.4 + Math.random() * 0.3) * spaced.y * -1, },
                    direction: this.direction});
                asteroidTemp2.move();
            }

            switch(this.level){
                case 1:
                    score += 10 * combo;
                    break;
                case 2:
                    score += 20 * combo;
                    break;
                case 3: 
                    score += 30 * combo;
                    break;

                case 4: 
                    score += 40 * combo;
                    break;
            }

            if(Date.now() - timeCombo < 3000) combo += 0.1;
            else combo = 1;

            timeCombo = Date.now();

            asteroids.splice(asteroids.indexOf(this), 1);
        }
        else requestAnimationFrame(() => this.move());
    }
}

let spawningIntervals = [];
function spawnAsteroids(){
    
    spawningIntervals.push(setInterval(() => {
        const asteroid = new Asteroid(4, { position: undefined, direction: undefined});
        asteroids.push(asteroid);
        asteroid.move();
    }, 3000));
    
    spawningIntervals.push(setInterval(() => {
        const asteroid = new Asteroid(3, { position: undefined, direction: undefined});
        asteroids.push(asteroid);
        asteroid.move();
    }, 2000));
    
    spawningIntervals.push(setInterval(() => {
        const asteroid = new Asteroid(2, { position: undefined, direction: undefined});
        asteroids.push(asteroid);
        asteroid.move();
    }, 1500));
    
    spawningIntervals.push(setInterval(() => {
        const asteroid = new Asteroid(1, { position: undefined, direction: undefined});
        asteroids.push(asteroid);
        asteroid.move();
    }, 1000));
}

function stopSpawning() {
    spawningIntervals.forEach(interval => clearInterval(interval));
    spawningIntervals = [];
}

spawnAsteroids();

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