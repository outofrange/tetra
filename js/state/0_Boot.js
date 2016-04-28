Tetra.boot = function () {
    this.preload = function () {
        console.log('Booting Tetra...');

        this.state.start('Preloader');
    };
};