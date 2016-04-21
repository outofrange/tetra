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

    var bullets;

    this.create = function () {
        var that = this;

        console.log('Creating Arcade level');

        var music = that.sound.add('ozzed_fighter', 1, true);
        music.loop = true;
        music.play();

        addBlock = function () {
            var elapsedMs = that.time.events.ms;
            var newBlock = new tetra.Block(this, 8, 18, calcFallingSpeed(elapsedMs), layer);
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

        character = new tetra.Character(this, 64, 768);

        this.time.events.add(blockGapMaxMs, addBlock, this);

        bullets = this.add.group(null, 'bullets', true, true, Phaser.Physics.ARCADE);
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
        });

        this.physics.arcade.collide(character.legsSprite, layer);
        this.physics.arcade.collide(character.bodySprite, layer);

        character.update();
        
        if (this.input.activePointer.justPressed(200)) {
            var bullet = bullets.create(character.bodySprite.x, character.bodySprite.y, 'sprites', 'bullet');
            bullet.anchor.setTo(0.5, 0.5);
            bullet.body.allowGravity = false;

            var angle = character.bodySprite.position.angle(this.input, true);
            this.physics.arcade.velocityFromAngle(angle, 1500, bullet.body.velocity);

            console.log(character.bodySprite.position.angle(this.input));

        }
    };
};


