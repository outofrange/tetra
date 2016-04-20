var tetra = {
    boot: {
        preload: function() {
            this.load.image('preloaderBar', 'assets/img/loader_bar.png');
            this.load.image('titleimage', 'assets/img/TitleImage.png');
        },

        create: function() {
            console.log("Booting Tetra...");
            
            this.state.start('Preloader');
        }
    }
};