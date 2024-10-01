import Boundary from "./Boundary.js";
import Maze from "./Maze.js"

console.log("Starting generate")

// get root div
const rootDiv = document.getElementById('root');

// set up canvas
const canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');
var isGenerating = false;

let boundaries = [];


const drawMaze = async (width, height, wallWidth, wallTime, randomWall) => {
    // If another maze generation is already in progress, cancel it
    if (isGenerating) {
        console.log("Stopping the previous maze generation...");
        isGenerating = false;
        return;
    }
    // Start the new maze generation
    isGenerating = true;

    // give divs a grid layout
    $('#root').empty();
    $('#root').css('grid-template-columns', `repeat(${width}, 1fr)`)
    $('#root').css('grid-template-rows', `repeat(${height}, 1fr)`)
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            $('#root').append(`
                <div id="cell-${j}-${i}" style="width: ${wallWidth*2}px; height: ${wallWidth*2}px;" class="cell"></div>
            `);
        }
    }

    // setup canvas
    boundaries = [];
    canvas.width = (width * 2 + 1) * wallWidth;
    canvas.height = (height * 2 + 1) * wallWidth;
    // canvas bg white
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);

    const maze = new Maze(width, height, wallTime, randomWall);
    await maze.generateMaze(0, 0);
    // await maze.generateMaze(width / 2, height / 2);

    let map = maze.draw2DMap();
    if (isGenerating) {
        await drawCanvas(map, wallWidth, wallTime);
    }

    // Mark generation as completed
    isGenerating = false;
}


const drawCanvas = async (map, cellSize, wallTime) => {
    let map_height = map.length;
    let map_width = map[0].length;
    boundaries = [];

    for (let i = 0; i < map_height; i++) {
        for (let j = 0; j < map_width; j++) {
            if (!isGenerating) {
                console.log("Maze generation stopped.");
                return;
            }

            if (map[i][j] === 0) {
                // assign background tileset
                c.fillStyle = 'white';
                c.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            } else {
                // assign wall tileset(box)
                wallTime != 0 && await new Promise((r) => setTimeout(r, wallTime));

                const img = new Image();
                img.src = './barel.png';
                c.drawImage(
                    img,
                    j * cellSize,
                    i * cellSize
                )
                let boundary = new Boundary(
                    { x: j * cellSize, y: i * cellSize },
                    cellSize,
                    img,
                    c
                )
                boundaries.push(boundary);

                // c.fillStyle = 'white';
                // c.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
}

const animate = () => {
    window.requestAnimationFrame(animate);
    boundaries.forEach(boundary => boundary.draw());
}
animate();

$(document).ready(function () {
    $('#mazeForm').on('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        const rows = $('#rows').val();
        const columns = $('#columns').val();
        const wallWidth = $('#wallWidth').val();
        const wallTime = $('#wallTime').val();
        const randomWall = $('#randomWall').val();

        // Log the data to the console or use it as needed
        console.log('Rows:', rows);
        console.log('Columns:', columns);
        console.log('Wall Width (px):', wallWidth);
        console.log('Wall Creating Time (ms):', wallTime);
        console.log('Random Wall Open %:', randomWall);

        // Stop ongoing process if it's running
        // isGenerating = false;

        // You can now use the values to generate your maze
        drawMaze(columns, rows, wallWidth, wallTime, randomWall);
    });
});