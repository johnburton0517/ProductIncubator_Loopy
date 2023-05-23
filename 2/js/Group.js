/***************************************************************************************************
User Summary
This file does not appear to be in use. It’s intention seems to be letting a user draw “groups” 
around objects, including text, to classify sets of nodes and edges together.

Technical Summary
This file does not appear to be in use. It’s intention seems to be letting a user draw a box around 
a set of nodes, edges, and possibly labels, and “bounding” them together for classification. This is 
based on tracking (x,y) coordinates around an object [or series of objects?] and defining a new 
object-type box that the system can interact with.

***************************************************************************************************/
//Makes 7 different group color options
Group.COLORS = {
	"-1":"#000000", // black
	0: "#880000", // red
	1: "#885533", // orange
	2: "#888800", // yellow
	3: "#558800", // green
	4: "#446688", // blue
	5: "#664488", // purple
};
Group.FONTSIZE = 40;
Group._CLASS_ = "Group";

//Appears to make "groups" of objects to classify/seperate them, but doesn't appear to be in use anywhere?
function Group(model, config){

	const self = this;
	self._CLASS_ = "Group";

	// Mah Parents!
	self.loopy = model.loopy;
	self.model = model;
	self.config = config;

	// Default values...
	const defaultProperties = {
		x: 0,
			y: 0,
	};
	//Creates type index for a group
	injectedDefaultProps(defaultProperties,objTypeToTypeIndex("Group"));
	_configureProperties(self, config, defaultProperties);

	// Draws a group
	self.draw = function(ctx){
		//*Can we console.log self.visibility to see if a group is ever visible??
		//Checks if a group is meant to be visibile and whether its in play or edit mode
		if(self.visibility===1 && self.loopy.mode===Loopy.MODE_PLAY) return;
		// Retina; if group is drawn, make sure it renders correctly
		const x = self.x*2;
		const y = self.y*2;

		// DRAW HIGHLIGHT???
		//Specifically, draws a highlight around the group if its selected in the sidebar
		if(self.loopy.sidebar.currentPage.target === self){
			const bounds = self.getBounds();
			ctx.save();
			ctx.scale(2,2); // RETINA
			ctx.beginPath();
			ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
			ctx.fillStyle = HIGHLIGHT_COLOR;
			ctx.fill();
			ctx.restore();
		}

		// Translate!
		ctx.save();
		ctx.translate(x,y);

		// Text!
		//Sets text [label?] for a group
		ctx.font = "100 "+Group.FONTSIZE+"px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = Group.COLORS[self.textColor];

		// ugh new lines are a PAIN.
		//Renders and formats lines in a group as intended (using the "lines" array)
		const lines = self.breakText();
		ctx.translate(0, -(Group.FONTSIZE*lines.length)/2);
		for(let i=0; i<lines.length; i++){
			const line = lines[i];
			ctx.fillText(line, 0, 0);
			ctx.translate(0, Group.FONTSIZE);
		}

		// Restore
		ctx.restore();

	};

	//////////////////////////////////////
	// KILL Group /////////////////////////
	//////////////////////////////////////


	//Removes a group from its parent and deletes the group
	//*Should this be "parents"? Is a group unique to one object, or should it be more than 1?
	self.kill = function(){

		// Remove from parent!
		model.removeGroup(self);

		// Killed!
		publish("kill",[self]);

	};

	//////////////////////////////////////
	// HELPER METHODS ////////////////////
	//////////////////////////////////////

	//Splits text into new lines based on newline character
	self.breakText = function(){
		return self.text.split(/\n/);
	};

	//Calculates the bounds of the box that would encompass a group
	self.getBounds = function(){

		const ctx = self.model.context;

		// Get MAX width...
		const lines = self.breakText();
		let maxWidth = 0;
		for(let i=0; i<lines.length; i++){
			const line = lines[i];
			const w = (ctx.measureText(line).width + 10)*2;
			if(maxWidth<w) maxWidth=w;
		}

		// Dimensions, then:
		const w = maxWidth;
		const h = (Group.FONTSIZE*lines.length)/2;

		// Bounds, then:
		return {
			x: self.x-w/2,
			y: self.y-h/2-Group.FONTSIZE/2,
			width: w,
			height: h+Group.FONTSIZE/2
		};

	};

	//Checks whether a given coordinate is within a group box
	self.isPointInGroup = function(x, y){
		return _isPointInBox(x,y, self.getBounds());
	};

	//Gives coordinates of the bounding box used to denote a group
	//*Difference between getBounds and getBoundingBox functions??
	self.getBoundingBox = function(){
		const bounds = self.getBounds();
		return {
			left: bounds.x,
			top: bounds.y,
			right: bounds.x + bounds.width,
			bottom: bounds.y + bounds.height
		};
	};

}