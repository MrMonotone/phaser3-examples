var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1affdd',
    parent: 'phaser-example',
    pixelArt: true,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var p1 = null;
var p2 = null;
var map;
var controls;
var graphics;
var selectedShape = 'triangle';
var onlyColliding = false;

function preload ()
{
    this.load.tilemapJSON('map', 'assets/tilemaps/maps/cybernoid.json');
    this.load.image('cybernoid', 'assets/tilemaps/tiles/cybernoid.png');
}

function create ()
{
    map = this.add.tilemap('map');
    var tiles = map.addTilesetImage('cybernoid');
    var layer = map.createDynamicLayer(0, tiles);

    graphics = this.add.graphics({
        lineStyle: { width: 2, color: 0xa8fff2 },
        fillStyle: { color: 0xa8fff2 }
    });

    map.setCollisionByExclusion(7);

    this.input.keyboard.events.on('KEY_DOWN_ONE', function (event) {
        selectedShape = "rectangle";
    });

    this.input.keyboard.events.on('KEY_DOWN_TWO', function (event) {
        selectedShape = "line";
    });

    this.input.keyboard.events.on('KEY_DOWN_THREE', function (event) {
        selectedShape = "circle";
    });

    this.input.keyboard.events.on('KEY_DOWN_FOUR', function (event) {
        selectedShape = "triangle";
    });

    this.input.keyboard.events.on('KEY_DOWN_C', function (event) {
        onlyColliding = !onlyColliding;
        helpText.setText(getHelpMessage());
    });

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    var cursors = this.input.keyboard.createCursorKeys();
    var controlConfig = {
        camera: this.cameras.main,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        speed: 0.5
    };
    controls = this.cameras.addKeyControl(controlConfig);

    var textBg = this.add.graphics();
    var helpText = this.add.text(16, 16, getHelpMessage(), {
        font: '20px Arial',
        fill: '#ffffff'
    });
    helpText.setScrollFactor(0);
    textBg.fillStyle(0x000000, 0.92)
        .fillRect(0, 0, helpText.width + 40, helpText.height + 40)
        .setScrollFactor(0);
}

function update (time, delta)
{
    controls.update(delta);

    // Update p1 & p2 based on where user clicks
    if (this.game.input.activePointer.justDown)
    {
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        if (!p1)
        {
            p1 = worldPoint.clone();
        }
        else if (!p2)
        {
            p2 = worldPoint.clone();
        }
        else
        {
            p1 = worldPoint.clone();
            p2 = null;
        }
    }

    graphics.clear();

    // Show user where they clicked
    if (p1) { graphics.fillCircle(p1.x, p1.y, 3); }
    if (p2) { graphics.fillCircle(p2.x, p2.y, 3); }

    // If we have both points, draw a shape and manipulate the tiles in that shape
    if (p1 && p2)
    {
        map.forEachTile(function (tile) { tile.alpha = 1; });

        var overlappingTiles = [];

        switch (selectedShape)
        {
            case 'rectangle':
                var xStart = Math.min(p1.x, p2.x);
                var yStart = Math.min(p1.y, p2.y);
                var xEnd = Math.max(p1.x, p2.x);
                var yEnd = Math.max(p1.y, p2.y);
                var rect = new Phaser.Geom.Rectangle(xStart, yStart, xEnd - xStart, yEnd - yStart);
                overlappingTiles = map.getTilesWithinShape(rect, { isColliding: onlyColliding });
                graphics.strokeRectShape(rect);
                break;
            case 'line':
                var line = new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y);
                overlappingTiles = map.getTilesWithinShape(line, { isColliding: onlyColliding });
                graphics.strokeLineShape(line);
                break;
            case 'circle':
                var radius = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) / 2;
                var cx = (p1.x + p2.x) / 2;
                var cy = (p1.y + p2.y) / 2;
                var circle = new Phaser.Geom.Circle(cx, cy, radius);
                overlappingTiles = map.getTilesWithinShape(circle, { isColliding: onlyColliding });
                graphics.strokeCircleShape(circle);
                break;
            case 'triangle':
                var tri = new Phaser.Geom.Triangle(p1.x, p1.y, p1.x, p2.y, p2.x, p2.y);
                overlappingTiles = map.getTilesWithinShape(tri, { isColliding: onlyColliding });
                graphics.strokeTriangleShape(tri);
                break;
            default:
                break;
        }

        overlappingTiles.forEach(function (tile) { tile.alpha = 0.25; });
    }

}

function getHelpMessage ()
{
    return 'Press 1/2/3/4 to change shapes.' +
        '\nPress C to only select colliding tiles: ' + (onlyColliding ? 'on' : 'off') +
        '\nArrows to scroll.';
}

