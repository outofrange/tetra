Tetra.Game = function (field, player, worldConfig) {
    this.debug = false;
    this.field = field;
    this.player = player;
    
    this.config = pick(worldConfig, new Tetra.Game.DefaultConfig());

    this.map = null;
    this.layer = null;
    this.music = null;

    this.character = null;
    this.bullets = null;
    this.blocks = null;
    this.goalArea = null;
    this.text = null;

    this.addBlock = null;
};
Tetra.Game.prototype = Object.create(Phaser.State.prototype);
Tetra.Game.prototype.constructor = Tetra.Game;

Tetra.Game.DefaultConfig = function () {
    var that = this;

    this.goal = new Phaser.Rectangle(576, 32, 192, 192);

    this.points = {
        blockPart: 100,
        destroyedBlockPart: -200,
        completedRow: 10000,
        goal: 100000
    };

    this.blockGapMaxMs = 4000;
    this.blockGapMinMs = 250;
    this.minReachedAfterMs = 1000 * 60 * 5;

    var gapGradient = function () {
        return (that.blockGapMaxMs - that.blockGapMinMs) / (-that.minReachedAfterMs);
    };
    this.msBetweenBlocks = function (elapsedMs) {
        var gapMs = gapGradient() * elapsedMs + this.blockGapMaxMs;
        if (gapMs < this.blockGapMinMs) {
            gapMs = this.blockGapMinMs;
        }

        return gapMs;
    };

    this.blockFallingSpeedMin = 100;
    this.blockFallingSpeedMax = 600;
    this.maxSpeedReachedAfterMs = 1000 * 60 * 4;
    var fallingSpeedGradient = function () {
        return (that.blockFallingSpeedMax - that.blockFallingSpeedMin) / (that.maxSpeedReachedAfterMs);
    };
    this.fallingSpeed = function (elapsedMs) {
        var speed = fallingSpeedGradient() * elapsedMs + this.blockFallingSpeedMin;
        if (speed > this.blockFallingSpeedMax) {
            speed = this.blockFallingSpeedMax;
        }

        return speed;
    };

    this.shootingSpeed = 1500;
};

Tetra.Game.prototype.pointsText = function () {
    return 'Points: ' + this.player.points;
};

Tetra.Game.prototype.gameOver = function () {
    this.music.stop();
    this.state.start('Highscore', true, false, !debug ? this.player.points : 0);
};

Tetra.Game.prototype.shoot = _.throttle(function () {
    var bullet = this.bullets.getFirstDead(true, this.character.x, this.character.y, 'sprites', 'bullet');
    bullet.anchor.setTo(0.5, 0.5);
    bullet.body.allowGravity = false;
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    var angle = this.character.position.angle(wrapWorldPosition(this.input), true);
    this.physics.arcade.velocityFromAngle(angle, this.config.shootingSpeed, bullet.body.velocity);
}, 200, {trailing: false});

Tetra.Game.prototype.create = function () {
    var that = this;

    this.player.points = 0;

    console.log('Creating level');
    console.log('Name: ' + this.player.name);

    this.music = this.sound.add('ozzed_fighter', 1, true);
    this.music.loop = true;
    this.music.play();

    this.blocks = this.add.group(this.world, 'blocks');

    // GEN
    this.addBlock = function () {
        var elapsedMs = that.time.events.ms;
        var newBlock = new Tetra.Block(this, this.blocks, this.field.tileRectangle,
            this.config.fallingSpeed(elapsedMs), this.layer);
        this.blocks.add(newBlock);

        var delayMs = this.config.msBetweenBlocks(elapsedMs);

        that.time.events.add(delayMs, that.addBlock, that);
    };

    this.stage.backgroundColor = '#fff';

    this.map = this.add.tilemap(this.field.tilemapKey);
    this.map.addTilesetImage('tile', 'tiles');
    this.layer = this.map.createLayer('Layer 1');
    this.layer.resizeWorld();
    this.map.setCollision(1);


    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.y = 1500;
    this.physics.arcade.sortDirection = Phaser.Physics.Arcade.BOTTOM_TOP;

    this.character = new Tetra.Character(this, 2 * this.field.tileSize, this.world.height - 5 * this.field.tileSize);
    this.add.existing(this.character);

    this.time.events.add(this.config.blockGapMaxMs, this.addBlock, this);

    this.bullets = this.add.group(this.world, 'bullets', false, true, Phaser.Physics.ARCADE);

    // GUI REF
    var margin = 10;
    var graphics = this.add.graphics(0, 0);
    graphics.fixedToCamera = true;
    graphics.cameraOffset = new Phaser.Point(margin, margin + this.field.tileSize);
    graphics.beginFill(0xA1A1A1, 0.8);
    graphics.drawRoundedRect(0, 0, 8 * this.field.tileSize - 2 * margin, 5 * this.field.tileSize - 2 * margin, 5);

    this.text = this.add.text(0, 0, this.pointsText(), Tetra.style.text.gui);
    this.text.fixedToCamera = true;
    this.text.cameraOffset = graphics.cameraOffset.clone().add(margin, margin);

    this.camera.follow(this.character);
    this.camera.deadzone = new Phaser.Rectangle(0, 800 - (32 * 6), 800, 32);

    this.goalArea = this.add.sprite(this.config.goal.x, this.config.goal.y, null);
    this.physics.enable(this.goalArea, Phaser.Physics.ARCADE);
    this.goalArea.body.setSize(this.config.goal.width, this.config.goal.height);
    this.goalArea.body.allowGravity = false;
};

Tetra.Game.prototype.stopBlock = function (block) {
    // could be called multiple times for a single block formation
    if (block.falling) {
        block.stop();
        this.player.points += block.totalParts() * 100;

        // adding all block parts to field
        var removedRows = this.field.add(block.children);
        this.player.points += removedRows * that.config.points.completedRow;
    }
};

Tetra.Game.prototype.toggleGravity = _.debounce(function (sprite) {
    sprite.body.allowGravity = !sprite.body.allowGravity;
}, 50);

Tetra.Game.prototype.update = function () {
    var that = this;

    // collision checks
    this.blocks.forEachAlive(function (block) {
        that.physics.arcade.collide(that.character, block, function (character) {
            if (block.falling && character.body.touching.up) {
                character.kill();

                that.gameOver();
            }
        });

        if (block.falling) {
            that.physics.arcade.collide(block, that.layer, function () {
                that.stopBlock(block);
            });

            that.blocks.forEachAlive(function (otherBlock) {
                if (!otherBlock.falling && block !== otherBlock) {
                    that.physics.arcade.collide(block, otherBlock, function () {
                        that.stopBlock(block);
                    });
                }
            });
        }

        that.physics.arcade.collide(that.bullets, block, function (bullet, blockPart) {
            bullet.kill();

            that.field.remove(blockPart);

            if (blockPart.body.velocity.y === 0) {
                that.player.points += that.config.points.destroyedBlockPart;
            }
            blockPart.destroy();
        });
    });

    this.physics.arcade.collide(this.character, this.layer);

    this.physics.arcade.collide(this.bullets, this.layer, function (bullet) {
        bullet.kill();
    });


    // shooting bullets
    if (this.input.activePointer.leftButton.isDown) {
        this.shoot();
    }

    this.text.text = this.pointsText();

    this.physics.arcade.overlap(this.goalArea, this.character, function () {
        that.player.points += that.config.points.goal;
        that.gameOver();
    });

    // debug keys
    if (this.input.keyboard.isDown(Phaser.Keyboard.COMMA)) {
        this.debug = true;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.PERIOD)) {
        this.debug = false;
        this.player.points = 0;
    }
    if (this.debug) {
        if (this.input.keyboard.isDown(Phaser.Keyboard.M)) {
            this.gameOver();
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.L)) {
            // to the goal!
            this.character.x = 700;
            this.character.y = 100;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.O)) {
            this.toggleGravity(this.character);
        }
    }
};

Tetra.Game.prototype.render = function () {
    if (this.debug) {
        this.game.debug.bodyInfo(this.character, 32, 32);
        this.game.debug.bodyInfo(this.goalArea, 32, 128);
        this.game.debug.body(this.character);
        this.game.debug.body(this.goalArea);

        this.blocks.forEachAlive(function (block) {
            block.debug();
        });
    }
};