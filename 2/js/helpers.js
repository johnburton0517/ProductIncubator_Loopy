/***************************************************************************************************
User Summary
This file includes several different features that set up and allow the Loopy page to run, 
including things like buttons, labels, mouse movements, and the Loopy environment itself. While a 
user does not directly interact with the functions in this file, these functions drive all 
characteristics of the page that the user does interact with.

Technical Summary
This file houses several different helper functions that are called on to load in the interface, 
interactive objects, mouse functionality, etc. One function defines whether an instance is being 
accessed on an Apple product and configures the environment accordingly. Another handles saving 
changes to a workspace and helping them reload across separate pageloads.

***************************************************************************************************/

Math.TAU = Math.PI*2;

HIGHLIGHT_COLOR = "rgba(193, 220, 255, 0.6)";

//Checks whether the device Loopy is loaded from is an Apple device
if(typeof navigator === "undefined") navigator = {platform:""};
const isMacLike = !!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i);

const _PADDING = 25;
let _PADDING_BOTTOM = 110;

//Handles browser window resizing
onresize = function(){
	publish("resize");
};

/*This checks for unsaved changes before exiting a page
  If loopy.dirty is true, there are unsaved changes and the dialog box triggers
  If loopy.dirty is false, there are no unsaved changes and the page closes
*/
onbeforeunload = function(e) {
	if(loopy.dirty){
		const dialogText = "Are you sure you want to leave without saving your changes?";
		e.returnValue = dialogText;
		return dialogText;
	}
};

//Creates the blank canvas Loopy operates on
function _createCanvas(){

	const canvasses = document.getElementById("canvasses");
	const canvas = document.createElement("canvas");

	// Sets dimensions of the canvas
	const _onResize = function(){
		const width = canvasses.clientWidth;
		const height = canvasses.clientHeight;
		canvas.width = width*2; // retina
		canvas.style.width = width+"px";
		canvas.height = height*2; // retina
		canvas.style.height = height+"px";
	};
	_onResize();

	// Add to body!
	canvasses.appendChild(canvas);

	// subscribe to RESIZE
	subscribe("resize",function(){
		_onResize();
	});

	// Produces the canvas that has been built out throughout the function
	return canvas;

}

//Creates a label message that links to an HTML document giving more info about a feature
function _createLabel(message){
	const wrapper = document.createElement("div");

	const label = document.createElement("div");
	label.setAttribute("class","component_label");
	label.innerHTML = message;
	const doc = document.createElement("a");
	doc.classList.add("docLink");
	doc.title='Know more about this feature';
	doc.innerHTML = '?'; // (O.ô) *help *doc *what? *more *know more *how? || how?
	wrapper.appendChild(doc);
	wrapper.appendChild(label);
	return wrapper;
}

//Creates a button on the loopy page
function _createButton(label, onclick){
	const button = document.createElement("div");
	button.innerHTML = label;
	button.onclick = onclick;
	button.setAttribute("class","component_button");
	return button;
}

//Holding ground for creating inputs
function _createInput(className, textarea){
	const input = textarea ? document.createElement("textarea") : document.createElement("input");
	input.setAttribute("class",className);
	input.addEventListener("keydown",function(event){
		event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
	},false); // STOP IT FROM TRIGGERING KEY.js
	return input;
}

//Deals with input fields
//Need to console.log and check where _createNumberInput is called in other files
//Ex. Does this deal with advanced settings? Up/down arrow on nodes?
function _createNumberInput(onUpdate){

	const self = {};

	// dom!
	self.dom = document.createElement("input");
	self.dom.style.border = "none";
	self.dom.style.width = "40px";
	self.dom.style.padding = "5px";

	self.dom.addEventListener("keydown",function(event){
		event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
	},false); // STOP IT FROM TRIGGERING KEY.js

	// on update
	self.dom.onchange = function(){
		let value = parseInt(self.getValue());
		if(isNaN(value)) value=0;
		self.setValue(value);
		onUpdate(value);
	};

	// select on click, yo
	self.dom.onclick = function(){
		self.dom.select();
	};

	// set & get value
	self.getValue = function(){
		return self.dom.value;
	};
	self.setValue = function(num){
		self.dom.value = num;
	};

	// return an OBJECT.
	return self;

}

//It appears this was added in to maintain a certain structure but serves no executable purpose
function _blank(){
	// just a blank function to toss in.
}

//Creates offset bounds for HTML elements to compare them to a reference point or container
function _getTotalOffset(target){
	const bounds = target.getBoundingClientRect();
	return {
		left: bounds.left,
		top: bounds.top
	};
}

//Calls on different things to happen to a target when the mouse moves, clicks, or scrolls
function _addMouseEvents(target, onmousedown, onmousemove, onmouseup, onmousewheel){

	// WRAP THEM CALLBACKS
    /*The purpose of a fake event is to standardize functionality across different event types
	  Ex. _fakeEvent for _onmousemove and _onmousewheel allows functions to run regardless of
	  event type or input device (like mouse vs. touchpad)*/
	const _onmousedown = function(event){
		const _fakeEvent = _onmousemove(event);
		onmousedown(_fakeEvent);
	};
	const _onmousewheel = function(event){
		const _fakeEvent = _onmousemove(event);
		onmousewheel(_fakeEvent);
	};
	const _onmousemove = function(event){
		
		// Mouse position
		const _fakeEvent = {};
		/*changedTouches adds functionality for laptop touchpads, touchscreens etc. and keeps
		functionality consistent with standard hardware*/
		if(event.changedTouches){
			// Touch
			const offset = _getTotalOffset(target);
			_fakeEvent.x = event.changedTouches[0].clientX - offset.left;
			_fakeEvent.y = event.changedTouches[0].clientY - offset.top;
			event.preventDefault();
		}else{
			// Not Touch
			_fakeEvent.x = event.offsetX;
			_fakeEvent.y = event.offsetY;
			_fakeEvent.wheel = event.deltaY>0?1:event.deltaY<0?-1:0;
		}

		// Mousemove callback
		onmousemove(_fakeEvent);
		return _fakeEvent;

	};
	const _onmouseup = function(){
		const _fakeEvent = {};
		onmouseup(_fakeEvent);
	};

	//Event capability for mouse functions
	target.addEventListener("mousedown", _onmousedown);
	target.addEventListener("mousemove", _onmousemove);
	document.body.addEventListener("mouseup", _onmouseup);
	target.addEventListener("wheel", _onmousewheel);


	//Event capability for touchpad/touchscreen functions
	target.addEventListener("touchstart",_onmousedown,false);
	target.addEventListener("touchmove",_onmousemove,false);
	document.body.addEventListener("touchend",_onmouseup,false);

}

//Creates an object with the bounds specific in the function
function _getBounds(points){

	// Bounds
	let left=Infinity, top=Infinity, right=-Infinity, bottom=-Infinity;
	//Checks whether x or y coordinates have shifted on an object
	for(let i=0;i<points.length;i++){
		const point = points[i];
		if(point[0]<left) left=point[0];
		if(right<point[0]) right=point[0];
		if(point[1]<top) top=point[1];
		if(bottom<point[1]) bottom=point[1];
	}

	// Dimensions
	const width = (right-left);
	const height = (bottom-top);

	// Gimme
	return {
		left:left, right:right, top:top, bottom:bottom,
		width:width, height:height
	};
	
}

//Creates a copy of an array of object coordinates and produces that copy at a moved location
function _translatePoints(points, dx, dy){
	points = JSON.parse(JSON.stringify(points));
	for(let i=0;i<points.length;i++){
		const p = points[i];
		p[0] += dx;
		p[1] += dy;
	}
	return points;
}


//Rotates a set of points (outlining an object) in the Loopy coordinate (x,y) system
//Similar to the last, it creates a copy of the previous object so nothing is lost
function _rotatePoints(points, angle){
	points = JSON.parse(JSON.stringify(points));
	for(let i=0;i<points.length;i++){
		const p = points[i];
		const x = p[0];
		const y = p[1];
		p[0] = x*Math.cos(angle) - y*Math.sin(angle);
		p[1] = y*Math.cos(angle) + x*Math.sin(angle);
	}
	return points;
}

//Makes sure object properties are properly set based on intended configuration values
function _configureProperties(self, config, properties){

	for(let propName in properties) if(properties.hasOwnProperty(propName)){

		// Default values!
		if(config[propName]===undefined){
			let value = properties[propName];
			if(typeof value=="function") value=value();
			config[propName] = value;
		}

		// Transfer to "self".
		self[propName] = config[propName];

	}

}

//Checks whether an (x,y) coordinate is inside of a circle object
//[Probably] used to check for object overlaps, edge/node relationships [I think?]
function _isPointInCircle(x, y, cx, cy, radius){
	
	// Point distance
	const dx = cx-x;
	const dy = cy-y;
	const dist2 = dx*dx + dy*dy;

	// My radius
	const r2 = radius*radius;

	// Inside?
	return dist2<=r2;

}

//Same as the above function but for boxes instead of circles
function _isPointInBox(x, y, box){
	return !(x < box.x
		|| x > box.x + box.width
		|| y < box.y
		|| y > box.y + box.height);
}

// TODO: Make more use of this???
//Looks like this isn't completed
function _makeErrorFunc(msg){
	return function(){
		throw Error(msg);
	};
}

//Checks if a query parameter is present in the URL of a Loopy instance
function _getParameterByName(name){
	const url = location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//Creates a color based on RBG values
//*Where is this called in the program? There are only 6 color options?*
function _blendColors(hex1, hex2, blend){
	
	let color = "#";
	for(let i=0; i<3; i++) {
		
		// Into numbers...
		const sub1 = hex1.substring(1+2*i, 3+2*i);
		const sub2 = hex2.substring(1+2*i, 3+2*i);
		const num1 = parseInt(sub1, 16);
		const num2 = parseInt(sub2, 16);

		// Blended number & sub
		const num = Math.floor( num1*(1-blend) + num2*blend );
		const sub = num.toString(16).toUpperCase();
		const paddedSub = ('0'+sub).slice(-2); // in case it's only one digit long

		// Add that babe
		//^^Leaving this in because it shows the original programmer was a bit manic
		color += paddedSub;

	}

	return color;

}

/*Shifts the contents of an array by a specified index
  Ex. Passing _shiftArray an array called "array" containg [1,2,3,4,5] as "shiftArray(array, 2)"
  Would return array as [3,4,5,1,2]*/
function _shiftArray(array, shiftIndex){
	const moveThisAround = array.splice(-shiftIndex);
	return moveThisAround.concat(array);
}

//Counts the number of instances of a like-input in an area
//Seems to work as a counter but not sure if/how this is currently being used (needs investigation)
function statArray(arr){
	const stat = {};
	arr.forEach(e=>stat[e]?stat[e]++:stat[e]=1);
	return stat;
}

/*
function MonitoredStruct(inertStruct, eventNameSuffix, topAncestor) {
	this.topAncestor = topAncestor ? topAncestor : this;
	const closuredTopAncestor = this.topAncestor;
	const handler = {
		'set': (obj, key, value) => {
			if(JSON.stringify(obj[key]) === JSON.stringify(value) ) return true;
			if (typeof value === 'object') obj[key] = new MonitoredStruct(value, eventNameSuffix+'.'+key, closuredTopAncestor);
			else obj[key] = value;
			throw ['monitoredStruct', 'change', eventNameSuffix+'.'+key,closuredTopAncestor.smartObj];
			return true;
		},
		'deleteProperty': function (obj, key) {
			throw ['monitoredStruct', 'delete', eventNameSuffix+'.'+key,closuredTopAncestor.smartObj];
			return delete obj[key];
		}
	};
	let goSmart = JSON.parse(JSON.stringify(inertStruct));
	for (let key in inertStruct) {
		if (typeof inertStruct[key] === 'object') {
			goSmart[key] = new MonitoredStruct(inertStruct[key], eventNameSuffix+'.'+key, this.topAncestor);
		} else goSmart[key] = inertStruct[key];
	}
	if(typeof goSmart === 'object' && goSmart !== null) this.smartObj = new Proxy(goSmart, handler);
	else this.smartObj = goSmart;
	return this.smartObj;
}
*/

//Combines bounds for all objects in a bounds array
function mergeBounds(...bounds){
	// Get bounds of ALL objects...
	return bounds.reduce((acc,cur)=>{
		//if(isFinite(cur.left)) drawBounds(cur, `#${Math.floor(Math.random()*256).toString(16)}${Math.floor(Math.random()*256).toString(16)}${Math.floor(Math.random()*256).toString(16)}`)
		//Checks whether the object has defined bounds
		if(typeof cur.left === "undefined"){
			cur.left = Infinity;
			cur.right = -Infinity;
			cur.top = Infinity;
			cur.bottom = -Infinity;
		}
		/*Checks whether the object has defined weight
		  Weight assigns priority to bounding objects to determine which one goes where if they overlap
		  or "compete" with each other*/
		if(typeof cur.weight === "undefined"){
			cur.cx = (cur.left+cur.right)/2;
			cur.cy = (cur.top+cur.bottom)/2;
			cur.weight = 1;
		}

		//A bunch of different checks to see whether inputs is valid numbers and whether bound
		//Locations are offset from their previous spots
		if(isNaN(cur.cx) || isNaN(cur.cy)) cur.cx = cur.cy = cur.weight = 0;
		if(acc.left>cur.left) acc.left=cur.left;
		if(acc.top>cur.top) acc.top=cur.top;
		if(acc.right<cur.right) acc.right=cur.right;
		if(acc.bottom<cur.bottom) acc.bottom=cur.bottom;
		acc.cx = (acc.cx*acc.weight + cur.cx*cur.weight)/(acc.weight+cur.weight);
		acc.cy = (acc.cy*acc.weight + cur.cy*cur.weight)/(acc.weight+cur.weight);
		acc.weight = acc.weight+cur.weight;
		if(isNaN(acc.cx) || isNaN(acc.cy)) acc.cx = acc.cy = acc.weight = 0;
		return acc;
	},{left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity,cx:0,cy:0,weight:0});
}

//Draws bounds specified by the bounds array and color provided
function drawBounds(bounds, color){
	/*
    const canvasses = document.getElementById("canvasses");
    console.log(canvasses);
    const ctx = canvasses.lastChild.getContext("2d");
     */
	const ctx = loopy.model.context
	ctx.restore()
	ctx.save()
	applyZoomTransform(ctx);

	ctx.beginPath();
	ctx.moveTo(bounds.left,bounds.top);
	ctx.lineTo(bounds.left,bounds.bottom);
	ctx.lineTo(bounds.right,bounds.bottom);
	ctx.lineTo(bounds.right,bounds.top);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore()

}
