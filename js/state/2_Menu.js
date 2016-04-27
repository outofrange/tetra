Tetra.menu = function () {
    this.create = function () {
        console.log('Creating menu');
    };

    this.update = function () {
        this.state.start('Arcade');
    };
};


