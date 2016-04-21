tetra.arcade = function () {
    var character = null;
    var map = null;
    var layer = null;

    var blockGapMaxMs = 2000;
    var blockGapMinMs = 250;
    var minReachedAfterMs = 1000 * 60 * 5;
    var gapGradient = (blockGapMaxMs - blockGapMinMs) / (-minReachedAfterMs);

    var addBlock;

    var blocks = [];
    var blockGroups = [];

    this.create = function () {
        var that = this;

        console.log('Creating Arcade level');

        addBlock = function () {
            var newBlock = new tetra.Block(this, 8, 18, 200, layer);
            blocks.push(newBlock);
            blockGroups.push(newBlock.blockGroup);

            var delayMs = gapGradient * that.time.events.ms + blockGapMaxMs;
            if (delayMs < blockGapMinMs) {
                delayMs = blockGapMinMs;
            }

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


