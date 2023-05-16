/**********************************

ERASER

**********************************/

// Define the Eraser class
function Eraser(loopy){

	// Store a reference to the parent Loopy object
	const self = this;
	self.loopy = loopy;

	// Define the erase function
	self.erase = function(clicked){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!==Loopy.MODE_EDIT) return;
		if(self.loopy.tool!==Loopy.TOOL_ERASE) return;

		// Erase any nodes under the mouse
		if(Mouse.pressed || clicked){
			// the node under the mouse
			const eraseNode = loopy.model.getNodeByPoint(Mouse.x, Mouse.y);
			// if there is a node under the mouse, kill it
			if(eraseNode) eraseNode.kill();
		}

		// Erase any edges under the mouse
		if(Mouse.pressed || clicked){
			// the edge under the mouse
			const eraseEdge = loopy.model.getEdgeByPoint(Mouse.x, Mouse.y, true);
			// if there is an edge under the mouse, kill it
			if(eraseEdge) eraseEdge.kill();
		}

		// Erase any labels under the mouse
		if(Mouse.pressed || clicked){
			// the label under the mouse
			const eraseLabel = loopy.model.getLabelByPoint(Mouse.x, Mouse.y);
			// if there is a label under the mouse, kill it
			if(eraseLabel) eraseLabel.kill();
		}

	};

	// Subscribe to mouse events and call the erase function
	subscribe("mousemove",function(){
		self.erase();
	});
	// Subscribe to mouse events and call the erase function
	subscribe("mouseclick",function(){
		self.erase(true);
	});

}