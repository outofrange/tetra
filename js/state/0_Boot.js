var tetra = {};

tetra.boot = function () {
    this.preload = function () {
        console.log("Booting Tetra...");

        this.state.start('Preloader');
    };
};

tetra.style = {
    text: {
        heading: {font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"}
    }
};

Phaser.Key.prototype.toString = function () {
    return this.keyCode.toString();
};