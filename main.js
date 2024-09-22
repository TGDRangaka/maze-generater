import Boundary from "./Boundary.js";
import Maze from "./Maze.js"

console.log("Starting generate")

// get root div
const rootDiv = document.getElementById('root');

// set up canvas
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const width = 20;
const height = 20;
const recleWidth = 16;

canvas.width = (width * 2 + 1) * recleWidth;
canvas.height = (height * 2 + 1) * recleWidth;

// canvas bg white

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

$('#root').css('grid-template-columns', `repeat(${width}, 1fr)`)
$('#root').css('grid-template-rows', `repeat(${height}, 1fr)`)

for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
        $('#root').append(`
            <div id="cell-${j}-${i}" class="cell"></div>
        `);
    }
}

const drawMaze = async (width, height) => {
    const maze = new Maze(width, height);
    await maze.generateMaze(0, 0);
    // maze.generateMaze(width / 2, height / 2);

    let map = maze.draw2DMap();
    drawCanvas(map);
}

drawMaze(width, height);
let boundaries = [];

const drawCanvas = async (map) => {
    let map_height = map.length;
    let map_width = map[0].length;
    console.log(map_height, map_width);

    for (let i = 0; i < map_height; i++) {
        for (let j = 0; j < map_width; j++) {
            if (map[i][j] === 0) {
                // assign background tileset
                c.fillStyle = 'white';
                c.fillRect(j*recleWidth, i*recleWidth, recleWidth, recleWidth);
            } else {
                // assign wall tileset(box)
                await new Promise((r) => setTimeout(r, 3));

                const img = new Image();
                img.src = '/barel.png';
                c.drawImage(
                    img,
                    j * recleWidth,
                    i * recleWidth
                )
                let boundary = new Boundary(
                    { x: j * recleWidth, y: i * recleWidth },
                    recleWidth,
                    img,
                    c
                )
                boundaries.push(boundary);

                // c.fillStyle = 'white';
                // c.fillRect(j*recleWidth, i*recleWidth, recleWidth, recleWidth);
            }
        }
    }
}

const animate = () => {
    window.requestAnimationFrame(animate);
    boundaries.forEach(boundary => boundary.draw());
}
animate();
