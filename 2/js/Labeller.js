/**********************************

User Summary

This code contains the functionality of the text button of
the toolbar on the left. It enables the user to either edit 
an existing label or create a new one. 

Technical Summary

The function Labeller contains the function tryMakingLabel, 
which first ensures the user is in edit mode and that the 
label editor is active and returns if not. If the user 
selects a label, the label editor appears. If not, a new 
label is created and then the label editor appears.

**********************************/

function Labeller(loopy){

	const self = this;
	self.loopy = loopy;

	self.tryMakingLabel = function(){

		// ONLY WHEN EDITING w LABEL
		if(self.loopy.mode!==Loopy.MODE_EDIT) return;
		if(self.loopy.tool!==Loopy.TOOL_LABEL) return;

		// And if ALREADY EDITING LABEL, just GO TO TOP.
		if(self.loopy.sidebar.currentPage.id === "Label"){
			loopy.sidebar.showPage("Edit");
			return;
		}

		// Otherwise, make it & edit it!
		const newLabel = loopy.model.addLabel({
			x: Mouse.x,
			y: Mouse.y+10 // whatever, to make text actually centered.
		});
		loopy.sidebar.edit(newLabel);

	};

}