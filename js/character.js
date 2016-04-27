Tetra.Character = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y + 128/2, null);
    var that = this;

    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(64, 118, 0, 10);
    this.anchor.setTo(0.5, 0.5);

    var legsSprite = game.make.sprite(0, 0, 'sprites');
    legsSprite.animations.add('walk', ['legs_walk_0', 'legs_walk_1', 'legs_walk_2', 'legs_walk_3', 'legs_walk_4',
        'legs_walk_5', 'legs_walk_4', 'legs_walk_3', 'legs_walk_2', 'legs_walk_1'], 20, true);
    legsSprite.animations.add('stand', ['legs_stand']);
    legsSprite.animations.add('jump', ['legs_jump']);
    legsSprite.anchor.setTo(0.5, 0.5);
    legsSprite.animations.play('walk');
    game.physics.enable(legsSprite, Phaser.Physics.ARCADE);
    legsSprite.body.allowGravity = false;
    this.addChild(legsSprite);


    var lookingSprites = ['body_n', 'body_ne', 'body_e', 'body_se', 'body_s'];
    var bodySprite = game.make.sprite(0, 0, 'sprites', lookingSprites[2]);
    bodySprite.anchor.setTo(0.5, 0.5);
    game.physics.enable(bodySprite, Phaser.Physics.ARCADE);
    bodySprite.body.allowGravity = false;
    this.addChild(bodySprite);
    
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
                //char.setAll('body.acceleration.x', value);
                that.body.acceleration.x = value;
            }
        },
        velocity: {
            get x() {
                return that.body.velocity.x;
            },
            set y(value) {
                that.body.velocity.y = value;
                //char.setAll('body.velocity.y', value);
            }
        },
        maxVelocity: {
            set x(value) {
                that.body.maxVelocity.x = value;//('body.maxVelocity.x', value);
            }
        }
    };

    //char.setAll('body.collideWorldBounds', true);
    this.body.collideWorldBounds = true;
    //char.setAll('body.drag.x', defaults.drag);
    this.body.drag.x = defaults.drag;
    properties.maxVelocity.x = defaults.maxVelocity;
    
    this.moveAndLook = function () {
        if (game.input.x < that.x) {
            properties.lookingDirection = direction.LEFT;
            //char.setAll('scale.x', -1);
            that.scale.x = -1;
        } else {
            properties.lookingDirection = direction.RIGHT;
            that.scale.x = 1;
            //char.setAll('scale.x', 1);
        }

        // get the positive angle between body and mouse from 0 to 180 degrees, where 0 is top and 180 is at the bottom

        //var pointerAngle = Math.abs(that.bodySprite.position.angle(game.input, true) + 90);
        var pointerAngle = (that.position.angle(worldPosWrapper(game.input), true) + 360 + 90) % 360;
        if (pointerAngle > 180) {
            pointerAngle = 360 - pointerAngle;
        }
        // this angle is then categorized into 5 segments of the circle, to use the result as sprite index
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
            legsSprite.animations.play('walk');
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            properties.keypressDirection = direction.RIGHT;
            legsSprite.animations.play('walk');
        } else {
            properties.keypressDirection = direction.NONE;
            if (properties.velocity.x === 0) {
                legsSprite.animations.play('stand');
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
            if (that.body.onFloor() || that.body.touching.down) {
                that.body.velocity.y = -defaults.jumpVelocity;
            } else {
                legsSprite.animations.play('jump');
            }
        } else {
            legsSprite.animations.play('walk');
        }
    };
};

Tetra.Character.prototype = Object.create(Phaser.Sprite.prototype);
Tetra.Character.prototype.constructor = Tetra.Character;

Tetra.Character.prototype.update = function () {
    this.moveAndLook();
};