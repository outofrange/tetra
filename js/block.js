var blockFormations = {
    shapeL: [[0, 0, 1], [1, 1, 1]],
    shapeJ: [[1, 1, 1], [0, 0, 1]],
    shapeI: [[1, 1, 1, 1]],
    shapeO: [[1, 1], [1, 1]],
    shapeT: [[0, 1, 0], [1, 1, 1]],
    shapeS: [[0, 1, 1], [1, 1, 0]],
    shapeZ: [[1, 1, 0], [0, 1, 1]]
};

var colourFrameNames = ['box_blue', 'box_green', 'box_red', 'box_yellow'];

var rotate = function (array2D) {
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

var getRandomArrayElement = function (array) {
    return array[Math.floor(Math.random() * array.length)];
};

var getRandomBlockRandomRotated = function () {
    // picking random property - see http://stackoverflow.com/a/15106541/1436981
    var blockKeys = Object.keys(blockFormations);
    var randomBlock = blockFormations[blockKeys[Math.random() * blockKeys.length << 0]];

    var rotateTimes = Math.floor(Math.random() * 3);
    for (var i = 0; i < rotateTimes; i++) {
        randomBlock = rotate(randomBlock);
    }

    return randomBlock;
};

var collisionCheck = {
    falling: {
        up: false,
        down: true,
        left: true,
        right: true
    },
    standing: {
        up: true,
        down: true,
        left: true,
        right: true
    }
};


tetra.Block = function (phaserGame, startTileX, endTileX, fallingVelocity) {
    var that = this;

    var game = phaserGame;

    var formationMatrix = getRandomBlockRandomRotated();
    var colourFrameName = getRandomArrayElement(colourFrameNames);

    var tiles = {
        width: formationMatrix[0].length,
        height: formationMatrix.length
    };

    this.falling = true;

    var x = (function () {
        // calculate tiles from 0 to n, where it's possible to place the block
        var range = endTileX - startTileX - tiles.width + 1;
        return Math.floor(Math.random() * range + startTileX);
    })();
    var y = 0;

    this.blockGroup = game.add.group(phaserGame.world, 'block', false, true, Phaser.Physics.ARCADE);

    this.totalParts = function () {
        return that.blockGroup.children.length;
    };

    for (var i = 0; i < tiles.height; i++) {
        for (var j = 0; j < tiles.width; j++) {
            if (formationMatrix[i][j] === 1) {
                var blockSprite = this.blockGroup.create((x + j) * 32, (y + i) * 32, 'sprites', colourFrameName);
                blockSprite.body.velocity.y = fallingVelocity;
                blockSprite.body.allowGravity = false;

                blockSprite.body.checkCollision = collisionCheck.falling;
                blockSprite.body.blocked = {
                    down: true
                };
                blockSprite.immovable = true;
            }
        }
    }

    var nearestValue = function (value, sectionWidth) {
        var v1 = value % sectionWidth;
        if (v1 >= sectionWidth / 2) {
            return value + (sectionWidth - v1);
        } else {
            return value - v1;
        }
    };

    this.stop = function () {
        that.blockGroup.setAll('body.velocity.y', 0);
        that.blockGroup.setAll('body.checkCollision', collisionCheck.standing);
        that.blockGroup.setAll('body.immovable', true);
        that.falling = false;

        // FIXME doesn't work :(
        for (var i = 0; i < that.blockGroup.length; i++) {
            var b = that.blockGroup.getAt(i);
            b.y = nearestValue(b.y, 32);
        }
    }
};