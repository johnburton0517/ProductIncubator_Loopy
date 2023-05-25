/*
User Summary
When the user clicks the Eraser Tool in the Toolbar on the left side of the screen or presses E on
the keyboard the Eraser Tool is selected. Users can interact with objects on the screen and delete
them with the tool.

Technical Summary
The Eraser class has a function called erase that is responsible for removing certain elements from
the canvas. When the user is in editing mode and selects the eraser tool, the erase function is
triggered. It checks if the mouse is pressed or if it's a click event, and if so, it looks for
nodes, edges, and labels that are located at the mouse position. If any of these elements are found,
they are removed from the canvas. The code also includes event listeners for mouse movement and
mouse click, which call the erase function accordingly.
 */

// Define the Eraser class
function Eraser(loopy) {
    // Store a reference to the parent Loopy object
    const self = this;
    self.loopy = loopy;

    // Define the erase function
    self.erase = function (clicked) {
    // ONLY WHEN EDITING w DRAG
        if (self.loopy.mode !== Loopy.MODE_EDIT) return;
        if (self.loopy.tool !== Loopy.TOOL_ERASE) return;

        // Erase any nodes under the mouse
        if (Mouse.pressed || clicked) {
            // the node under the mouse
            const eraseNode = loopy.model.getNodeByPoint(Mouse.x, Mouse.y);
            // if there is a node under the mouse, kill it
            if (eraseNode) eraseNode.kill();
        }

        // Erase any edges under the mouse
        if (Mouse.pressed || clicked) {
            // the edge under the mouse
            const eraseEdge = loopy.model.getEdgeByPoint(Mouse.x, Mouse.y, true);
            // if there is an edge under the mouse, kill it
            if (eraseEdge) eraseEdge.kill();
        }

        // Erase any labels under the mouse
        if (Mouse.pressed || clicked) {
            // the label under the mouse
            const eraseLabel = loopy.model.getLabelByPoint(Mouse.x, Mouse.y);
            // if there is a label under the mouse, kill it
            if (eraseLabel) eraseLabel.kill();
        }
    };

    // Subscribe to mouse events and call the erase function
    subscribe('mousemove', () => {
        self.erase();
    });
    // Subscribe to mouse events and call the erase function
    subscribe('mouseclick', () => {
        self.erase(true);
    });
}
