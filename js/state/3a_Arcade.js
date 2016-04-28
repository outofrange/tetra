Tetra.arcade = function () {
    var debug = false;

    var character = null;
    var map = null;
    var layer = null;

    var levelInfo = {
        tileWidth: 32,
        blockArea: {
            tiles: new Phaser.Rectangle(8, 0, 10, 39)
        }
    };
    levelInfo.blockArea.coord = (function () {
        var r = levelInfo.blockArea.tiles;
        var w = levelInfo.tileWidth;
        new Phaser.Rectangle(r.x * w, r.y * w, r.width * w, r.height * w);
    })();

    var GOAL_AREA;

    var playingField;

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

    var points = 0;
    var pointsText = function () {
        return 'Points: ' + points;
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

    var addBlock, blocks, bullets, text, music;

    this.gameover = function () {
        console.log('DEAD');
        music.stop();
        this.state.start('Highscore', true, false, points);
    };

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

        points = 0;

        console.log('Creating Arcade level');
        
        playingField = new Tetra.Field(8, 0, 10, 39, 32);

        music = that.sound.add('ozzed_fighter', 1, true);
        music.loop = true;
        music.play();

        blocks = this.add.group(this.world, 'blocks');

        addBlock = function () {
            var elapsedMs = that.time.events.ms;
            var newBlock = new Tetra.Block(this, blocks, levelInfo.blockArea.tiles, calcFallingSpeed(elapsedMs), layer);
            blocks.add(newBlock);

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

        character = new Tetra.Character(this, 2 * levelInfo.tileWidth, this.world.height - 5 * levelInfo.tileWidth);
        this.add.existing(character);

        this.time.events.add(blockGapMaxMs, addBlock, this);

        bullets = this.add.group(this.world, 'bullets', false, true, Phaser.Physics.ARCADE);

        // we have to bind shoot to our Phaserish 'this', otherwise there are some weird problems...
        // just passing this and accessing all stuff with this.foo doesn't work)
        shoot = _.bind(shoot, this);

        var margin = 10;
        var graphics = this.add.graphics(0, 0);
        graphics.fixedToCamera = true;
        graphics.cameraOffset = new Phaser.Point(margin, margin + levelInfo.tileWidth);
        graphics.beginFill(0xA1A1A1, 0.8);
        graphics.drawRoundedRect(0, 0, 8 * levelInfo.tileWidth - 2 * margin, 5 * levelInfo.tileWidth - 2 * margin, 5);

        text = this.add.text(0, 0, pointsText(), Tetra.style.text.gui);
        text.fixedToCamera = true;
        text.cameraOffset = graphics.cameraOffset.clone().add(margin, margin);

        //this.camera.setBoundsToWorld();
        this.camera.follow(character);

        GOAL_AREA = this.add.sprite(18 * levelInfo.tileWidth, levelInfo.tileWidth, null);
        this.physics.enable(GOAL_AREA, Phaser.Physics.ARCADE);
        GOAL_AREA.body.setSize(6 * levelInfo.tileWidth, 6 * levelInfo.tileWidth);
    };

    var stopBlock = function (block) {
        // could be called multiple times for a single block formation
        if (block.falling) {
            block.stop();
            points += block.totalParts() * 100;
            
            // adding all block parts to field
            var removedRows = playingField.add(block.children);
            points += removedRows * 5000;
        }
    };

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

                playingField.remove(blockPart);

                if (blockPart.body.velocity.y === 0) {
                    points -= 200;
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
            that.gameover();
        });

        if (this.input.keyboard.isDown(Phaser.Keyboard.COMMA)) {
            debug = true;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.PERIOD)) {
            debug = false;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.M)) {
            this.gameover();
        }
    };

    this.render = function () {
        if (debug) {
            g.debug.bodyInfo(character, 32, 32);
            g.debug.body(character);

            blocks.forEachAlive(function (block) {
                block.debug();
            })
        }
    };
};


