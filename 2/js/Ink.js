/**********************************

When the user clicks the Pencil Tool in the Toolbar on the left 
side of the screen or presses N on the keyboard the Pencil tool 
is selected. Users can connect nodes to each other by drawing a 
line between 2 nodes or can create a new node by drawing a circle.

The Ink function initially creates a 2D rendering context of the 
screen so that the user can draw and initializes an array called 
strokeData that tracks. It has a class method called drawInk that
draws the line that the user drew on the screen. It also contains 
a reset function that clears the canvas and resets the strokeData 
array. If the mouse is pressed and the program is in Ink mode, the 
code calls the drawInk function. When the mouse is released, the 
code either creates a new arrow if the user started and ended 
drawing in a node or creates a new node otherwise. The program 
then calls the reset function. There is a helper function called 
areWeInkEditing that ensures that Loopy is in edit mode. 


**********************************/

// Set the minimum radius for ink drawing
Ink.MINIMUM_RADIUS = LoopyNode.DEFAULT_RADIUS;
Ink.SNAP_TO_RADIUS = 25;

function Ink(loopy){

	const self = this;
	self.loopy = loopy;

	// Create html canvas & context
	const canvas = _createCanvas();
	const ctx = canvas.getContext("2d");
	self.canvas = canvas;
	self.context = ctx;

	// Stroke data
	self.strokeData = [];

	// Draws ink strokes from strokeData
	self.drawInk = function(){

		if(!Mouse.pressed) return;

		// Get hte last point of where the mouse drew to
		const lastPoint = self.strokeData[self.strokeData.length-1];

		// Style settings for drawing
		ctx.save()
		ctx.strokeStyle = "#ccc";
		ctx.lineWidth = 5;
		ctx.lineCap = "round";

		// Draw a line from the last point to the current point
		applyZoomTransform(ctx);
		ctx.beginPath();
		ctx.moveTo(lastPoint[0]*2, lastPoint[1]*2);
		ctx.lineTo(Mouse.x*2, Mouse.y*2);
		ctx.stroke();
		ctx.restore();

		// Update the last point
		self.strokeData.push([Mouse.x,Mouse.y]);

	};

	//removes initial ink drawing (the actual line the mouse drew) from screen 
	self.reset = function(){
		ctx.clearRect(0,0,canvas.width,canvas.height); // Clear canvas
		self.strokeData = []; // Reset stroke data
	};

	// When the mouse is pressed down, add the mouse movements to the strokedata array
	subscribe("mousedown",function(){
		if(!areWeInkEditing()) return;

		// New stroke data
		self.strokeData = [];
		self.strokeData.push([Mouse.x,Mouse.y]);

		// Draw the ink stroke to the canvas 
		self.drawInk();

	});
	
	
	// If the mouse is moving, draw 
	// TODO: not sure if this function actually does antthing

	subscribe("mousemove",function(){
		if(!areWeInkEditing()) return;
		self.drawInk();
	});

	// When the user lets go of the mouse down, determine if a node or edge 
	// needs to be added and add it
	subscribe("mouseup",function(){
		if(!areWeInkEditing()) return;

		if(self.strokeData.length<2) return;
		if(!Mouse.moved) return;

		/*************************
		
		Detect what you drew!
		1. Started in a node?
		1a. If ended near/in a node, it's an EDGE.
		2. If not, it's a NODE. 

		*************************/

		// Check if the stroke started in a node
		const startPoint = self.strokeData[0];
		let startNode = loopy.model.getNodeByPoint(startPoint[0], startPoint[1]);
		if(!startNode) startNode=loopy.model.getNodeByPoint(startPoint[0], startPoint[1], 20); // try again with buffer

		// Check if the stroke ended in a node
		const endPoint = self.strokeData[self.strokeData.length-1];
		let endNode = loopy.model.getNodeByPoint(endPoint[0], endPoint[1]);
		if(!endNode) endNode=loopy.model.getNodeByPoint(endPoint[0], endPoint[1], 40); // try again with buffer

		// EDGE: started AND ended in nodes
		if(startNode && endNode){

			// Configure the new edge
			let edgeConfig = {
				from: startNode.id,
				to: endNode.id
			};

			/* 
			If it's the same node its the same node and the ink is too small,
			assume the user was trying to edit the node and open editing tool.
			Otherwise, continue 
			*/
			if(startNode===endNode){

				// TODO: clockwise or counterclockwise???
				// TODO: if the arc DOES NOT go beyond radius, don't make self-connecting edge. also min distance.

				// Find rotation first by getting average point
				let bounds = _getBounds(self.strokeData);
				const x = (bounds.left+bounds.right)/2;
				const y = (bounds.top+bounds.bottom)/2;
				const dx = x-startNode.x;
				const dy = y-startNode.y;
				const angle = Math.atan2(dy,dx);

				// Then, find arc height.
				const translated = _translatePoints(self.strokeData, -startNode.x, -startNode.y);
				const rotated = _rotatePoints(translated, -angle);
				bounds = _getBounds(rotated);

				// Arc & Rotation
				edgeConfig.rotation = angle*(360/Math.TAU) + 90;
				edgeConfig.arc = bounds.right;

				// ACTUALLY, IF THE ARC IS *NOT* GREATER THAN THE RADIUS, DON'T DO IT.
				// (and otherwise, make sure minimum distance of radius+25)
				if(edgeConfig.arc < startNode.radius){
					edgeConfig=null;
					loopy.sidebar.edit(startNode); // you were probably trying to edit the node
				}else{
					const minimum = startNode.radius+25;
					if(edgeConfig.arc<minimum) edgeConfig.arc=minimum;
				}

			}else{

				// Translate and rotate to determine the arc
				const dx = endNode.x-startNode.x;
				const dy = endNode.y-startNode.y;
				const angle = Math.atan2(dy,dx);
				const translated = _translatePoints(self.strokeData, -startNode.x, -startNode.y);
				const rotated = _rotatePoints(translated, -angle);
				const bounds = _getBounds(rotated);
				
				// Calculate the arc
				if(Math.abs(bounds.top)>Math.abs(bounds.bottom)) edgeConfig.arc = -bounds.top;
				else edgeConfig.arc = -bounds.bottom;

			}

			// Create the new edge between the node(s)
			if(edgeConfig){
				const newEdge = loopy.model.addEdge(edgeConfig);
				loopy.sidebar.edit(newEdge);
			}

		}

		// If the drawing did not start in a node, draw a new node
		if(!startNode){

			// Make a circle the size of the bounds of the ink
			const bounds = _getBounds(self.strokeData);
			const x = (bounds.left+bounds.right)/2;
			const y = (bounds.top+bounds.bottom)/2;
			let r = ((bounds.width/2)+(bounds.height/2))/2;

			// Circle can't be TOO smol
			if(r>15){

				// Snap to radius
				/*r = Math.round(r/Ink.SNAP_TO_RADIUS)*Ink.SNAP_TO_RADIUS;
				if(r<Ink.MINIMUM_RADIUS) r=Ink.MINIMUM_RADIUS;*/

				// LOCK TO JUST SMALLEST CIRCLE.
				r = Ink.MINIMUM_RADIUS;

				// Make that node!
				const newNode = loopy.model.addNode({
					x:x,
					y:y,
					radius:r
				});

				// Edit it immediately
				loopy.sidebar.edit(newNode);

			}

		}

		// Reset
		self.reset();

	});

	// When mouse is clicked but not pressed, reset
	subscribe("mouseclick",function(){
		if(!areWeInkEditing()) return;
		self.reset();
	});

	// Helper function 
	const areWeInkEditing = () => self.loopy.mode===Loopy.MODE_EDIT && self.loopy.tool===Loopy.TOOL_INK;

}