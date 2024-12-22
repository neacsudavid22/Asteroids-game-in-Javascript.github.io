const gameArea = document.getElementById("game-area");
gameArea.style.background = "black";
gameArea.setAttribute("width", window.innerWidth);
gameArea.setAttribute("height", window.innerHeight);

let gameMode = true;

let username = '';

function getScores(){
    let items = [];
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i); 
        const value = Number(window.localStorage.getItem(key)); 
        items.push({ key, value }); 
    }

    items.sort((a,b) => b.value - a.value);
    
    window.localStorage.clear();
    let limit = 0;
    for(let item of items){
        if(limit < 10){
            window.localStorage.setItem(item.key, item.value);
            limit++;
        }
        else break;
    }
    console.log(items);
    console.log(window.localStorage);

    return items;
}

function startGame() {
const lf_lost = document.querySelector('#lf_lost');

let bullets = [];
let asteroids = [];
const keys = {
    arrowUp: { pressed: false }, arrowDown: { pressed: false }, arrowLeft: { pressed: false }, arrowRight: { pressed: false },
    z: { pressed: false }, c: { pressed: false },
    x: { pressed: false }
};

let score = 0;
const scoreDisplay = document.createElementNS("http://www.w3.org/2000/svg", "text");
scoreDisplay.setAttribute("fill", "white");
scoreDisplay.setAttribute("font-size", 40);
scoreDisplay.setAttribute("font-family", "Anta");
scoreDisplay.setAttribute("x", window.innerWidth * 0.03);
scoreDisplay.setAttribute("y", window.innerHeight / 10);
gameArea.appendChild(scoreDisplay);

const scoreInterval = setInterval( () => scoreDisplay.textContent = `Score: ${score.toFixed().split(".")}`, 100 );

let timeCombo = Date.now();
let combo = 1;

const multiplier = document.createElementNS("http://www.w3.org/2000/svg", "text");
multiplier.setAttribute("fill", "red");
multiplier.setAttribute("font-size", 20);
multiplier.setAttribute("font-family", "Anta");
multiplier.setAttribute("x", window.innerWidth * 0.03);
multiplier.setAttribute("y", window.innerHeight / 10 + 40);
gameArea.appendChild(multiplier);

const multiplierInterval = setInterval( () => {
    if(Date.now() - timeCombo >= 3000) combo = 1;
    multiplier.textContent = `Multiplier: x${combo.toFixed(2)}`;
}, 100 );

function gameOver(){
    window.localStorage.setItem(username, Math.floor(score));

    clearInterval(runLevels);
    clearInterval(scoreInterval);
    clearInterval(multiplierInterval);
    const finalText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    finalText.setAttribute("fill", "white");
    finalText.setAttribute("font-size", 100);
    finalText.setAttribute("font-family", "Anta");
    finalText.setAttribute("x", window.innerWidth / 2);
    finalText.setAttribute("y", window.innerHeight * 0.40);
    finalText.setAttribute("text-anchor", "middle");
    finalText.setAttribute("alignment-baseline", "central");
    finalText.textContent = `GAME OVER!`;

    const finalScore = document.createElementNS("http://www.w3.org/2000/svg", "text");
    finalScore.setAttribute("fill", "white");
    finalScore.setAttribute("font-size", 40);
    finalScore.setAttribute("font-family", "Anta");
    finalScore.setAttribute("x", window.innerWidth / 2);
    finalScore.setAttribute("y", window.innerHeight * 0.53);
    finalScore.setAttribute("text-anchor", "middle");
    finalScore.setAttribute("alignment-baseline", "central"); 
    finalScore.textContent = `${username} Your Score Was ${Math.floor(score)}`;

    gameArea.appendChild(finalText);
    gameArea.appendChild(finalScore);

    const pressEnter = document.createElementNS("http://www.w3.org/2000/svg", "text");
    pressEnter.setAttribute("fill", "white");
    pressEnter.setAttribute("font-size", 50);
    pressEnter.setAttribute("font-family", "Anta");
    pressEnter.setAttribute("x", window.innerWidth / 2);
    pressEnter.setAttribute("y", window.innerHeight * 0.63);
    pressEnter.setAttribute("text-anchor", "middle");
    pressEnter.setAttribute("alignment-baseline", "central"); 
    pressEnter.textContent = "press enter to try again";

    setTimeout( () => {
        let a = 1;
        gameArea.appendChild(pressEnter);
        setInterval( 
            () => {
                a = 1 - a;
                pressEnter.setAttribute("y", window.innerHeight * (0.63 + a / 100));
            }, 400
        );
    }, 3000);

    document.addEventListener("keydown", (event) => {
        switch(event.code){
            case "Enter":
            location.reload();
            break;
        }
    });
}

const lifes = [];

function drawHeart(i) {
    const heartAudio = document.createElement('audio');
    heartAudio.src = 'media/new-level-142995.mp3';
    heartAudio.play();
    const heart = document.createElementNS("http://www.w3.org/2000/svg", "text");
    heart.setAttribute("x", window.innerWidth * 0.02 + 40 * i);
    heart.setAttribute("y", window.innerHeight - 35);
    heart.setAttribute("font-size", 35);

    heart.textContent = "💛";
    lifes.push(heart);
    gameArea.appendChild(lifes[i]);
}

for(let i = 0; i < 3; i++) drawHeart(i);

class Bullet{
    constructor({spaceShipPosition, spaceShipAngle}) {
        const shoot_e = document.createElement('audio');
        shoot_e.src = 'media/retro-laser-1-236669.mp3';
        shoot_e.play();

        this.bullet = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.bullet.setAttribute("stroke", "lime");
        this.bullet.setAttribute("stroke-width", 4);

        this.angle = spaceShipAngle;
            
        this.position = {
            x1: spaceShipPosition.x,
            y1: spaceShipPosition.y,
            x2: spaceShipPosition.x, 
            y2: spaceShipPosition.y + 21
        };


        this.bullet.setAttribute('x1', this.position.x1);
        this.bullet.setAttribute('y1', this.position.y1);
        this.bullet.setAttribute('x2', this.position.x2);
        this.bullet.setAttribute('y2', this.position.y2);

        this.bullet.setAttribute("transform", `rotate(${this.angle},${this.position.x2}, ${this.position.y2})`);

        bullets.push(this);
        gameArea.appendChild(this.bullet);

        this.move();
    }

    getRealCoord(){
        const bcr = this.bullet.getBoundingClientRect();
        const realPosition = { x1: bcr.left, y1: bcr.top,  x2: bcr.right, y2: bcr.bottom };
        return realPosition;
    }

    move(){

        this.position.y1 -= 4;
        this.position.y2 -= 4;

        this.bullet.setAttribute('y1', this.position.y1);
        this.bullet.setAttribute('y2', this.position.y2);

        const realPosition = this.getRealCoord();

        if ((realPosition.y1 < -100 || realPosition.y1  > window.innerHeight + 100 
            || realPosition.x1 < -100 || realPosition.x1 > window.innerWidth + 100 )
            && this.bullet.parentNode === gameArea) {
            gameArea.removeChild(this.bullet);
            bullets.splice(bullets.indexOf(this), 1); 
            spaceShip.bulletCount.textContent = `${3 - bullets.length}`;
        } else {
            requestAnimationFrame(() => this.move());
        }
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
        this.color = { stroke: color.stroke, fill: color.fill }
        this.spaceShip = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.initialize();
    }

    initialize() {
        this.spaceShipBody = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.spaceShipBody.setAttribute("points", "0,-15 -20,40 20,40");
        //tip(0,-15); left(-20,40); right(20,40)
        this.spaceShipBody.setAttribute("fill", this.color.fill);
        this.spaceShipBody.setAttribute("stroke", this.color.stroke);
        this.spaceShipBody.setAttribute("stroke-width", "5");

        this.fire = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.fire.setAttribute("points", "-10,44 10,44 2,58");
        this.fire.setAttribute("fill", "yellow");
        this.fire.setAttribute("stroke", "red");
        this.fire.setAttribute("stroke-width", "3");

        this.rocketWindow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.rocketWindow.setAttribute("r", "10");
        this.rocketWindow.setAttribute("fill", "cyan");
        this.rocketWindow.setAttribute("cx", "0");
        this.rocketWindow.setAttribute("cy", "26");

        this.bulletCount = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.bulletCount.setAttribute("fill", "grey");
        this.bulletCount.setAttribute("font-size", `${this.level * 10}`);
        this.bulletCount.setAttribute("font-family", "Anta");
        this.bulletCount.setAttribute("x", -5);
        this.bulletCount.setAttribute("y", 32);
        this.bulletCount.textContent = `${3 - bullets.length}`;

        this.gun = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.gun.setAttribute("r", "4");
        this.gun.setAttribute("fill", "grey");
        this.gun.setAttribute("cx", "0");
        this.gun.setAttribute("cy", "15");

        this.spaceShip.appendChild(this.spaceShipBody);
        this.spaceShip.appendChild(this.fire);
        this.spaceShip.appendChild(this.gun);
        this.spaceShip.appendChild(this.rocketWindow);
        this.spaceShip.appendChild(this.bulletCount);

        gameArea.appendChild(this.spaceShip);
 
        this.move();
        this.engineAnimation();
        this.newLife(gameMode ? 1000 : 5000);
    }

    damagedAnimation(){
        return new Promise((resolve) => {
            spaceShip.invulnerable = true;
            lf_lost.play();
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

    newLife(checkScore){
        setInterval(() => {
            if(score > checkScore){
                checkScore += gameMode ? 1000 : 5000;
                drawHeart(this.lifes);
                this.lifes+=1;
            }
        }, 500);
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
            this.bulletCount.textContent = `${3 - bullets.length}`;
        }
    }

    move() {
        if(this.active){
            this.position.x += this.movement.x;
            this.position.y += this.movement.y;
            this.spaceShip.setAttribute("transform", 
                `translate(${this.position.x}, ${this.position.y}) rotate(${this.angle}, 0, 20)`);
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
        //0,-15 -20,40 20,40
        if (!this.spaceShipBody.ownerSVGElement) 
            return [];

        const ctm = this.spaceShipBody.getScreenCTM();
        const tip = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        tip.x = 0; 
        tip.y = -15;
        const tipFinal = tip.matrixTransform(ctm);

        const left = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        left.x = -20;
        left.y = 40;
        const leftFinal = left.matrixTransform(ctm);

        const right = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        right.x = 20;
        right.y = 40;
        const rightFinal = right.matrixTransform(ctm);

        return [tipFinal, leftFinal, rightFinal];
    }
}

const spaceShip = new SpaceShip({
    position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    movement: { x: 0, y: 0 },
    color: { fill: "white", stroke: "orange" }
});

function updatePosition() {
    keys.arrowUp.pressed ? spaceShip.movement.y = -4 : keys.arrowDown.pressed ? spaceShip.movement.y = 4 : spaceShip.movement.y = 0;
    keys.arrowLeft.pressed ? spaceShip.movement.x = -4 : keys.arrowRight.pressed ? spaceShip.movement.x = 4 : spaceShip.movement.x = 0;
    keys.z.pressed ? spaceShip.angle -= 4.5 : keys.c.pressed ? spaceShip.angle += 4.5 : spaceShip.angle += 0;
    spaceShip.move();
    requestAnimationFrame(updatePosition);
}

updatePosition();

class Asteroid {    
    constructor(level, {position, direction} = {}, scoreLevel = 1) {
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
    
        const colors = ['gray','orange','red','darkred'];
        this.level = level;
        this.scoreLevel = scoreLevel;
        this.color = colors[level-1];
        this.speed = 5.5 - level + Math.random();
        this.radius = this.level * 20 + 5;

        this.drawAsteroidCircle();
    }

    drawAsteroidCircle() {

        this.asteroidCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.asteroidCircle.setAttribute("cx", 0);
        this.asteroidCircle.setAttribute("cy", 0);
        this.asteroidCircle.setAttribute("r", this.radius);
        this.scoreLevel === 1 ? this.asteroidCircle.setAttribute("stroke", "white") : this.asteroidCircle.setAttribute("stroke", "yellow");
        this.asteroidCircle.setAttribute("fill", `${this.color}`);
        this.asteroidCircle.setAttribute("stroke-width", "2");

        this.text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.text.setAttribute("fill", "white");
        this.text.setAttribute("font-size", `${this.level * 18}`);
        this.text.setAttribute("font-family", "Anta");
        this.text.setAttribute("text-anchor", "middle");
        this.text.setAttribute("alignment-baseline", "central");
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
            }, 50);
            setTimeout( () => {
                this.asteroidCircle.setAttribute("fill", "black")
            }, 100);
            setTimeout( () => {
                this.asteroidCircle.setAttribute("fill", "grey")
            }, 150);
            setTimeout( () => {
                this.asteroidCircle.setAttribute("fill", "black")
                if(gameMode)this.asteroidCircle.setAttribute("fill", `${this.color}`);
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
                const dx1 = coord.x1 - this.position.x;
                const dy1 = coord.y1 - this.position.y;
                const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

                const dx2 = coord.x2 - this.position.x;
                const dy2 = coord.y2 - this.position.y;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
                if (distance1 < this.radius || distance2 < this.radius) 
                    return bullet; 
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

        if((this.position.y >= innerHeight + 300 || this.position.y < -300
            || this.position.x >= innerWidth + 300 || this.position.x < -300)
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
        else if(bulletHit && gameMode){

            gameArea.removeChild(bulletHit.bullet);
            bullets.splice(bullets.indexOf(bulletHit), 1);
            spaceShip.bulletCount.textContent = `${3 - bullets.length}`;

            if(this.level > 1){
                gameArea.removeChild(this.asteroid);
                const asteroidNew = new Asteroid(
                    this.level - 1, 
                    { 
                        position: { x: this.position.x, y: this.position.y },
                        direction: this.direction 
                    },
                    this.scoreLevel + 1
                );
                asteroidNew.move();
                asteroidNew.destroyedAnimation();     
            }
            else {
                await this.destroyedAnimation();    
                gameArea.removeChild(this.asteroid); 
                switch(this.scoreLevel){
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
        }
        else if(bulletHit && !gameMode){

            gameArea.removeChild(bulletHit.bullet);
            bullets.splice(bullets.indexOf(bulletHit), 1);
            spaceShip.bulletCount.textContent = `${3 - bullets.length}`;

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
const levelSpec = [ 
    [2, 3, 4, 5], // level 1
    [2, 2.5, 3, 5], // level 2
    [1.5, 2, 3 , 4], // level 3
    [1.5, 2, 2.5 , 4], // level 4
    [1.5, 2, 2 , 4], // level 5
    [1, 1.5, 2 , 3], // level 6
    [1, 1.5, 2 , 3], // level 7
    [1, 1, 1.5 , 3], // level 8
    [0.5, 1, 1 , 2.5], // level 9
    [0.5, 0.5, 1 , 2], // level 10
];

const messages = [
    'Begin!', 'Nice! Keep going', 'Good.. Dont Give Up!', 'Resist! Resist!',
    'Impressive!','Meteor Rain','No more luck',
    'Survive..', '???', 'Eternal Rain'
];
let level = 0;

function spawnAsteroids(level){

    const levelDisplay = document.createElementNS("http://www.w3.org/2000/svg", "text");
    level === 10 ? levelDisplay.setAttribute("fill", "red") : levelDisplay.setAttribute("fill", "white");
    levelDisplay.setAttribute("font-size", 40);
    levelDisplay.setAttribute("font-family", "Anta");
    levelDisplay.setAttribute("x", window.innerWidth * 0.5);
    levelDisplay.setAttribute("y", window.innerHeight * 0.5);
    levelDisplay.setAttribute("text-anchor", "middle");
    levelDisplay.setAttribute("baseline-direction", "central");
    levelDisplay.setAttribute("text-decoration", "underline");
    levelDisplay.setAttribute("transform-origin", "center");
    levelDisplay.textContent = `Level ${level + 1} - ${messages[level]}`;

    gameArea.appendChild(levelDisplay);
    setTimeout(() => {gameArea.removeChild(levelDisplay)}, 2500);
    stopSpawning();
    for(let i = 0; i < 4; i++){
        spawningIntervals.push(setInterval(() => {
            const asteroid = new Asteroid(i + 1);
            asteroids.push(asteroid);
            asteroid.move();
        }, levelSpec[level][i] * 1000));
    }
}

function stopSpawning() {
    spawningIntervals.forEach(interval => clearInterval(interval));
    spawningIntervals = [];
}

spawnAsteroids(level++);
const runLevels = setInterval(() => { score += 100; spawnAsteroids(level++); }, 30000);

document.addEventListener('keydown', (event)=>{
    switch(event.code){
        case "ArrowUp":
            keys.arrowUp.pressed = true;
            break;
        case "ArrowDown":
            keys.arrowDown.pressed = true;
            break;
        case "ArrowLeft":
            keys.arrowLeft.pressed = true;
            break;
        case "ArrowRight":
            keys.arrowRight.pressed = true;
            break;
        case "KeyZ":
            keys.z.pressed = true;
            break;
        case "KeyC":
            keys.c.pressed = true;
            break;
        case "KeyX":
            keys.x.pressed = true;
            spaceShip.shootBullet();
            break;
    }
});

document.addEventListener('keyup', (event)=>{
    switch(event.code){
        case "ArrowUp":
            keys.arrowUp.pressed = false;
            break;
        case "ArrowDown":
            keys.arrowDown.pressed = false;
            break;
        case "ArrowLeft":
            keys.arrowLeft.pressed = false;
            break;
        case "ArrowRight":
            keys.arrowRight.pressed = false;
            break;
        case "KeyZ":
            keys.z.pressed = false;
            break;
        case "KeyC":
            keys.c.pressed = false;
            break;
        case "KeyX":
            keys.x.pressed = false;
            break;
    }
});

}

function menu(){
    console.log(window.localStorage);

    const modeOptions = ["modern", "classic"];
    const mode = document.createElementNS("http://www.w3.org/2000/svg", "text");
    mode.setAttribute("id", "pointer");
    mode.setAttribute("fill", "white");
    mode.setAttribute("font-size", 40);
    mode.setAttribute("font-family", "Anta");
    mode.setAttribute("x", window.innerWidth * 0.5);
    mode.setAttribute("y", window.innerHeight * 0.6);
    mode.setAttribute("text-anchor", "middle");
    mode.setAttribute("baseline-direction", "central");
    mode.setAttribute("transform-origin", "center");

    mode.textContent = `Game Mode: ${modeOptions[Number(gameMode)]}`;
    gameArea.appendChild(mode);

    mode.addEventListener('click', () => {
        gameMode = !gameMode;
        mode.textContent = `Game Mode: ${modeOptions[Number(gameMode)]}`;
    })

    const leaderBoard = document.createElementNS("http://www.w3.org/2000/svg", "g");

    let items = getScores();
    const scoreTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
    scoreTitle.setAttribute("fill", "white");
    scoreTitle.setAttribute("font-size", 20);
    scoreTitle.setAttribute("font-family", "Anta");
    scoreTitle.setAttribute("x", window.innerWidth * 0.02);
    scoreTitle.setAttribute("y", window.innerHeight * 0.07);
    scoreTitle.setAttribute("text-anchor", "begining");
    scoreTitle.setAttribute("baseline-direction", "left");
    scoreTitle.setAttribute("text-decoration", "underline");
    scoreTitle.textContent = "Leaderboard";
    
    leaderBoard.appendChild(scoreTitle);

    let pos = 1;
    let limit = 0;
    for(let item of items){
        const itemText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        itemText.setAttribute("fill", "white");
        itemText.setAttribute("font-size", 16);
        itemText.setAttribute("font-family", "Anta");
        itemText.setAttribute("x", window.innerWidth * 0.02);
        itemText.setAttribute("y", window.innerHeight * (0.08 + 0.04 * pos));
        itemText.setAttribute("text-anchor", "begining");
        itemText.setAttribute("baseline-direction", "left");
        itemText.textContent = `${pos}. ${item.key} on ${modeOptions[Number(gameMode)].toUpperCase()} - ${item.value}`;
        pos++;
        leaderBoard.appendChild(itemText);

        limit++;
        if(limit === 5) break;
    }
    gameArea.appendChild(leaderBoard);

    const intructions = document.createElementNS("http://www.w3.org/2000/svg", "text");

    intructions.setAttribute("fill", "white");
    intructions.setAttribute("font-size", 20);
    intructions.setAttribute("font-family", "Anta");
    intructions.setAttribute("x", window.innerWidth * 0.5);
    intructions.setAttribute("y", window.innerHeight * 0.95);
    intructions.setAttribute("text-anchor", "middle");
    intructions.setAttribute("baseline-direction", "central");
    intructions.textContent = "arrows - move,  z - rotation left,  c - rotation right,  x - fire  (max 3 bullets on screen), new life on each 1000 points";
    gameArea.appendChild(intructions);
    
    const start = document.createElementNS("http://www.w3.org/2000/svg", "text");
    start.setAttribute("id", "pointer");
    start.setAttribute("fill", "white");
    start.setAttribute("font-size", 60);
    start.setAttribute("font-family", "Anta");
    start.setAttribute("x", window.innerWidth * 0.5);
    start.setAttribute("y", window.innerHeight * 0.4);
    start.setAttribute("text-anchor", "middle");
    start.setAttribute("baseline-direction", "central");
    start.setAttribute("transform-origin", "center");

    start.textContent = "Start";
    gameArea.appendChild(start);

    const enterYourName = document.createElementNS("http://www.w3.org/2000/svg", "text");
    enterYourName.setAttribute("id", "pointer");
    enterYourName.setAttribute("fill", "white");
    enterYourName.setAttribute("font-size", 40);
    enterYourName.setAttribute("font-family", "Anta");
    enterYourName.setAttribute("x", window.innerWidth * 0.5);
    enterYourName.setAttribute("y", window.innerHeight * 0.5);
    enterYourName.setAttribute("text-anchor", "middle");
    enterYourName.setAttribute("baseline-direction", "central");
    enterYourName.setAttribute("text-decoration", "underline");
    enterYourName.setAttribute("transform-origin", "center");

    enterYourName.textContent = "Enter Your Name";
    gameArea.appendChild(enterYourName);

    let pulseScale = 0.05;
    const pulse = setInterval( () => { enterYourName.setAttribute("transform", `scale(${1 + pulseScale})`); pulseScale = 0.05 - pulseScale; }, 500 );
    let name = '';

    async function nameTooShort(){
        return new Promise( (resolve) => {
            setTimeout( () => enterYourName.textContent = 'Name too short', 100); 
            setTimeout( () => enterYourName.setAttribute("x", window.innerWidth * 0.50 - 10) , 180); 
            setTimeout( () => enterYourName.setAttribute("x", window.innerWidth * 0.50 + 10) , 240); 
            setTimeout( () => { enterYourName.setAttribute("x", window.innerWidth * 0.50); name=''; resolve(); } , 320); 
        });
    }

    async function nameAlreadyUsed(){
        return new Promise( (resolve) => {
            setTimeout( () => enterYourName.textContent = 'Name Already Used', 100); 
            setTimeout( () => enterYourName.setAttribute("x", window.innerWidth * 0.50 - 10) , 180); 
            setTimeout( () => enterYourName.setAttribute("x", window.innerWidth * 0.50 + 10) , 240); 
            setTimeout( () => { enterYourName.setAttribute("x", window.innerWidth * 0.50); name=''; resolve(); } , 320); 
        });
    }

    async function pressedStart(){
        return new Promise( (resolve) => {
                setTimeout( () => {
                    start.setAttribute("transform", `scale(0.99)`);
                    start.setAttribute("y", window.innerHeight * 0.4 + 2);
                }, 150);
                setTimeout( () => {
                    start.setAttribute("transform", `scale(1.0)`);
                    start.setAttribute("y", window.innerHeight * 0.4);
                }, 300);
                setTimeout(resolve, 700);
            }
        );
    }

    async function accepted(){
        return new Promise( () => {
            clearInterval(pulse); 
            if(start.parentNode === gameArea) gameArea.removeChild(start); 
            if(enterYourName.parentNode === gameArea) gameArea.removeChild(enterYourName);
            if(leaderBoard.parentNode === gameArea) gameArea.removeChild(leaderBoard); 
            if(intructions.parentNode === gameArea) gameArea.removeChild(intructions); 
            if(mode.parentNode === gameArea) gameArea.removeChild(mode); 

            username = name.slice(0, name.length - 1);
            setTimeout(() => startGame(), 1500);
        });
    }

    start.addEventListener("click", async () => { 
        await pressedStart();
        if (window.localStorage.getItem(name.slice(0, name.length - 1))) await nameAlreadyUsed();
        else if(name.length < 4) await nameTooShort();
        else await accepted();
    });

    let enter = false;
    document.addEventListener("keydown", async (event) => {
        if(!enter){
            const bg_music = document.querySelector('#bg_music');
            bg_music.play();
            if(event.key === 'Enter') {
                enter = true;
                await pressedStart();
                if (window.localStorage.getItem(name.slice(0, name.length - 1))) await nameAlreadyUsed();
                else if(name.length < 4) await nameTooShort();
                else await accepted();
            }
        }
    });
    
    let listening = false;
    enterYourName.addEventListener("click", () => {
        name = "|";
        enterYourName.textContent = name;
        if (!listening) { 
            listening = true;
            document.addEventListener("keydown", (event) => {
                if(event.key === 'Backspace'){
                    name = name.slice(0,-2) + "|";
                }
                else if( /^[a-zA-Z0-9]$/.test(event.key) && name.length < 15){
                    name = name.slice(0,-1) + event.key.toUpperCase() + "|";
                }
                enterYourName.textContent = `${name}`;
            })
        }
    });
}

document.addEventListener("DOMContentLoaded", menu);