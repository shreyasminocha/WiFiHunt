const debugOn = true;

function debug(stuff) {
    if (debugOn) console.log(stuff);
}

const goal = {
    download: { total: 2048, completed: 0 },
    upload: { total: 1024, completed: 0 }
};

let currentAP;
const currentPosition = new Point(0, 0);

let batteryLevel = 100;

// battery level drop per second
const batteryDropRate = {
    active: 0.3,
    idle: 0.1,
};

batteryDropRate.current = batteryDropRate.idle;

let angleOfRotation = 90; // in degrees

let isNetworkListOpen = false;
let isGamePlayPaused = false;
let isPaused = false;
let isOver = false;

const movementKeys = ['left', 'right', 'up', 'a', 'd', 'w'];

function game() {
    kontra.init();

    kontra.canvas.width = window.innerWidth - 15;
    kontra.canvas.height = window.innerHeight;

    const sprite = new Image();
    sprite.src = 'images/player.png';

    const playerDimensions = { width: 76, height: 126 };

    const player = kontra.sprite({
        x: (kontra.canvas.width - playerDimensions.width) / 2,
        y: (kontra.canvas.height - playerDimensions.height) - 20,
        image: sprite
    });

    const loop = kontra.gameLoop({
        update: () => {
            player.update();

            if (isNetworkListOpen) {
                batteryDropRate.current = batteryDropRate.active;
            } else {
                batteryDropRate.current = batteryDropRate.idle;
            }

            if (!isOver) {
                const dropPerFrame = batteryDropRate.current / 50;
                batteryLevel -= dropPerFrame;
            }

            if (batteryLevel < 0 && !isOver) {
                gameOver();
            }
        },
        render: () => {
            player.render();
        }
    });

    bindMovementKeys();
    kontra.keys.bind('p', togglePause);
    kontra.keys.bind('n', toggleNetworkList);

    loop.start();
}

window.onload = game;
window.onresize = game;

function moveForward() {
    debug(toRadians(angleOfRotation));

    const [xComponent, yComponent] = polarToCartesian(angleOfRotation, 1);

    currentPosition.x += xComponent;
    currentPosition.y += yComponent;

    debug(`(${currentPosition.x}, ${currentPosition.y})`);
}

function turnLeft() {
    angleOfRotation += 1;

    if (angleOfRotation >= 360) {
        angleOfRotation = 0;
    }

    debug(angleOfRotation);
}

function turnRight() {
    angleOfRotation -= 1;

    if (angleOfRotation < 0) {
        angleOfRotation = 359;
    }

    debug(angleOfRotation);
}

function togglePause() {
    isPaused = !isPaused;
    isGamePlayPaused = !isGamePlayPaused;

    if (isPaused) {
        kontra.keys.unbind([...movementKeys, 'n']);
        debug('this is the pause "dialog box"');
    } else {
        debug('get rid of the pause "dialog box"');
        bindMovementKeys();
        kontra.keys.bind('n', toggleNetworkList);
    }
}

function toggleNetworkList() {
    function hideNetworkList() {
        isNetworkListOpen = false;
        kontra.keys.unbind(['j', 'k', 'enter', 'esc']);
        debug('get rid of the network list');

        kontra.keys.bind('p', togglePause);
    }

    if (isNetworkListOpen) {
        hideNetworkList();
        return;
    }

    kontra.keys.unbind(['left', 'right', 'up', 'a', 'd', 'w', 'p']);

    debug('available networks:');

    for (const accessPoint of getAccessPoints(currentPosition)) {
        debug(accessPoint.ssid);
    }

    isNetworkListOpen = true;
    let cursor = 0;

    kontra.keys.bind('j', () => {
        if (cursor < getAccessPoints(currentPosition).length - 1) cursor++;
    });

    kontra.keys.bind('k', () => {
        if (cursor > 0) cursor--;
    });

    kontra.keys.bind('enter', () => {
        const available = getAccessPoints(currentPosition);
        currentAP = available[cursor];
        debug(currentAP);
        hideNetworkList();
    });

    kontra.keys.bind('esc', () => {
        hideNetworkList();
    });
}

function bindMovementKeys() {
    kontra.keys.bind(['up', 'w'], moveForward);
    kontra.keys.bind(['left', 'a'], turnLeft);
    kontra.keys.bind(['right', 'd'], turnRight);
}

function getAccessPoints(point) {
    return accessPoints.filter((accessPoint) => {
        return accessPoint.isInRange(point);
    });
}

function gameOver() {
    isGamePlayPaused = true;
    isOver = true;
    batteryLevel = 0;
    debug('game up!');
    kontra.gameLoop.stop();
}
