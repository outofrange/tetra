Tetra.Block = function (game, parent, tileRectangle, fallingVelocity) {
    var formation = this.getRandomFormation();
    var colourFrameName = Tetra.Util.getRandomArrayElement(this.ColourSpritesFrames);

    var width = formation[0].length;
    var height = formation.length;

    var x = (function () {
        // calculate tiles from 0 to n, where it's possible to place the block
        var range = tileRectangle.width - width + 1;
        return Math.floor(Math.random() * range + tileRectangle.left);
    })();
    var y = tileRectangle.top;

    this.falling = true;

    Phaser.Group.call(this, game, parent, 'block');

    for (var row = 0; row < height; row++) {
        for (var column = 0; column < width; column++) {
            if (formation[row][column] === 1) {
                var blockPart = this.create((x + column) * 32, (y + row) * 32, 'sprites', colourFrameName);
                game.physics.enable(blockPart, Phaser.Physics.ARCADE);
                
                blockPart.body.allowGravity = false;
                blockPart.body.velocity.y = fallingVelocity;
                blockPart.body.immovable = true;
            }
        }
    }
};

Tetra.Block.prototype = Object.create(Phaser.Group.prototype);
Tetra.Block.prototype.constructor = Tetra.Block;

Tetra.Block.prototype.Formations = {
    shapeL: [[0, 0, 1], [1, 1, 1]],
    shapeJ: [[1, 1, 1], [0, 0, 1]],
    shapeI: [[1, 1, 1, 1]],
    shapeO: [[1, 1], [1, 1]],
    shapeT: [[0, 1, 0], [1, 1, 1]],
    shapeS: [[0, 1, 1], [1, 1, 0]],
    shapeZ: [[1, 1, 0], [0, 1, 1]]
};

Tetra.Block.prototype.ColourSpritesFrames = ['box_blue', 'box_green', 'box_red', 'box_yellow'];

Tetra.Block.prototype.getRandomFormation = function () {
    var formation = Tetra.Util.getRandomProperty(this.Formations);

    var rotateTimes = Math.floor(Math.random() * 3);
    for (var i = 0; i < rotateTimes; i++) {
        formation = Tetra.Util.rotate2dArray(formation);
    }

    return formation;
};

Tetra.Block.prototype.stop = function () {
    this.falling = false;
    this.setAll('body.velocity.y', 0);

    // TODO find out what's wrong.
    // that's what's annoying with making games. Even after aligning our blocks to the 32 grid manually,
    // they are still too low by >about< 3 pixels (about! Sometimes it's four...)
    // Before wasting hours finding some bug, I'm doing some magic.
    var magicPixelCorrection = -3;

    this.forEachAlive(function (blockPart) {
        blockPart.position.y = Tetra.Util.snapToGrid(blockPart.position.y, 32) + magicPixelCorrection;
    });
};

Tetra.Block.prototype.debugBlock = function () {
    var that = this;
    this.children.forEach(function (child) {
        // yes. it looks a bit weird.
        that.game.game.debug.body(child);
    });
};

Tetra.Block.prototype.totalParts = function () {
    return this.children.length;
};