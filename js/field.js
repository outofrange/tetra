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

    this.add = function (elements) {
        var affectedRows = [];

        elements.forEach(function (e) {
            var top = e.y;
            var bottom = top + e.height;
            var left = e.x;
            var right = left + e.width;

            for (var i = top; i < bottom; i += that.tileSize) {
                var row = that.toTile(i) - that.y;
                affectedRows.push(row);
                for (var j = left; j < right; j += that.tileSize) {
                    fieldArray[row][that.toTile(j) - that.x] = e;
                }
            }
        });


        var removedRows = checkRows(_.sortedUniq(affectedRows));
        return removedRows;
    };

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

    this.getRow = function (y, world) {
        world = pick(world, false);

        if (world) {
            y = this.toTile(worldY) - this.y;
        }

        return fieldArray[y];
    };

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