var tetra = {};

tetra.boot = function () {
    this.preload = function () {
        // we don't need to prepreload anything right now
    };

    this.create = function () {
        console.log("Booting Tetra...");

        this.state.start('Preloader');
    }
};

tetra.style = {
    text: {
        heading: {font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"}
    }
};