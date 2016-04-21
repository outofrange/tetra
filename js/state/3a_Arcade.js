tetra.arcade = function () {
    var character = null;
    var map = null;
    var layer = null;

    var blockGapMaxMs = 2000;
    var blockGapMinMs = 250;
    var minReachedAfterMs = 1000 * 60 * 5;
    var gapGradient = (blockGapMaxMs - blockGapMinMs) / (-minReachedAfterMs);
    var calcBlockGap = function (elapsedMs) {
        var gapMs = gapGradient * elapsedMs + blockGapMaxMs;
        if (gapMs < blockGapMinMs) {
            gapMs = blockGapMinMs;
        }

        return gapMs;
    };

    var blockFallingSpeedMin = 200;
    var blockFallingSpeedMax = 600;
    var maxSpeedReachedAfterMs = 1000 * 60 * 4;
    var fallignSpeedGradient = (blockFallingSpeedMax - blockFallingSpeedMin) / (maxSpeedReachedAfterMs);
    var calcFallingSpeed = function (elapsedMs) {
        var speed = fallignSpeedGradient * elapsedMs + blockFallingSpeedMin;
        if (speed > blockFallingSpeedMax) {
            speed = blockFallingSpeedMax;
        }

        return speed;
    };

    var addBlock;

    var blocks = [];
    var blockGroups = [];

    this.create = function () {
        var that = this;

        console.log('Creating Arcade level');

        addBlock = function () {
            var elapsedMs = that.time.events.ms;
            var newBlock = new tetra.Block(this, 8, 18, calcFallingSpeed(elapsedMs), layer);
            blocks.push(newBlock);
            blockGroups.push(newBlock.blockGroup);

            var delayMs = calcBlockGap(elapsedMs);

            that.time.events.add(delayMs, addBlock, that);
        };

        this.stage.backgroundColor = '#fff';

        //this.world.setBounds(0, 0, 800, 1280);
        map = this.add.tilemap('map_xl');
        map.addTilesetImage('kachel', 'tiles');
        layer = map.createLayer('Layer 1');
        layer.resizeWorld();
        map.setCollision([0, 1]);

        //this.camera.setBoundsToWorld();

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 1500;

        character = new tetra.Character(this, 64, 768);

        this.time.events.add(blockGapMaxMs, addBlock, this);
    };


    this.update = function () {
        var that = this;

        this.physics.arcade.collide(character.legsSprite, blockGroups);
        this.physics.arcade.collide(character.bodySprite, blockGroups);

        blocks.forEach(function (block) {
            if (block.falling) {
                that.physics.arcade.collide(block.blockGroup, layer, block.stop);

                that.physics.arcade.collide(block.blockGroup, blockGroups, block.stop);
            }
        })

        this.physics.arcade.collide(character.legsSprite, layer);
        this.physics.arcade.collide(character.bodySprite, layer);

        character.update();
    };
};


