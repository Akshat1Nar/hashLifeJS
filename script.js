pixelPoints = []; // A list of points that need to be drawn on screen
pixelSize = 5;    // Size of individual pixel
pixelColor = black = { r:0, g:0, b:0, a:255 }; // Standard Color of pixel
numberOfGenerationsPerStep = 1; // Number of generations to move per step

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// flag for mouse click and drag event
let canvasMouseFlag = false;

// convert the coordinates to 2 element list
function getCoordinates(page) {
	return [page.pageX - page.pageX % pixelSize,
		page.pageY - page.pageY % pixelSize];
}

// on mouse press do this 
function onMouseDown(page) {
	canvasMouseFlag = true;
}

// on mouse release do this
function onMouseUp(page) {
	canvasMouseFlag = false;
	
	// set all the pixels as imagedat
	for (let i = 0; i < pixelPoints.length; i++) {
		let alpha = 1 
		ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
		ctx.fillRect(pixelPoints[i][0], pixelPoints[i][1],
				pixelSize, pixelSize);
	}
		
}

// on mouse move do this
function onMouseMove(page) {
	
	// if mouse is pressed
	if(canvasMouseFlag == true) {
		// console.log(getCoordinates(page));
		pixelPoints.push(getCoordinates(page));
	}
}

// function to keep the flow of the app going
function manage() {
	
	running = true; // flag that marks if software is running

	while (running) {
		// contruct a quadtree from given points
		quadtree = construct(pixelPoints);
		running = false;
	}
}
	

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mousemove', onMouseMove);
manage();


