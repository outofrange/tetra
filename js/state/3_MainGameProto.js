Tetra.MainGame = function (field, player, config) {
    this.debug = false;
    this.field = field;
    this.player = player;
    
    this.config = pick(config, new Tetra.MainGame.DefaultConfig());

    this.map = null;
    this.layer = null;
    this.music = null;

    this.character = null;
    this.bullets = null;
    this.blocks = null;
    this.GOAL_AREA = null;
    this.text = null;

    this.addBlock = null;
};
Tetra.MainGame.prototype = Object.create(Phaser.State.prototype);
Tetra.MainGame.prototype.constructor = Tetra.MainGame;

Tetra.MainGame.DefaultConfig = function () {
    this.blockGapMaxMs = 4000;
    this.blockGapMinMs = 250;
    this.minReachedAfterMs = 1000 * 60 * 5;
    this.gapGradient = (this.blockGapMaxMs - this.blockGapMinMs) / (-this.minReachedAfterMs);
    this.calcBlockGap = function (elapsedMs) {
        var gapMs = this.gapGradient * elapsedMs + this.blockGapMaxMs;
        if (gapMs < this.blockGapMinMs) {
            gapMs = this.blockGapMinMs;
        }

        return gapMs;
    };

    this.blockFallingSpeedMin = 100;
    this.blockFallingSpeedMax = 600;
    this.maxSpeedReachedAfterMs = 1000 * 60 * 4;
    this.fallingSpeedGradient = (this.blockFallingSpeedMax - this.blockFallingSpeedMin) / (this.maxSpeedReachedAfterMs);
    this.calcFallingSpeed = function (elapsedMs) {
        var speed = this.fallingSpeedGradient * elapsedMs + this.blockFallingSpeedMin;
        if (speed > this.blockFallingSpeedMax) {
            speed = this.blockFallingSpeedMax;
        }

        return speed;
    };
};

Tetra.MainGame.prototype.pointsText = function () {
    return 'Points: ' + this.player.points;
};

Tetra.MainGame.prototype.gameover = function () {
    this.music.stop();
    this.state.start('Highscore', true, false, !debug ? this.player.points : 0);
};

Tetra.MainGame.prototype.shoot = _.throttle(function () {
    var bullet = this.bullets.getFirstDead(true, this.character.x, this.character.y, 'sprites', 'bullet');
    bullet.anchor.setTo(0.5, 0.5);
    bullet.body.allowGravity = false;
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    var angle = this.character.position.angle(wrapWorldPosition(this.input), true);
    this.physics.arcade.velocityFromAngle(angle, 1500, bullet.body.velocity);
}, 200, {trailing: false});

Tetra.MainGame.prototype.create = function () {
    var that = this;

    this.player.points = 0;

    console.log('Creating level');
    console.log('Name: ' + this.player.name);

    this.music = this.sound.add('ozzed_fighter', 1, true);
    this.music.loop = true;
    this.music.play();

    this.blocks = this.add.group(this.world, 'blocks');

    this.addBlock = function () {
        var elapsedMs = that.time.events.ms;
        var newBlock = new Tetra.Block(this, this.blocks, this.field.tileRectangle,
            this.config.calcFallingSpeed(elapsedMs), this.layer);
        this.blocks.add(newBlock);

        var delayMs = this.config.calcBlockGap(elapsedMs);

        that.time.events.add(delayMs, that.addBlock, that);
    };

    this.stage.backgroundColor = '#fff';

    this.map = this.add.tilemap('map_xl'); // GEN
    this.map.addTilesetImage('kachel', 'tiles');
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

    // we have to bind shoot to our Phaserish 'this', otherwise there are some weird problems...
    // just passing this and accessing all stuff with this.foo doesn't work)

    // GEN
    this.shoot = _.bind(this.shoot, this);

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

    this.GOAL_AREA = this.add.sprite(18 * this.field.tileSize, this.field.tileSize, null);
    this.physics.enable(this.GOAL_AREA, Phaser.Physics.ARCADE);
    this.GOAL_AREA.body.setSize(6 * this.field.tileSize, 6 * this.field.tileSize);
    this.GOAL_AREA.body.allowGravity = false;
};

Tetra.MainGame.prototype.stopBlock = function (block) {
    // could be called multiple times for a single block formation
    if (block.falling) {
        block.stop();
        this.player.points += block.totalParts() * 100;

        // adding all block parts to field
        var removedRows = this.field.add(block.children);
        this.player.points += removedRows * 5000;
    }
};

Tetra.MainGame.prototype.toggleGravity = _.debounce(function (sprite) {
    sprite.body.allowGravity = !sprite.body.allowGravity;
}, 50);

Tetra.MainGame.prototype.update = function () {
    var that = this;

    // collision checks
    this.blocks.forEachAlive(function (block) {
        that.physics.arcade.collide(that.character, block, function (character) {
            if (block.falling && character.body.touching.up) {
                character.kill();

                that.gameover();
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
                that.player.points -= 200;
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

    this.physics.arcade.overlap(this.GOAL_AREA, this.character, function () {
        that.player.points += 100000;
        that.gameover();
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
            this.gameover();
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.L)) {
            // to the goal!
            this.character.x = 700;
            this.character.y = 100;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.O)) {
            this.toggleGravity(character);
        }
    }
};

Tetra.MainGame.prototype.render = function () {
    if (this.debug) {
        this.game.debug.bodyInfo(this.character, 32, 32);
        this.game.debug.bodyInfo(this.GOAL_AREA, 32, 128);
        this.game.debug.body(this.character);
        this.game.debug.body(this.GOAL_AREA);

        this.blocks.forEachAlive(function (block) {
            block.debug();
        });
    }
};