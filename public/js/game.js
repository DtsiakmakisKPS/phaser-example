var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity in a top-down game
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

var player;
var platforms;
var cursors;
var socket;
var otherPlayers = {};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    // Initialize socket.io
    socket = io();

    // Handle new player on server
    socket.on('newPlayer', (players) => {
        Object.keys(players).forEach((id) => {
            if (players[id].playerId === socket.id) {
                if (!player) {
                    addPlayer(this, players[id]);
                }
            } else {
                if (!otherPlayers[players[id].playerId]) {
                    addOtherPlayer(this, players[id]);
                }
            }
        });
    });

    // Handle player movement updates from server
    socket.on('playerMoved', (data) => {
        if (otherPlayers[data.playerId]) {
            otherPlayers[data.playerId].x = data.x;
            otherPlayers[data.playerId].y = data.y;
        }
    });

    // Handle player disconnect
    socket.on('playerDisconnected', (playerId) => {
        if (otherPlayers[playerId]) {
            otherPlayers[playerId].destroy();
            delete otherPlayers[playerId];
        }
    });

    // Create the background
    this.add.image(400, 300, 'sky');

    // Platforms can be boundaries or obstacles in a top-down game
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody(); // bottom boundary
    platforms.create(400, 0, 'ground').setScale(2).refreshBody(); // top boundary
    platforms.create(0, 300, 'ground').setScale(2).refreshBody(); // left boundary
    platforms.create(800, 300, 'ground').setScale(2).refreshBody(); // right boundary

    // Define player animations (even in a top-down game)
    // Define animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20,
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
    });

    // For up and down, we will reuse the "turn" (front-facing) frame
    this.anims.create({
        key: 'up',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'down',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 10,
        repeat: -1,
    });

    // Input controls
    cursors = this.input.keyboard.createCursorKeys();

    if (player) {
        this.physics.add.collider(player, platforms);
    }
}

function update() {
    // Update player movement for a top-down game
    if (player) {
        player.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        }
        // Vertical movement (reusing the idle frame)
        else if (cursors.up.isDown) {
            player.setVelocityY(-160);
            player.anims.play('up', true);  // Reuses the "turn" frame for up movement
        } else if (cursors.down.isDown) {
            player.setVelocityY(160);
            player.anims.play('down', true);  // Reuses the "turn" frame for down movement
        }
        // If no movement keys are pressed
        else {
            player.anims.play('turn');
        }

        // Emit player movement to server
        socket.emit('playerMovement', {
            x: player.x,
            y: player.y,
            playerId: socket.id
        });
    }
}

function addPlayer(scene, playerInfo) {
    player = scene.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude').setOrigin(0.5, 0.5).setDisplaySize(32, 48);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    scene.physics.add.collider(player, platforms);
}

function addOtherPlayer(scene, playerInfo) {
    const otherPlayer = scene.physics.add
        .sprite(playerInfo.x, playerInfo.y, 'dude')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(32, 48);
    otherPlayers[playerInfo.playerId] = otherPlayer;
    scene.physics.add.collider(otherPlayer, platforms);
}
