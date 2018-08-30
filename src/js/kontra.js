const kontra = {
    init(canvas) {
        // check if canvas is a string first, an element next, or default to getting
        // first canvas on page
        let canvasEl = this.canvas = document.getElementById(canvas) || canvas || document.querySelector('canvas');

        this.context = canvasEl.getContext('2d');
    },

    _noop: new Function(),

    _tick: new Function()
};

(function () {
    kontra.gameLoop = function (properties) {
        properties = properties || {};

        // animation variables
        const fps = properties.fps || 60;
        let accumulator = 0;
        const delta = 1E3 / fps; // delta between performance.now timings (in ms)
        const step = 1 / fps;

        const clear = (properties.clearCanvas === false
            ? kontra._noop
            : function clear() {
            kontra.context.clearRect(0, 0, kontra.canvas.width, kontra.canvas.height);
        });
        let last; let rAF; let now; let dt;

        function frame() {
            rAF = requestAnimationFrame(frame);

            now = performance.now();
            dt = now - last;
            last = now;

            // prevent updating the game with a very large dt if the game were to lose focus
            // and then regain focus later
            if (dt > 1E3) {
                return;
            }

            kontra._tick();
            accumulator += dt;

            while (accumulator >= delta) {
                gameLoop.update(step);

                accumulator -= delta;
            }

            clear();
            gameLoop.render();
        }

        // game loop object
        let gameLoop = {
            update: properties.update,
            render: properties.render,
            isStopped: true,

            start() {
                last = performance.now();
                this.isStopped = false;
                requestAnimationFrame(frame);
            },

            stop() {
                this.isStopped = true;
                cancelAnimationFrame(rAF);
            }
        };

        return gameLoop;
    };
}());

(function () {
    const callbacks = {};
    let pressedKeys = {};

    const keyMap = {
        // named keys
        13: 'enter',
        27: 'esc',
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // alpha keys
    // @see https://stackoverflow.com/a/43095772/2124254
    for (let i = 0; i < 26; i++) {
        keyMap[65 + i] = (10 + i).toString(36);
    }
    // numeric keys
    for (i = 0; i < 10; i++) {
        keyMap[48 + i] = `${i}`;
    }

    addEventListener('keydown', keydownEventHandler);
    addEventListener('keyup', keyupEventHandler);
    addEventListener('blur', blurEventHandler);

    function keydownEventHandler(e) {
        const key = keyMap[e.which];
        pressedKeys[key] = true;

        if (callbacks[key]) {
            callbacks[key](e);
        }
    }

    function keyupEventHandler(e) {
        pressedKeys[keyMap[e.which]] = false;
    }

    function blurEventHandler(e) {
        pressedKeys = {};
    }

    kontra.keys = {
        bind(keys, callback) {
            // smaller than doing `Array.isArray(keys) ? keys : [keys]`
            [].concat(keys).map((key) => {
        callbacks[key] = callback;
      });
        },

        unbind(keys, undefined) {
            [].concat(keys).map((key) => {
                callbacks[key] = undefined;
            });
        },

        pressed(key) {
            return !!pressedKeys[key];
        }
    };
}());

(function () {
    class Vector {
        constructor(x, y) {
            this._x = x || 0;
            this._y = y || 0;
        }

        add(vector, dt) {
            this.x += (vector.x || 0) * (dt || 1);
            this.y += (vector.y || 0) * (dt || 1);
        }

        clamp(xMin, yMin, xMax, yMax) {
            this._c = true;
            this._a = xMin;
            this._b = yMin;
            this._d = xMax;
            this._e = yMax;
        }

        get x() {
            return this._x;
        }

        get y() {
            return this._y;
        }

        set x(value) {
            this._x = (this._c ? Math.min(Math.max(this._a, value), this._d) : value);
        }

        set y(value) {
            this._y = (this._c ? Math.min(Math.max(this._b, value), this._e) : value);
        }
    }

    kontra.vector = (x, y) => {
        return new Vector(x, y);
    };
    kontra.vector.prototype = Vector.prototype;


    class Sprite {
        // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
        init(properties, prop, temp, firstAnimation) {
            properties = properties || {};

            this.position = kontra.vector(properties.x, properties.y);
            this.velocity = kontra.vector(properties.dx, properties.dy);
            this.acceleration = kontra.vector(properties.ddx, properties.ddy);

            // defaults
            this.width = this.height = 0;
            this.context = kontra.context;

            // loop through properties before overrides
            for (prop in properties) {
                this[prop] = properties[prop];
            }

            // image sprite
            if (temp = properties.image) {
                this.image = temp;
                this.width = temp.width;
                this.height = temp.height;
            }

            // animation sprite
            else if (temp = properties.animations) {
                // clone each animation so no sprite shares an animation
                for (prop in temp) {
                    this.animations[prop] = temp[prop].clone();

                    // default the current animation to the first one in the list
                    firstAnimation = firstAnimation || temp[prop];
                }

                this._ca = firstAnimation;
                this.width = firstAnimation.width;
                this.height = firstAnimation.height;
            }

            return this;
        }

        // define getter and setter shortcut functions to make it easier to work with the
        // position, velocity, and acceleration vectors.

        get x() {
            return this.position.x;
        }

        get y() {
            return this.position.y;
        }

        get dx() {
            return this.velocity.x;
        }

        get dy() {
            return this.velocity.y;
        }

        get ddx() {
            return this.acceleration.x;
        }

        get ddy() {
            return this.acceleration.y;
        }

        set x(value) {
            this.position.x = value;
        }

        set y(value) {
            this.position.y = value;
        }

        set dx(value) {
            this.velocity.x = value;
        }

        set dy(value) {
            this.velocity.y = value;
        }

        set ddx(value) {
            this.acceleration.x = value;
        }

        set ddy(value) {
            this.acceleration.y = value;
        }

        isAlive() {
            return this.ttl > 0;
        }

        collidesWith(object) {
            return this.x < object.x + object.width
             && this.x + this.width > object.x
             && this.y < object.y + object.height
             && this.y + this.height > object.y;
        }

        update(dt) {
            this.advance(dt);
        }

        render() {
            this.draw();
        }

        playAnimation(name) {
            this._ca = this.animations[name];

            if (!this._ca.loop) {
                this._ca.reset();
            }
        }

        advance(dt) {
            this.velocity.add(this.acceleration, dt);
            this.position.add(this.velocity, dt);

            this.ttl--;

            if (this._ca) {
                this._ca.update(dt);
            }
        }

        draw() {
            if (this.image) {
                this.context.drawImage(this.image, this.x, this.y);
            } else if (this._ca) {
                this._ca.render(this);
            } else {
                this.context.fillStyle = this.color;
                this.context.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }

    kontra.sprite = (properties) => {
        return (new Sprite()).init(properties);
    };
    kontra.sprite.prototype = Sprite.prototype;
}());
