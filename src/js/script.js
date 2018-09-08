const debugOn = true;

function debug(stuff) {
    if (debugOn) console.log(stuff);
}

// constants //

const fps = 50;
const movementKeys = ['left', 'right', 'up', 'a', 'd', 'w'];

let currentAP = null;
const currentPosition = new Point(0, 0);

let angleOfRotation = 90; // in degrees

let isNetworkListOpen = false;
let isPaused = false;
let isHelpOpen = false;

window.onload = () => {
    kontra.init();

    const loop = kontra.gameLoop({
        fps,
        update() {
            player.update();
            battery.update();
            networkIndicator.update();
            remainingGoal.update();

            if (currentAP !== null && !currentAP.isInRange(currentPosition)) {
                currentAP = null;
            }
        },
        render() {
            player.render();
            battery.render();
            networkIndicator.render();
            money.render();
            remainingGoal.render();
            speedIndicator.render();

            // pause dialog box
            if (isPaused) {
                drawDialogBox({ width: 355, height: 140 }, (position) => {
                    kontra.context.fillText(
                        'GAME PAUSED.',
                        position.x + 15,
                        position.y + 55
                    );

                    kontra.context.fillText(
                        'Press \'P\' to unpause.',
                        position.x + 15,
                        position.y + 100
                    );
                });
            }

            // list of available networks
            if (isNetworkListOpen) {
                const availableAPs = getAccessPoints(currentPosition);

                drawDialogBox({
                    width: 355,
                    // `82 + ` makes up for the padding and heading
                    // `25` is the sum of font size and padding for each entry
                    height: 82 + (availableAPs.length * 25)
                }, (position) => {
                    kontra.context.fillText(
                        'Available Networks:',
                        position.x + 25, // `25` is the left padding
                        position.y + 44 // `40` is the top padding
                    );

                    let yCoordinate = 75;
                    for (const accessPoint of availableAPs) {
                        kontra.context.fillText(
                            accessPoint.ssid,
                            position.x + 25, // `25` is the left padding
                            position.y + yCoordinate
                        );

                        yCoordinate += 25;
                    }
                });
            }
        }
    });

    function game() {
        kontra.canvas.width = window.innerWidth - 15;
        kontra.canvas.height = window.innerHeight;

        bindMovementKeys();
        kontra.keys.bind('p', togglePause);
        kontra.keys.bind('n', toggleNetworkList);
        kontra.keys.bind('h', toggleHelp);

        loop.start();
    }

    game();

    const player = kontra.sprite({
        render() {
            const sprite = new Image();
            sprite.src = 'images/player.png';

            kontra.context.drawImage(
                sprite,
                (kontra.canvas.width - sprite.width) / 2,
                (kontra.canvas.height - sprite.height) - 20
            );
        }
    });

    const battery = kontra.sprite({
        level: 100,

        // battery level drop per second
        dropRate: {
            active: 0.3,
            idle: 0.1,
        },

        update() {
            if (isNetworkListOpen) {
                battery.dropRate.current = battery.dropRate.active;
            } else {
                battery.dropRate.current = battery.dropRate.idle;
            }

            if (!isPaused) {
                const dropPerFrame = battery.dropRate.current / fps;
                battery.level -= dropPerFrame;
            }

            if (battery.level < 0) {
                battery.level = 0;
                gameOver(false);
                loop.stop();
            }
        },

        render() {
            const red = [139, 0, 0];
            const green = [34, 228, 71];

            const dimensions = { width: 30, height: 19 };
            const position = { x: 25, y: 25 };

            kontra.context.strokeStyle = 'gray';
            kontra.context.strokeRect(
                position.x, position.y,
                dimensions.width, dimensions.height
            );

            const capDimensions = { width: 3, height: 8 };
            const capPosition = {
                x: position.x + dimensions.width,
                y: position.y + (((dimensions.height - capDimensions.height) / 2))
            };

            kontra.context.fillStyle = 'gray';
            kontra.context.fillRect(
                capPosition.x, capPosition.y,
                capDimensions.width, capDimensions.height
            );

            const indicatorColour = colorInGradient(red, green, battery.level / 100);
            kontra.context.fillStyle = `rgb(${indicatorColour.join(', ')})`;
            kontra.context.fillRect(
                position.x, position.y,
                dimensions.width * (battery.level / 100), dimensions.height
            );

            kontra.context.fillStyle = 'black';
            kontra.context.font = `${dimensions.height}px monospace`;
            kontra.context.fillText(
                `${Math.ceil(battery.level)}%`,
                position.x + dimensions.width + 15,
                position.y + dimensions.height
            );
        }
    });

    const networkIndicator = kontra.sprite({
        render() {
            if (currentAP !== null) {
                kontra.context.strokeStyle = 'black';
                kontra.context.fillStyle = 'black';
            } else {
                kontra.context.strokeStyle = 'gray';
                kontra.context.fillStyle = 'gray';
            }

            const centre = { x: 40, y: 90 };

            const startAngle = toRadians(-50);
            const endAngle = toRadians(-130);

            for (let r = 10; r <= 20; r += 5) {
                kontra.context.beginPath();
                kontra.context.arc(centre.x, centre.y, r, startAngle, endAngle, true);
                kontra.context.stroke();
            }

            kontra.context.beginPath();
            kontra.context.arc(centre.x, centre.y, 5, startAngle, endAngle, true);
            kontra.context.lineTo(centre.x, centre.y);
            kontra.context.fill();

            if (currentAP !== null) {
                kontra.context.font = '19px monospace';
                kontra.context.fillText(
                    currentAP.ssid,
                    25 + 45,
                    centre.y
                );
            }
        }
    });

    const money = kontra.sprite({
        remaining: 500,
        render() {
            const position = { x: 25, y: 130 };

            kontra.context.fillStyle = 'hsl(50, 90%, 40%)';
            kontra.context.font = '19px monospace';

            kontra.context.fillText(
                '💰',
                position.x,
                position.y
            );

            kontra.context.fillStyle = 'black';
            kontra.context.fillText(
                money.remaining,
                position.x + 45,
                position.y
            );
        }
    });

    const remainingGoal = kontra.sprite({
        // in MiB
        download: 2048,
        upload: 1024,

        update() {
            if (currentAP !== null) {
                remainingGoal.download -= currentAP.speedAt(currentPosition, 'download') / fps;
                remainingGoal.upload -= currentAP.speedAt(currentPosition, 'upload') / fps;
            }

            if (remainingGoal.download < 0) remainingGoal.download = 0;
            if (remainingGoal.upload < 0) remainingGoal.upload = 0;

            if (remainingGoal.download === 0 && remainingGoal.upload === 0) {
                gameOver(true);
                loop.stop();
            }
        },

        render() {
            kontra.context.fillStyle = 'black';
            kontra.context.font = '19px monospace';

            kontra.context.fillText(
                `↓ Goal: ${Math.ceil(remainingGoal.download)} MiB`,
                25, 190
            );

            kontra.context.fillText(
                `↑ Goal: ${Math.ceil(remainingGoal.upload)} MiB`,
                25, 190 + 30
            );
        }
    });

    const speedIndicator = kontra.sprite({
        render() {
            if (currentAP === null) {
                return;
            }

            kontra.context.fillStyle = 'black';
            kontra.context.font = '19px monospace';

            kontra.context.fillText(
                `↓ Speed: ${Math.ceil(currentAP.speedAt(currentPosition, 'download') * 1024)} KiB/s`,
                25, 270
            );

            kontra.context.fillText(
                `↑ Speed: ${Math.ceil(currentAP.speedAt(currentPosition, 'upload') * 1024)} KiB/s`,
                25, 270 + 30
            );
        }
    });

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
    }

    function turnRight() {
        angleOfRotation -= 1;

        if (angleOfRotation < 0) {
            angleOfRotation = 359;
        }
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
    }

    function unPause() {
        isPaused = false;

        bindMovementKeys();
        kontra.keys.bind('n', toggleNetworkList);
        kontra.keys.bind('h', toggleHelp);
    }

    function showNetworkList() {
        isNetworkListOpen = true;
        kontra.keys.unbind([...movementKeys, 'p', 'h']);

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

            if (selected.cost !== undefined && selected.cost > 0) {
                const wishToPurchase = window.confirm(
                    `Do you wish to pay ${selected.cost} to use this network?`
                );

                if (wishToPurchase) {
                    if (money.remaining >= selected.cost) {
                        money.remaining -= selected.cost;
                        selected.cost = 0;
                    } else {
                        alert('You don\'t have enough money to afford this network');
                        return;
                    }
                } else {
                    return;
                }
            }

            if (selected.password !== undefined) {
                const attempt = prompt(`Enter a ${selected.encryption} password:`);

                if (hash(attempt) !== selected.password) {
                    alert('You entered an incorrect password');
                    return;
                }
            }

            currentAP = selected;

            hideNetworkList();
        });
    }

    function hideNetworkList() {
        isNetworkListOpen = false;
        kontra.keys.unbind(['down', 'up', 'enter']);

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

    function drawDialogBox(dimensions, writeText) {
        // fade window
        kontra.context.fillStyle = 'hsla(0, 0%, 0%, 0.25)';
        kontra.context.fillRect(
            0, 0,
            kontra.canvas.width, kontra.canvas.height
        );

        const position = {
            x: (kontra.canvas.width - dimensions.width) / 2,
            y: (kontra.canvas.height - dimensions.height) / 2
        };

        kontra.context.fillStyle = 'hsl(218, 9%, 17%)';
        kontra.context.fillRect(
            position.x, position.y,
            dimensions.width, dimensions.height
        );

        kontra.context.fillStyle = 'white';
        kontra.context.font = '19px monospace';
        writeText(position, dimensions);
    }
};
