// adapted from https://jsfiddle.net/q7up5erh/2/

Tetra.Button = function (game, x, y, width, height, text, style) {
    var defaultStyle = {
        buttonText: {font: "30px Arial", fill: "#000", boundsAlignH: 'center', boundsAlignV: 'middle'},
        shadowColour: 0xFF0000,
        fillColour: 0xFFFFFF
    };
    style = pick(style, defaultStyle);

    var texture = new Phaser.Graphics(game)
        .beginFill(style.shadowColour, 0.5)
        .drawRoundedRect(0, 4, width, height, 5)
        .endFill()
        .beginFill(style.fillColour, 1)
        .drawRoundedRect(0, 0, width, height, 5)
        .endFill()
        .generateTexture();

    var textureHover = new Phaser.Graphics(game)
        .beginFill(style.fillColour, 1)
        .drawRoundedRect(0, 4, width, height, 5)
        .endFill()
        .generateTexture();

    Phaser.Image.call(this, game, x, y, texture);
    var that = this;

    var textObj = this.game.make.text(0, 0, text, style.buttonText);
    textObj.setTextBounds(0, 0, width, height);


    this.addChild(textObj);
    //this.anchor.setTo(0.5, 0.5);

    this.inputEnabled = true;

    // doesn't work right now :(
    //this.input.useHandCursor = true;


    this.events.onInputOver.add(function () {
        that.setTexture(textureHover);
        textObj.y = 2;
    }, this);
    this.events.onInputOut.add(function () {
        that.setTexture(texture);
        textObj.y = 0;
    }, this);
};

Tetra.Button.prototype = Object.create(Phaser.Image.prototype);
Tetra.Button.prototype.constructor = Tetra.Button;

Tetra.Button.prototype.setOnClick = function (callback, context) {
    this.events.onInputDown.add(callback, pick(context, this));
};