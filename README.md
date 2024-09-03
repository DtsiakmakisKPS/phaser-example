# phaser-example
Very basic multiplayer online game example made with Phaser, Node.js and Socket.io. <br />
This game for now currently runs on your local network. The purpose of this game was only educational and to develop skills for KPS Hackathon 2024.

## Installing and running the game

Phaser V3 is already included in the index.html as a head `<script>` tag. <br />
`<script src="//cdn.jsdelivr.net/npm/phaser@3.11.0/dist/phaser.js"></script>`

- Clone the repository 
- run `npm install` to download the required packages. (express, socket.io)
- run `npm run start` to start the server locally and will run on port `localhost:3000`. You can access the server on your local network by using your IP address instead of `localhost`

## Credits
The following tutorial was used to figure how to make the game multiplayer by using Socket.io and express.  [How to make a multiplayer online game with Phaser, Socket.io and Node.js](http://www.dynetisgames.com/2017/03/06/how-to-make-a-multiplayer-online-game-with-phaser-socket-io-and-node-js/). <br />
The following tutorial was used to build the Phaser V3 game. All assets and basic setup of the game came from here [Making your first Phaser 3 game](https://phaser.io/tutorials/making-your-first-phaser-3-game/part1). <br />
