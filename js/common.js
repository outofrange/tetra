Tetra = {};
Tetra.Util = {};

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

Tetra.Util.getRandomArrayElement = function (array) {
    return array[Math.floor(Math.random() * array.length)];
};

Tetra.Util.getRandomProperty = function (obj) {
    // picking random property - see http://stackoverflow.com/a/15106541/1436981
    var keys = Object.keys(obj);
    return obj[keys[Math.random() * keys.length << 0]];
};

Tetra.Util.snapToGrid = function (value, gridSize) {
    var v1 = value % gridSize;
    if (v1 >= gridSize / 2) {
        return value + (gridSize - v1);
    } else {
        return value - v1;
    }
};