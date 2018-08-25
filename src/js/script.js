const debugOn = true;

function debug(stuff) {
    if (debugOn) console.log(stuff);
}

const goal = {
    download: {
        total: 2048,
        completed: 0
    },
    upload: {
        total: 1024,
        completed: 0
    }
};

const achievements = [
    { name: '1337 hax0r', description: 'Bruteforce a WiFi network' },
    { name: 'Step out into the sun', description: 'Leave the confines of your room' },
    { name: 'Clever guesser', description: 'Correctly guess a WiFi network\'s  password' },
    { name: 'Overcoming social anxiety', description: 'Ask for a WiFi password' },
    { name: 'Freeloader', description: 'Connect to a freemium WiFi' },
    { name: 'My own damn internet', description: 'Use mobile network' },
    { name: 'Puzzle solver', description: 'Solve a puzzle and attain a WiFi password' },
    { name: '$$$', description: 'Pay for WiFi' },
    { name: 'Broke', description: 'Run out of cash' },
];

const accessPoints = [
    { ssid: 'Verizon WiFi' },
    { ssid: 'McDonald\'s Wifi' },
    { ssid: 'Joe\'s iPhone' },
    { ssid: 'NETGEAR68' },
    { ssid: 'Who wants free WiFi' },
    { ssid: 'Free WiFi Initiative' },
    { ssid: 'Prada WiFi' },
    { ssid: 'AndroidAP' },
    { ssid: 'Linksys' },
    { ssid: 'PuzzleConf' },
    { ssid: '[binary stuff]' },
    { ssid: 'Hyatt' },
    { ssid: 'xfinitywifi' },
    { ssid: 'Muller home' },
].map(options => new AccessPoint(options));

let currentAP;
let currentPosition = new Point(0, 0);
let currentRoom;

let battery = 100;
let batteryExhaustionRate;
const rooms = new Map(null);
let angleOfRotation = 90;

let networkListOpen = false;
let isPaused = false;

const networkListDimensions = { width: 200, height: 600 };

window.onload = () => {
    kontra.init();

    const playerDimensions = { width: 75, height: 125 };

    let player = kontra.sprite({
        color: 'red',
        x: (kontra.canvas.width - playerDimensions.width) / 2,
        y: (kontra.canvas.height - playerDimensions.height) - 20,
        width: playerDimensions.width,
        height: playerDimensions.height
    });

    const loop = kontra.gameLoop({
        update: () => {
            player.update();
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
        debug('pause');
    });

    kontra.keys.bind('n', () => {
        debug('list networks');
        debug(getAccessPoints(currentPosition));
    });

    loop.start();
};

function getAccessPoints(point) {
    return accessPoints.filter((accessPoint) => {
        return accessPoint.isInRange(point);
    });
}
