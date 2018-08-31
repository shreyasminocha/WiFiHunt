const debugOn = true;

function debug(stuff) {
    if (debugOn) console.log(stuff);
}

// constants //

const fps = 50;
const movementKeys = ['left', 'right', 'up', 'a', 'd', 'w'];

// variables //

const remainingGoal = {
    // in MiB
    download: 2048,
    upload: 1024
};

let currentAP = null;
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
let isPaused = false;
let isHelpOpen = false;

// heart of the game //

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
        fps,
        update: () => {
            player.update();

            if (isNetworkListOpen) {
                batteryDropRate.current = batteryDropRate.active;
            } else {
                batteryDropRate.current = batteryDropRate.idle;
            }

            const dropPerFrame = batteryDropRate.current / fps;
            batteryLevel -= dropPerFrame;

            if (batteryLevel < 0) {
                gameOver(false);
                loop.stop();
            }

            if (currentAP !== null && !currentAP.isInRange(currentPosition)) {
                currentAP = null;
            }

            if (currentAP !== null) {
                remainingGoal.download -= (currentAP.speed.download / fps);
                remainingGoal.upload -= (currentAP.speed.upload / fps);
            }

            if (remainingGoal.download < 0) remainingGoal.download = 0;
            if (remainingGoal.upload < 0) remainingGoal.upload = 0;

            if (remainingGoal.download === 0 && remainingGoal.upload === 0) {
                gameOver(true);
                loop.stop();
            }
        },
        render: () => {
            player.render();
        }
    });

    bindMovementKeys();
    kontra.keys.bind('p', togglePause);
    kontra.keys.bind('n', toggleNetworkList);
    kontra.keys.bind('h', toggleHelp);

    loop.start();
}

window.onload = game;
window.onresize = game;

// navigation //

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

// toggle states //

function togglePause() {
    if (!isPaused) pause();
    else unPause();
}

function toggleNetworkList() {
    if (!isNetworkListOpen) showNetworkList();
    else hideNetworkList();
}

function toggleHelp() {
    if (!isHelpOpen) showHelp();
    else hideHelp();
}

function pause() {
    isPaused = true;
    kontra.keys.unbind([...movementKeys, 'n', 'h']);

    debug('this is the pause "dialog box"');
}

function unPause() {
    isPaused = false;

    debug('get rid of the pause "dialog box"');

    bindMovementKeys();
    kontra.keys.bind('n', toggleNetworkList);
    kontra.keys.bind('h', toggleHelp);
}

function showNetworkList() {
    isNetworkListOpen = true;
    kontra.keys.unbind([...movementKeys, 'p', 'h']);

    debug('available networks:');
    for (const accessPoint of getAccessPoints(currentPosition)) {
        debug(accessPoint.ssid);
    }

    let cursor = 0;

    kontra.keys.bind('down', () => {
        if (cursor < getAccessPoints(currentPosition).length - 1) cursor++;
    });

    kontra.keys.bind('up', () => {
        if (cursor > 0) cursor--;
    });

    kontra.keys.bind('enter', () => {
        const available = getAccessPoints(currentPosition);
        const selected = available[cursor];

        if (selected.password !== undefined) {
            const attempt = prompt(`Enter a ${selected.encryption} password:`);

            if (hash(attempt) !== selected.password) {
                cursor = 0;
                alert('You entered an incorrect password');

                return;
            }
        }

        currentAP = selected;

        debug(currentAP);

        hideNetworkList();
    });
}

function hideNetworkList() {
    isNetworkListOpen = false;
    kontra.keys.unbind(['down', 'up', 'enter']);

    debug('get rid of the network list');

    bindMovementKeys();
    kontra.keys.bind('p', togglePause);
    kontra.keys.bind('h', toggleHelp);
}

function showHelp() {
    isHelpOpen = true;
    kontra.keys.unbind([...movementKeys, 'n', 'p']);

    debug('WiFiHunt');
    debug('--------');
    debug('');
    debug('controls:');
    debug('↑ / w — move forward');
    debug('→ / d — turn right');
    debug('← / a — turn left');
    debug('h — show this help message');
    debug('n — show available networks');
    debug('p — pause');
}

function hideHelp() {
    isHelpOpen = false;
    bindMovementKeys();

    debug('get rid of the help "dialog box"');

    bindMovementKeys();
    kontra.keys.bind('n', toggleNetworkList);
    kontra.keys.bind('p', togglePause);
}

function gameOver(wasSuccessful) {
    if (!wasSuccessful) batteryLevel = 0;

    debug(`game up. you ${wasSuccessful ? 'won' : 'lost'}.`);
}

// utility //

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
