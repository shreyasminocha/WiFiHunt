const debugOn = true;

function debug(stuff) {
    if (debugOn) console.log(stuff);
}

const goal = {
    download: { total: 2048, completed: 0 },
    upload: { total: 1024, completed: 0 }
};

let currentAP;
let currentPosition = new Point(0, 0);

let batteryLevel = 100;

// battery level drop per second
let batteryDropRate = {
    active: 0.3,
    idle: 0.1,
};

batteryDropRate.current = batteryDropRate.idle;

let angleOfRotation = 90; // in degrees

let isNetworkListOpen = false;
let isGamePlayPaused = false;
let isPaused = false;
let isOver = false;

window.onload = () => {
    kontra.init();

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

    kontra.keys.bind(['up', 'w'], () => {
        debug(toRadians(angleOfRotation));

        const [xComponent, yComponent] = polarToCartesian(angleOfRotation, 1);

        currentPosition.x += xComponent;
        currentPosition.y += yComponent;

        debug(`(${currentPosition.x}, ${currentPosition.y})`);
    });

    kontra.keys.bind(['left', 'a'], () => {
        angleOfRotation += 1;

        if (angleOfRotation >= 360) {
            angleOfRotation = 0;
        }

        debug(angleOfRotation);
    });

    kontra.keys.bind(['right', 'd'], () => {
        angleOfRotation -= 1;

        if (angleOfRotation < 0) {
            angleOfRotation = 359;
        }

        debug(angleOfRotation);
    });

    kontra.keys.bind('p', () => {
        isPaused = !isPaused;
        isGamePlayPaused = !isGamePlayPaused;

        if (isPaused) {
            debug('this is the pause "dialog box"');
        } else {
            debug('get rid of the pause "dialog box"');
        }
    });

    kontra.keys.bind('n', () => {
        isPaused = !isPaused;

        if (isNetworkListOpen) {
            debug('get rid of the network list');
            isNetworkListOpen = false;
            return;
        }

        debug('available networks:');

        for (const accessPoint of getAccessPoints(currentPosition)) {
            debug(accessPoint.ssid);
        }

        isNetworkListOpen = true;
    });

    loop.start();
};

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
}
