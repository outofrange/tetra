Tetra.arcade = function () {
    var debug = false;

    // "environment"
    var map, layer, field, music;
    
    // groups & sprites & text
    var character, bullets, blocks, GOAL_AREA, text;
    
    // methods
    var addBlock;

    var blockGapMaxMs = 4000;
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

    var pointsText = function () {
        return 'Points: ' + Tetra.Player.arcade.points;
    };

    var blockFallingSpeedMin = 100;
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

    this.gameover = function () {
        music.stop();
        this.state.start('Highscore', true, false, !debug ? Tetra.Player.arcade.points : 0);
    };

    var shoot = _.throttle(function () {
        var bullet = bullets.getFirstDead(true, character.x, character.y, 'sprites', 'bullet');
        bullet.anchor.setTo(0.5, 0.5);
        bullet.body.allowGravity = false;
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;

        var angle = character.position.angle(wrapWorldPosition(this.input), true);
        this.physics.arcade.velocityFromAngle(angle, 1500, bullet.body.velocity);
    }, 200, {trailing: false});

    this.create = function () {
        var that = this;

        Tetra.Player.arcade.points = 0;

        console.log('Creating Arcade level');
        console.log('Name: ' + Tetra.Player.name);
        
        field = new Tetra.Field(8, 0, 10, 39, 32);

        music = that.sound.add('ozzed_fighter', 1, true);
        music.loop = true;
        music.play();

        blocks = this.add.group(this.world, 'blocks');

        addBlock = function () {
            var elapsedMs = that.time.events.ms;
            var newBlock = new Tetra.Block(this, blocks, field.tileRectangle, calcFallingSpeed(elapsedMs), layer);
            blocks.add(newBlock);

            var delayMs = calcBlockGap(elapsedMs);

            that.time.events.add(delayMs, addBlock, that);
        };

        this.stage.backgroundColor = '#fff';

        map = this.add.tilemap('map_xl');
        map.addTilesetImage('kachel', 'tiles');
        layer = map.createLayer('Layer 1');
        layer.resizeWorld();
        map.setCollision(1);


        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 1500;
        this.physics.arcade.sortDirection = Phaser.Physics.Arcade.BOTTOM_TOP;

        character = new Tetra.Character(this, 2 * field.tileSize, this.world.height - 5 * field.tileSize);
        this.add.existing(character);

        this.time.events.add(blockGapMaxMs, addBlock, this);

        bullets = this.add.group(this.world, 'bullets', false, true, Phaser.Physics.ARCADE);

        // we have to bind shoot to our Phaserish 'this', otherwise there are some weird problems...
        // just passing this and accessing all stuff with this.foo doesn't work)
        shoot = _.bind(shoot, this);

        var margin = 10;
        var graphics = this.add.graphics(0, 0);
        graphics.fixedToCamera = true;
        graphics.cameraOffset = new Phaser.Point(margin, margin + field.tileSize);
        graphics.beginFill(0xA1A1A1, 0.8);
        graphics.drawRoundedRect(0, 0, 8 * field.tileSize - 2 * margin, 5 * field.tileSize - 2 * margin, 5);

        text = this.add.text(0, 0, pointsText(), Tetra.style.text.gui);
        text.fixedToCamera = true;
        text.cameraOffset = graphics.cameraOffset.clone().add(margin, margin);

        this.camera.follow(character);
        this.camera.deadzone = new Phaser.Rectangle(0, 800 - (32 * 6), 800, 32);

        GOAL_AREA = this.add.sprite(18 * field.tileSize, field.tileSize, null);
        this.physics.enable(GOAL_AREA, Phaser.Physics.ARCADE);
        GOAL_AREA.body.setSize(6 * field.tileSize, 6 * field.tileSize);
        GOAL_AREA.body.allowGravity = false;
    };

    var stopBlock = function (block) {
        // could be called multiple times for a single block formation
        if (block.falling) {
            block.stop();
            Tetra.Player.arcade.points += block.totalParts() * 100;
            
            // adding all block parts to field
            var removedRows = field.add(block.children);
            Tetra.Player.arcade.points += removedRows * 5000;
        }
    };

    var toggleGravity = _.debounce(function (sprite) {
        sprite.body.allowGravity = !sprite.body.allowGravity;
    }, 50);

    this.update = function () {
        var that = this;

        // collision checks
        blocks.forEachAlive(function (block) {
            that.physics.arcade.collide(character, block, function (character) {
                if (block.falling && character.body.touching.up) {
                    character.kill();

                    that.gameover();
                }
            });

            if (block.falling) {
                that.physics.arcade.collide(block, layer, function () {
                    stopBlock(block);
                });

                blocks.forEachAlive(function (otherBlock) {
                    if (!otherBlock.falling && block !== otherBlock) {
                        that.physics.arcade.collide(block, otherBlock, function () {
                            stopBlock(block);
                        });
                    }
                });
            }

            that.physics.arcade.collide(bullets, block, function (bullet, blockPart) {
                bullet.kill();

                field.remove(blockPart);

                if (blockPart.body.velocity.y === 0) {
                    Tetra.Player.arcade.points -= 200;
                }
                blockPart.destroy();
            });
        });

        this.physics.arcade.collide(character, layer);

        this.physics.arcade.collide(bullets, layer, function (bullet) {
            bullet.kill();
        });


        // shooting bullets
        if (this.input.activePointer.leftButton.isDown) {
            shoot();
        }

        text.text = pointsText();

        this.physics.arcade.overlap(GOAL_AREA, character, function () {
            console.log('Goal!');
            Tetra.Player.arcade.points += 100000;
            that.gameover();
        });

        // debug keys
        if (this.input.keyboard.isDown(Phaser.Keyboard.COMMA)) {
            debug = true;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.PERIOD)) {
            debug = false;
            Tetra.Player.arcade.points = 0;
        }
        if (debug) {
            if (this.input.keyboard.isDown(Phaser.Keyboard.M)) {
                this.gameover();
            } else if (this.input.keyboard.isDown(Phaser.Keyboard.L)) {
                // to the goal!
                character.x = 700;
                character.y = 100;
            } else if (this.input.keyboard.isDown(Phaser.Keyboard.O)) {
                toggleGravity(character);
            }
        }
    };

    this.render = function () {
        if (debug) {
            g.debug.bodyInfo(character, 32, 32);
            g.debug.bodyInfo(GOAL_AREA, 32, 128);
            g.debug.body(character);
            g.debug.body(GOAL_AREA);

            blocks.forEachAlive(function (block) {
                block.debug();
            });
        }
    };
};


