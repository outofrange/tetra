/**
 * If arg is undefined, choose default
 * @param arg argument to choose if not undefined
 * @param def default
 * @returns {*} either arg or default
 */
var pick = function (arg, def) {
    return typeof arg == 'undefined' ? def : arg;
};

/**
 * Provides access to worldX and worldY properties of obj through x and y
 * @param obj object to wrap
 * @returns {{x, y}} new, wrapped object
 */
var wrapWorldPosition = function (obj) {
    return {
        get x() {
            return obj.worldX;
        },
        get y() {
            return obj.worldY;
        }
    }
};

Phaser.Key.prototype.toString = function () {
    return this.keyCode.toString();
};

Tetra = {};

Tetra.style = {
    text: {
        heading: {font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle'},
        normal: {font: '24px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle'},
        highscore: {
            name: {font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle'},
            score: {font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'right', boundsAlignV: 'middle'}
        },
        gui: {font: '24px Arial', fill: '#000', boundsAlignH: 'center', boundsAlignV: 'middle'},
        button: {font: '24px Arial', fill: '#000', boundsAlignH: 'center', boundsAlignV: 'middle'}
    }
};

Tetra.Player = {
    name: pick(localStorage.getItem('playerName'), 'anonymous'),
    arcade: {
        _points: 0,
        set points(value) {
            Tetra.Player.arcade._points = value >= 0 ? value : 0;
        },
        get points() {
            return Tetra.Player.arcade._points;
        }
    }
};

/*Tetra.Arcade.Player = {
    name: pick(localStorage.getItem('playerName'), 'anonymous'),
    _points: 0,
    set points(value) {
        Tetra.Player.arcade._points = value >= 0 ? value : 0;
    },
    get points() {
        return Tetra.Player.arcade._points;
    }
};*/


Tetra.Util = {};

/**
 * Rotates a two dimensional array clock-wise
 * @param array2D the array to rotate
 * @returns {Array} a new, rotated array
 */
Tetra.Util.rotate2dArray = function (array2D) {
    var rotated = [];
    var heightOriginal = array2D.length;
    var widthOriginal = array2D[0].length;

    for (var i = 0; i < widthOriginal; i++) {
        rotated.push([]);
    }

    for (var row = heightOriginal - 1; row >= 0; row--) {
        for (var col = 0; col < widthOriginal; col++) {
            var value = array2D[row][col];
            rotated[col].push(value);
        }
    }

    return rotated;
};

/**
 * Retrieves a random element from within an array
 * @param array the array to choose from
 * @returns {*} an element from the array
 */
Tetra.Util.getRandomArrayElement = function (array) {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Retrieves the value of a random property of an object
 * @param obj the object to choose from
 * @returns {*} the value of the chosen property
 */
Tetra.Util.getRandomProperty = function (obj) {
    // picking random property - see http://stackoverflow.com/a/15106541/1436981
    var keys = Object.keys(obj);
    return obj[keys[Math.random() * keys.length << 0]];
};

/**
 * Adjust value to the nearest multiple of gridSize
 * @param value the value to adjust
 * @param gridSize the size of the grid
 * @returns {*} the adjusted value - is a multiple of gridSize
 */
Tetra.Util.snapToGrid = function (value, gridSize) {
    var v1 = value % gridSize;
    if (v1 >= gridSize / 2) {
        return value + (gridSize - v1);
    } else {
        return value - v1;
    }
};

/**
 * Initializes an empty array
 *
 * @param {int} rows number of rows the array should have
 * @param {int} [columns] number of columns each row should have
 * @returns {Array} an empty array
 *
 * initArray(3) -> [undefined, undefined, undefined]
 * initArray(3, 2) -> [[undefined, undefined], [undefined, undefined], [undefined, undefined]]
 */
Tetra.Util.initArray = function (rows, columns) {
    columns = pick(columns, 0);
    var arr = [];

    for (var i = 0; i < rows; i++) {
        if (columns > 0) {
            arr[i] = Tetra.Util.initArray(columns);
        } else {
            arr[i] = undefined;
        }
    }

    return arr;
};