Tetra.Boot = function () {
    this.preload = function () {
        console.log('Booting Tetra...');

        this.state.start('Preloader');
    };
};