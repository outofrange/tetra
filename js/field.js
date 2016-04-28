Tetra.Field = function (x, y, width, height, tilemapKey, tileSize) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.tilemapKey = tilemapKey;
    this.tileSize = pick(tileSize, 32);
    this.tileRectangle = new Phaser.Rectangle(x, y, width, height);

    var fieldArray = Tetra.Util.initArray(height, width);
    var that = this;

    /**
     * Removes a single row by destroyng all associated sprites and moving everything one row down
     * @param rowIndex the row to destroy
     */
    var removeRow = function (rowIndex) {
        fieldArray[rowIndex].forEach(function (sprite) {
            sprite.destroy();
        });

        for (var i = rowIndex; i > 0; i--) {
            that.getElementsInRow(i - 1).forEach(function (sprite) {
                // move sprite down
                sprite.y += that.tileSize;
            });

            fieldArray[i] = fieldArray[i - 1];
        }
        fieldArray[0] = Tetra.Util.initArray(that.width);
    };

    /**
     * Checks some rows if they are complete, and removing them if necessary
     * @param {Array} rows an array of rows to check
     * @returns {number} a number indicating how many rows where removed
     */
    var checkRows = function (rows) {
        rows.sort();

        var removedRows = 0;

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var spritesInRow = that.getElementsInRow(row);

            if (spritesInRow.length === width) {
                removeRow(row);
                removedRows++;
            }
        }

        return removedRows;
    };

    /**
     * Adds a block (which is a group of sprites) to the field
     * @param elements the block to add
     * @returns {number} how many rows were returned thanks to the added block
     */
    this.add = function (elements) {
        var affectedRows = [];

        elements.forEach(function (e) {
            // get world coordinates of single sprite
            var top = e.y;
            var bottom = top + e.height;
            var left = e.x;
            var right = left + e.width;

            // map coordinates to our 2D field array and associate the sprite in it
            for (var i = top; i < bottom; i += that.tileSize) {
                var row = that.toTile(i) - that.y;
                affectedRows.push(row);
                for (var j = left; j < right; j += that.tileSize) {
                    fieldArray[row][that.toTile(j) - that.x] = e;
                }
            }
        });

        return checkRows(_.sortedUniq(affectedRows));
    };

    /**
     * Removes a single sprite
     * @param e the sprite to remove
     */
    this.remove = function (e) {
        var top = e.y;
        var bottom = top + e.height;
        var left = e.x;
        var right = left + e.width;

        for (var i = top; i < bottom; i += that.tileSize) {
            var row = that.toTile(i) - that.y;
            for (var j = left; j < right; j += that.tileSize) {
                fieldArray[row][that.toTile(j) - that.x] = undefined;
            }
        }
    };

    /**
     * Returns a row of sprite / block information
     * @param y the row to return
     * @param {boolean} [world] if y is in world coordinates
     * @returns {*} an array containing information where a block is and where not
     */
    this.getRow = function (y, world) {
        world = pick(world, false);

        if (world) {
            y = this.toTile(worldY) - this.y;
        }

        return fieldArray[y];
    };

    /**
     * Returns all existing sprites in a row
     */
    this.getElementsInRow = function (y, world) {
        var row = this.getRow(y, world);

        var els = [];
        row.forEach(function (el) {
            if (el !== undefined) {
                els.push(el);
            }
        });

        return els;
    };
};

Tetra.Field.prototype.toTile = function (value) {
    return Tetra.Util.snapToGrid(value, this.tileSize) / this.tileSize;
};