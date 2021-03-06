Tetra.Game = function (field, player, worldConfig) {
    this.debugMode = false;
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

    this.nextScreen = null;
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

    this.shootingSpeed = function () {
        return 1500;
    };
    this.runningSpeed = function () {
        return 500;
    };
    this.jumpingSpeed = function () {
        return 3;
    };
};

/**
 * Calculates text to show as points
 * @returns {string} points string
 */
Tetra.Game.prototype.pointsText = function () {
    return 'Points: ' + this.player.points;
};

/**
 * stops music and calls this.nextScreen()
 */
Tetra.Game.prototype.gameOver = function () {
    this.music.stop();
    this.nextScreen();
};

/**
 * Can be called every 200ms to create a bullet to mouse pointer
 * @type {Function}
 */
Tetra.Game.prototype.shoot = _.throttle(function () {
    var bullet = this.bullets.getFirstDead(true, this.character.x, this.character.y, 'sprites', 'bullet');
    bullet.anchor.setTo(0.5, 0.5);
    bullet.body.allowGravity = false;
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    var angle = this.character.position.angle(wrapWorldPosition(this.input), true);
    this.physics.arcade.velocityFromAngle(angle, this.config.shootingSpeed(), bullet.body.velocity);
}, 200, {trailing: false});

Tetra.Game.prototype.addBlock = function () {
    var elapsedMs = this.time.events.ms;
    var newBlock = new Tetra.Block(this, this.blocks, this.field.tileRectangle, this.config.fallingSpeed(elapsedMs), this.layer);
    this.blocks.add(newBlock);

    var delayMs = this.config.msBetweenBlocks(elapsedMs);

    this.time.events.add(delayMs, this.addBlock, this);
};

Tetra.Game.prototype.create = function () {
    console.log('Creating level');
    console.log('Player: ');
    console.log(this.player);

    this.stage.backgroundColor = '#fff';

    // creating music loop
    this.music = this.sound.add('ozzed_fighter', 1, true);
    this.music.loop = true;
    this.music.play();
    
    // configuring map
    this.map = this.add.tilemap(this.field.tilemapKey);
    this.map.addTilesetImage('tile', 'tiles');
    this.layer = this.map.createLayer('Layer 1');
    this.layer.resizeWorld();
    this.map.setCollision(1);
    
    // basic physic settings
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.y = 1500;
    this.physics.arcade.sortDirection = Phaser.Physics.Arcade.BOTTOM_TOP;

    // create character at starting position in the lower left corner
    this.character = new Tetra.Character(this, 2 * this.field.tileSize, this.world.height - 5 * this.field.tileSize, this.config);
    this.add.existing(this.character);

    // create block group and time block creation
    this.blocks = this.add.group(this.world, 'blocks');
    this.time.events.add(this.config.blockGapMaxMs, this.addBlock, this);

    // bullet object pool
    this.bullets = this.add.group(this.world, 'bullets', false, true, Phaser.Physics.ARCADE);

    // GUI for point display
    var margin = 10;
    var graphics = this.add.graphics(0, 0);
    graphics.fixedToCamera = true;
    graphics.cameraOffset = new Phaser.Point(margin, margin + this.field.tileSize);
    graphics.beginFill(0xA1A1A1, 0.8);
    graphics.drawRoundedRect(0, 0, 8 * this.field.tileSize - 2 * margin, 2 * this.field.tileSize - 2 * margin, 5);
    this.text = this.add.text(0, 0, this.pointsText(), Tetra.style.text.gui);
    this.text.fixedToCamera = true;
    this.text.cameraOffset = graphics.cameraOffset.clone().add(margin, margin);

    // configure camera with deadzone - otherwise, camera would only scroll up
    // when player is quite far at the top of the screen
    this.camera.follow(this.character);
    this.camera.deadzone = new Phaser.Rectangle(0, 800 - (32 * 6), 800, 32);

    // add goal area
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
        this.player.points += removedRows * this.config.points.completedRow;
    }
};

/**
 * Toggles gravity for 'cheating'. Or debugging.
 * @type {Function}
 */
Tetra.Game.prototype.toggleGravity = _.debounce(function (sprite) {
    sprite.body.allowGravity = !sprite.body.allowGravity;
}, 50);

Tetra.Game.prototype.update = function () {
    var that = this;

    // collision checks for blocks
    this.blocks.forEachAlive(function (block) {
        // character is dead when block falls on his head...
        that.physics.arcade.collide(that.character, block, function (character) {
            if (block.falling && character.body.touching.up) {
                character.kill();
                that.gameOver();
            }
        });
        
        if (block.falling) {
            // falling blocks are stopped by the floor
            that.physics.arcade.collide(block, that.layer, function () {
                that.stopBlock(block);
            });

            // and by other, resting blocks
            that.blocks.forEachAlive(function (otherBlock) {
                if (!otherBlock.falling && block !== otherBlock) {
                    that.physics.arcade.collide(block, otherBlock, function () {
                        that.stopBlock(block);
                    });
                }
            });
        }

        // bullets can remove blocks...
        that.physics.arcade.collide(that.bullets, block, function (bullet, blockPart) {
            bullet.kill();

            that.field.remove(blockPart);

            // ... but destroying resting blocks is penalized
            if (blockPart.body.velocity.y === 0) {
                that.player.points += that.config.points.destroyedBlockPart;
            }
            blockPart.destroy();
        });
    });

    // obviously, the character is colliding with the layer
    this.physics.arcade.collide(this.character, this.layer);

    // and bullets should be destroyed too. Except when they are too fast.
    this.physics.arcade.collide(this.bullets, this.layer, function (bullet) {
        bullet.kill();
    });

    this.physics.arcade.overlap(this.goalArea, this.character, function () {
        that.player.points += that.config.points.goal;
        that.gameOver();
    });
    
    // --- MISC
    this.text.text = this.pointsText();

    // --- INPUT
    // shooting bullets
    if (this.input.activePointer.leftButton.isDown) {
        this.shoot();
    }

    // debug keys
    if (this.input.keyboard.isDown(Phaser.Keyboard.COMMA)) {
        this.debugMode = true;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.PERIOD)) {
        this.debugMode = false;
        this.player.points = 0;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.M)) {
        this.gameOver();
    }
    if (this.debugMode) {
        if (this.input.keyboard.isDown(Phaser.Keyboard.L)) {
            // to the goal!
            this.character.x = 700;
            this.character.y = 100;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.O)) {
            this.toggleGravity(this.character);
        }
    }
};

/**
 * Rendering some debug info when in debug mode.
 */
Tetra.Game.prototype.render = function () {
    if (this.debugMode) {
        this.game.debug.bodyInfo(this.character, 32, 32);
        this.game.debug.bodyInfo(this.goalArea, 32, 128);
        this.game.debug.body(this.character);
        this.game.debug.body(this.goalArea);

        this.blocks.forEachAlive(function (block) {
            block.debugBlock();
        });
    }
};

/**
 * Default player definition.
 */
Tetra.Game.defaultPlayer = function () {
    return {
        data: {
            name: getPlayerName(),
            points: 0
        },
        set points(value) {
            this.data.points = value >= 0 ? value : 0;
        },
        get points() {
            return this.data.points;
        }
    }
};