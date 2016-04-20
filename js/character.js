tetra.Character = function (phaserGame) {
    var game = phaserGame;

    // add sprites into group to combine legs and body...
    var char = game.add.group(null, 'character', true, true, Phaser.Physics.ARCADE);

    var legsSprite = char.create(0, game.world.height, 'sprites', 'legs_stand');
    legsSprite.animations.add('walk', ['legs_walk_0', 'legs_walk_1', 'legs_walk_2', 'legs_walk_3', 'legs_walk_4',
        'legs_walk_5', 'legs_walk_4', 'legs_walk_3', 'legs_walk_2', 'legs_walk_1'], 20, true);
    legsSprite.animations.add('stand', ['legs_stand']);
    legsSprite.animations.add('jump', ['legs_jump']);
    legsSprite.anchor.setTo(0.5, 0.5);
    legsSprite.animations.play('walk');

    var lookingSprites = ['body_n', 'body_ne', 'body_e', 'body_se', 'body_s'];
    var bodySprite = char.create(0, game.world.height, 'sprites', lookingSprites[2]);
    bodySprite.anchor.setTo(0.5, 0.5);

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
            set y(value) {
                char.setAll('body.velocity.y', value);
            }
        },
        maxVelocity: {
            set x(value) {
                char.setAll('body.maxVelocity.x', value);
            }
        },
        get jumping() {
            return legsSprite.body.velocity.y < 0;
        },
        get falling() {
            return legsSprite.body.velocity.y > 0;
        },
        get standingStill() {
            return legsSprite.body.velocity.x === 0 && legsSprite.body.velocity.y === 0;
        }
    };

    char.setAll('body.collideWorldBounds', true);
    char.setAll('body.drag.x', defaults.drag);
    properties.maxVelocity.x = defaults.maxVelocity;

    var moveAndLook = function () {
        if (game.input.x < legsSprite.x) {
            properties.lookingDirection = direction.LEFT;
            char.setAll('scale.x', -1);
        } else {
            properties.lookingDirection = direction.RIGHT;
            char.setAll('scale.x', 1);
        }

        // get the positive angle between body and mouse from 0 to 180 degrees
        // this angle is then categorized into 5 segments of the circle, to use the result as sprite index
        var pointerAngle = Math.abs(bodySprite.position.angle(game.input, true) + 90);
        // we have five frames in our looking direction, starting from looking up, ending with looking down
        var segment = Math.floor(pointerAngle / 180 * 5);

        bodySprite.frameName = lookingSprites[segment];

        if (game.input.y < bodySprite.y) {
            bodySprite.animations.play('north');
        } else {
            bodySprite.animations.play('south');
        }

        // should we go left or right?
        if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            properties.keypressDirection = direction.LEFT;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            properties.keypressDirection = direction.RIGHT;
        } else {
            properties.keypressDirection = direction.NONE;
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
            legsSprite.animations.play('jump');
            if (legsSprite.body.onFloor()) {
                properties.velocity.y = -defaults.jumpVelocity;
            }
        } else {
            legsSprite.animations.play('walk');
        }
    };

    this.update = function () {
        moveAndLook();
    }
};