Tetra.Character = function (game, x, y) {
    this.Defaults = new function () {
        this.MAX_VELOCITY = 400;
        this.MAX_VELOCITY_BACKWARDS = this.MAX_VELOCITY * 0.25;
        this.JUMP_VELOCITY = game.physics.arcade.gravity.y / 3.5;
        this.ACCELERATION = this.MAX_VELOCITY * 3;
        this.DRAG = this.MAX_VELOCITY * 2;
        this.SPRITE_HEIGHT = 128;
        this.CHARACTER_HEIGHT = this.SPRITE_HEIGHT - 8;
    };

    Phaser.Sprite.call(this, game, x, y + this.Defaults.SPRITE_HEIGHT / 2, null);
    this.anchor.setTo(0.5, 0.5);

    // configuring sprite physics
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(64, this.Defaults.CHARACTER_HEIGHT, 0, this.Defaults.SPRITE_HEIGHT - this.Defaults.CHARACTER_HEIGHT);
    this.body.collideWorldBounds = true;
    this.body.drag.x = this.Defaults.DRAG;
    this.body.maxVelocity.x = this.Defaults.MAX_VELOCITY;


    // adding leg sprite
    var legsSprite = game.make.sprite(0, 0, 'sprites');
    legsSprite.animations.add('walk', ['legs_walk_0', 'legs_walk_1', 'legs_walk_2', 'legs_walk_3', 'legs_walk_4',
        'legs_walk_5', 'legs_walk_4', 'legs_walk_3', 'legs_walk_2', 'legs_walk_1'], 20, true);
    legsSprite.animations.add('stand', ['legs_stand']);
    legsSprite.animations.add('jump', ['legs_jump']);
    legsSprite.anchor.setTo(0.5, 0.5);
    legsSprite.animations.play('walk');
    this.addChild(legsSprite);

    // adding body sprite
    var lookingSprites = ['body_n', 'body_ne', 'body_e', 'body_se', 'body_s'];
    var bodySprite = game.make.sprite(0, 0, 'sprites', lookingSprites[2]);
    bodySprite.anchor.setTo(0.5, 0.5);
    this.addChild(bodySprite);


    // methods to update sprites
    /**
     * Chooses correct sprite depending on angle between character and point to look at
     * @param degrees degrees between 0° (look to top) and 180° (look to bottom)
     */
    this.looking = function (degrees) {
        var segment = Math.floor(degrees / 180 * 5);

        bodySprite.frameName = lookingSprites[segment];
    };

    this.walking = function (currentlyWalking) {
        if (currentlyWalking) {
            legsSprite.animations.play('walk');
        } else {
            legsSprite.animations.play('stand');
        }
    };

    this.jumping = function (currentlyJumping) {
        if (currentlyJumping) {
            legsSprite.animations.play('jump');
        } else {
            legsSprite.animations.play('walk');
        }
    };
};

Tetra.Character.prototype = Object.create(Phaser.Sprite.prototype);
Tetra.Character.prototype.constructor = Tetra.Character;

Tetra.Character.prototype.Direction = {
    LEFT: -1,
    NONE: 0,
    RIGHT: 1
};

/**
 * Update sprites according to the mouse pointer in relation to the character.
 * @returns Tetra.Character.Direction looking direction
 */
Tetra.Character.prototype.updateLook = function () {
    // get the positive angle between body and mouse from 0 to 180 degrees, where 0 is top and 180 is at the bottom
    var pointerAngle = (this.position.angle(worldPosWrapper(this.game.input), true) + 360 + 90) % 360;
    if (pointerAngle > 180) {
        pointerAngle = 360 - pointerAngle;
    }

    this.looking(pointerAngle);

    var direction;
    if (this.game.input.x < this.x) {
        direction = this.Direction.LEFT;
        this.scale.x = -1;
    } else {
        direction = this.Direction.RIGHT;
        this.scale.x = 1;
    }

    return direction;
};

/**
 * Processes walking related input and updates sprites and velocity accordingly
 * @returns Tetra.Character.Direction walking direction
 */
Tetra.Character.prototype.updateWalk = function () {
    var direction;

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
        direction = this.Direction.LEFT;
        this.walking(true);
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
        direction = this.Direction.RIGHT;
        this.walking(true);
    } else {
        direction = this.Direction.NONE;
        if (this.body.velocity.x === 0) {
            this.walking(false);
        }
    }

    return direction;
};

/**
 * Process jump related input and update sprites and velocity accordingly
 */
Tetra.Character.prototype.updateJump = function () {
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        if (this.body.onFloor() || this.body.touching.down) {
            this.body.velocity.y = -this.Defaults.JUMP_VELOCITY;
        } else {
            this.jumping(true);
        }
    } else {
        this.jumping(false);
    }
};

Tetra.Character.prototype.update = function () {
    var lookingDirection = this.updateLook();
    var walkingDirection = this.updateWalk();

    this.body.acceleration.x = this.Defaults.ACCELERATION * walkingDirection;

    // use different maxVelocity when going backwards
    if (lookingDirection === walkingDirection) {
        this.body.maxVelocity.x = this.Defaults.MAX_VELOCITY;
    } else if (walkingDirection !== this.Direction.NONE) {
        this.body.maxVelocity.x = this.Defaults.MAX_VELOCITY_BACKWARDS;
    }

    this.updateJump();
};