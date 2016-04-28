Tetra.boot = function () {
    this.preload = function () {
        console.log('Booting Tetra...');

        this.state.start('Preloader');
    };
};

Tetra.style = {
    text: {
        heading: {font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle'},
        normal: {font: '24px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle'},
        highscore: {
            name: {font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle'},
            score: {font: 'bold 32px Arial', fill: '#fff', boundsAlignH: 'right', boundsAlignV: 'middle'}
        },
        gui: {font: '24px Arial', fill: '#000', boundsAlignH: 'center', boundsAlignV: 'middle'},
        button: {font: '24px Arial', fill: '#000', boundsAlignH: 'center', boundsAlignV: 'middle'}
    }
};

Phaser.Key.prototype.toString = function () {
    return this.keyCode.toString();
};

var worldPosWrapper = function (obj) {
    return {
        get x() {
            return obj.worldX;
        },
        get y() {
            return obj.worldY;
        }
    }
};