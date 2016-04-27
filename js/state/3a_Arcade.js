Tetra.arcade = function () {
    var character = null;
    var map = null;
    var layer = null;

    var TILE_WIDTH = 32;

    var GOAL_AREA;

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

    var points = 0;
    var pointsText = function () {
        return 'Points: ' + points;
    };

    var blockFallingSpeedMin = 200;
    var blockFallingSpeedMax = 600;
    var maxSpeedReachedAfterMs = 1000 * 60 * 4;
    var fallingSpeedGradient = (blockFallingSpeedMax - blockFallingSpeedMin) / (maxSpeedReachedAfterMs);
    var calcFallingSpeed = function (elapsedMs) {
        var speed = fallingSpeedGradient * elapsedMs + blockFallingSpeedMin;
        if (speed > blockFallingSpeedMax) {
            speed = blockFallingSpeedMax;
        }

        return speed;
    };

    var addBlock;

    var blocks = [];
    var blockGroups = [];

    var bullets;

    var text;

    var shoot = _.throttle(function () {
        var bullet = bullets.getFirstDead(true, character.x, character.y, 'sprites', 'bullet');
        bullet.anchor.setTo(0.5, 0.5);
        bullet.body.allowGravity = false;
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;

        var angle = character.position.angle(worldPosWrapper(this.input), true);
        this.physics.arcade.velocityFromAngle(angle, 1500, bullet.body.velocity);
    }, 200, {trailing: false});

    this.create = function () {
        var that = this;

        console.log('Creating Arcade level');

        var music = that.sound.add('ozzed_fighter', 1, true);
        music.loop = true;
        music.play();

        addBlock = function () {
            var elapsedMs = that.time.events.ms;
            var newBlock = new Tetra.Block(this, 8, 18, calcFallingSpeed(elapsedMs), layer);
            blocks.push(newBlock);
            blockGroups.push(newBlock.blockGroup);

            var delayMs = calcBlockGap(elapsedMs);

            that.time.events.add(delayMs, addBlock, that);
        };

        this.stage.backgroundColor = '#fff';

        map = this.add.tilemap('map_xl');
        map.addTilesetImage('kachel', 'tiles');
        layer = map.createLayer('Layer 1');
        layer.resizeWorld();
        map.setCollision([0, 1]);


        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 1500;
        this.physics.arcade.sortDirection = Phaser.Physics.Arcade.BOTTOM_TOP;

        character = new Tetra.Character(this, 2 * TILE_WIDTH, this.world.height - 5 * TILE_WIDTH);
        this.add.existing(character);

        this.time.events.add(blockGapMaxMs, addBlock, this);

        bullets = this.add.group(this.world, 'bullets', false, true, Phaser.Physics.ARCADE);

        // we have to bind shoot to our Phaserish this, otherwise there are some weird problems...
        // just passing this and accessing all stuff with this.foo doesn't work)
        shoot = _.bind(shoot, this);

        var margin = 10;
        var graphics = this.add.graphics(0, 0);
        graphics.fixedToCamera = true;
        graphics.cameraOffset = new Phaser.Point(margin, margin + TILE_WIDTH);
        graphics.beginFill(0xA1A1A1, 0.8);
        graphics.drawRoundedRect(0, 0, 8 * TILE_WIDTH - 2 * margin, 5 * TILE_WIDTH - 2 * margin, 5);

        text = this.add.text(0, 0, pointsText(), Tetra.style.text.gui);
        text.fixedToCamera = true;
        text.cameraOffset = graphics.cameraOffset.clone().add(margin, margin);

        //this.camera.setBoundsToWorld();
        this.camera.follow(character);

        GOAL_AREA = this.add.sprite(18 * TILE_WIDTH, TILE_WIDTH, null);
        this.physics.enable(GOAL_AREA, Phaser.Physics.ARCADE);
        GOAL_AREA.body.setSize(6 * TILE_WIDTH, 6 * TILE_WIDTH);
    };

    var stopBlock = function (block) {
        block.stop();
        points += block.totalParts() * 100;
    };

    this.update = function () {
        var that = this;

        // collision checks
        this.physics.arcade.collide(character, blockGroups);

        blocks.forEach(function (block) {
            if (block.falling) {
                that.physics.arcade.collide(block.blockGroup, layer, function () {
                    stopBlock(block)
                });

                that.physics.arcade.collide(block.blockGroup, blockGroups, function () {
                    stopBlock(block)
                });
            }
        });

        this.physics.arcade.collide(character, layer);


        this.physics.arcade.collide(bullets, layer, function (bullet) {
            bullet.kill();
        });
        this.physics.arcade.collide(bullets, blockGroups, function (bullet, block) {
            bullet.kill();

            if (block.body.velocity.y === 0) {
                points -= 200;
            }
            block.destroy();
        });

        // process character updates like movement, ...
        //character.update();

        // shooting bullets
        if (this.input.activePointer.leftButton.isDown) {
            shoot();
        }

        text.text = pointsText();

        this.physics.arcade.overlap(GOAL_AREA, character, function () {
            console.log('Goal!');
        });
    };

    this.render = function () {
        g.debug.bodyInfo(character, 32, 32);
        g.debug.body(character);
    };
};


