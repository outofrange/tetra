tetra.Character = function (phaserGame, x, y) {
    var game = phaserGame;
    var that = this;

    // add sprites into group to combine legs and body...
    var char = game.add.group(null, 'character', true, true, Phaser.Physics.ARCADE);

    this.legsSprite = char.create(x, y, 'sprites', 'legs_stand');
    this.legsSprite.animations.add('walk', ['legs_walk_0', 'legs_walk_1', 'legs_walk_2', 'legs_walk_3', 'legs_walk_4',
        'legs_walk_5', 'legs_walk_4', 'legs_walk_3', 'legs_walk_2', 'legs_walk_1'], 20, true);
    this.legsSprite.animations.add('stand', ['legs_stand']);
    this.legsSprite.animations.add('jump', ['legs_jump']);
    this.legsSprite.anchor.setTo(0.5, 1);
    this.legsSprite.animations.play('walk');

    var lookingSprites = ['body_n', 'body_ne', 'body_e', 'body_se', 'body_s'];
    this.bodySprite = char.create(x, y - 64, 'sprites', lookingSprites[2]);
    this.bodySprite.anchor.setTo(0.5, 0.5);

    var direction = {
        LEFT: -1,
        NONE: 0,
        RIGHT: 1
    };

    var defaults = new function () {
        this.maxVelocity = 400;
        this.jumpVelocity = game.physics.arcade.gravity.y / 3.5;
        this.acceleration = this.maxVelocity * 3;
        this.maxVelocityBackwards = this.maxVelocity * 0.25;
        this.drag = this.maxVelocity * 2;
    };

    var properties = {
        keypressDirection: direction.NONE,
        lookingDirection: direction.RIGHT,
        accelaration: {
            set x(value) {
                char.setAll('body.acceleration.x', value);
            }
        },
        velocity: {
            get x() {
                return that.legsSprite.body.velocity.x;
            },
            set y(value) {
                char.setAll('body.velocity.y', value);
            }
        },
        maxVelocity: {
            set x(value) {
                char.setAll('body.maxVelocity.x', value);
            }
        }
    };

    char.setAll('body.collideWorldBounds', true);
    char.setAll('body.drag.x', defaults.drag);
    properties.maxVelocity.x = defaults.maxVelocity;
    
    var moveAndLook = function () {
        if (game.input.x < that.legsSprite.x) {
            properties.lookingDirection = direction.LEFT;
            char.setAll('scale.x', -1);
        } else {
            properties.lookingDirection = direction.RIGHT;
            char.setAll('scale.x', 1);
        }

        // get the positive angle between body and mouse from 0 to 180 degrees, where 0 is top and 180 is at the bottom

        //var pointerAngle = Math.abs(that.bodySprite.position.angle(game.input, true) + 90);
        var pointerAngle = (that.bodySprite.position.angle(game.input, true) + 360 + 90) % 360;
        if (pointerAngle > 180) {
            pointerAngle = 360 - pointerAngle;
        }
        // this angle is then categorized into 5 segments of the circle, to use the result as sprite index
        // we have five frames in our looking direction, starting from looking up, ending with looking down
        var segment = Math.floor(pointerAngle / 180 * 5);

        that.bodySprite.frameName = lookingSprites[segment];

        if (game.input.y < that.bodySprite.y) {
            that.bodySprite.animations.play('north');
        } else {
            that.bodySprite.animations.play('south');
        }

        // should we go left or right?
        if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            properties.keypressDirection = direction.LEFT;
            that.legsSprite.animations.play('walk');
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            properties.keypressDirection = direction.RIGHT;
            that.legsSprite.animations.play('walk');
        } else {
            properties.keypressDirection = direction.NONE;
            if (properties.velocity.x === 0) {
                that.legsSprite.animations.play('stand');
            }
        }

        // use different maxVelocity when going backwards
        if (properties.lookingDirection === properties.keypressDirection) {
            properties.maxVelocity.x = defaults.maxVelocity;
        } else if (properties.keypressDirection !== direction.NONE) {
            properties.maxVelocity.x = defaults.maxVelocityBackwards;
        }

        properties.accelaration.x = defaults.acceleration * properties.keypressDirection;

        // jump
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            if (that.legsSprite.body.onFloor()) {
                properties.velocity.y = -defaults.jumpVelocity;
            } else {
                that.legsSprite.animations.play('jump');
            }
        } else {
            that.legsSprite.animations.play('walk');
        }
    };

    this.update = function () {
        moveAndLook();

        game.camera.focusOnXY(that.legsSprite.x, that.legsSprite.y + 200);
    }
};