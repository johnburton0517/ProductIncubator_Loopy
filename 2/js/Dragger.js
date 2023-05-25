/*
User Summary
When a user is in Edit mode and clicks the Hand icon - MO(V)E - in the toolbar or hits control + v,
they can enter drag/move mode. When the user clicks and drags an object, it moves around on screen.
  *If a user clicks-and-drags during “Play” mode, the screen itself moves rather than the individual
objects

Technical Summary
When Loopy is in MO(V)E mode, the system checks whether (a.) A user is holding click and dragging,
and (b.) Whether an object - being a node, label, or edge - is below coordinates of the mouse. If
these conditions are true, the given object will be moved along with the mousepoint until the user
releases the click.
  *Labels move freely with no dependencies and drag to wherever the user drops them
  *Nodes move freely and their connected edges stay connected and resizes
  *The node a dragged edge connects to stays the same but the edge arc - i.e. circle radius - will
   resize
*/

/* This function lets user move on-screen objects while in Edit (MOVE) mode or move the screen
itself around in Play mode */
function Dragger(loopy) {
    // Identifies Loopy as app
    const self = this;
    self.loopy = loopy;

    // Dragging anything?
    self.dragging = null;
    self.offsetX = 0;
    self.offsetY = 0;

    // Checks if you're in play mode and moves screen around instead of objects
    subscribe('mousedown', () => {
        if (self.loopy.mode === Loopy.MODE_PLAY && loopy.cameraMode === 2) {
            self.dragging = { _CLASS_: 'Scene' };
            self.offsetX = Mouse.x;
            self.offsetY = Mouse.y;
        }

        // ONLY WHEN EDITING w DRAG
        if (self.loopy.mode !== Loopy.MODE_EDIT) return;
        if (self.loopy.tool !== Loopy.TOOL_DRAG) return;

        // Any node under here? If so, start dragging!
        const dragNode = loopy.model.getNodeByPoint(Mouse.x, Mouse.y);
        if (dragNode) {
            self.dragging = dragNode;
            self.offsetX = Mouse.x - dragNode.x;
            self.offsetY = Mouse.y - dragNode.y;
            loopy.sidebar.edit(dragNode); // and edit!
            return;
        }

        // Any label under here? If so, start dragging!
        const dragLabel = loopy.model.getLabelByPoint(Mouse.x, Mouse.y);
        if (dragLabel) {
            self.dragging = dragLabel;
            self.offsetX = Mouse.x - dragLabel.x;
            self.offsetY = Mouse.y - dragLabel.y;
            loopy.sidebar.edit(dragLabel); // and edit!
            return;
        }

        // Any edge under here? If so, start dragging!
        const dragEdge = loopy.model.getEdgeByPoint(Mouse.x, Mouse.y);
        if (dragEdge) {
            self.dragging = dragEdge;
            self.offsetX = Mouse.x - dragEdge.labelX;
            self.offsetY = Mouse.y - dragEdge.labelY;
            loopy.sidebar.edit(dragEdge); // and edit!
            return;
        }

        self.dragging = { _CLASS_: 'Scene' };
        self.offsetX = Mouse.x;
        self.offsetY = Mouse.y;
    });

    // Drags and moves the "Scene" if the user is in Play mode
    subscribe('mousemove', () => {
        if (self.loopy.mode === Loopy.MODE_PLAY && self.dragging && self.dragging._CLASS_ === 'Scene') {
            loopy.offsetX += (Mouse.x - self.offsetX);
            loopy.offsetY += (Mouse.y - self.offsetY);
        }

        // ONLY WHEN EDITING w DRAG
        if (self.loopy.mode !== Loopy.MODE_EDIT) return;
        if (self.loopy.tool !== Loopy.TOOL_DRAG) return;

        // moving scene/zoom
        if (self.dragging && self.dragging._CLASS_ === 'Scene') {
            loopy.offsetX += (Mouse.x - self.offsetX);
            loopy.offsetY += (Mouse.y - self.offsetY);
        }
        // If you're dragging a NODE, move it around!
        if (self.dragging && self.dragging._CLASS_ === 'Node') {
            // Model's been changed!
            publish('model/changed');

            const node = self.dragging;
            node.x = Mouse.x - self.offsetX;
            node.y = Mouse.y - self.offsetY;

            // update coz visual glitches
            loopy.model.update();
        }

        // If you're dragging an EDGE, move it around!
        if (self.dragging && self.dragging._CLASS_ === 'Edge') {
            // Model's been changed!
            publish('model/changed');

            const edge = self.dragging;
            const labelX = Mouse.x - self.offsetX;
            const labelY = Mouse.y - self.offsetY;

            if (edge.from !== edge.to) {
                // The Arc: whatever label *Y* is, relative to angle & first node's pos
                const fx = edge.from.x; const fy = edge.from.y; const tx = edge.to.x; const
                    ty = edge.to.y;
                const dx = tx - fx; const
                    dy = ty - fy;
                const a = Math.atan2(dy, dx);

                // Calculate arc
                const points = [[labelX, labelY]];
                const translated = _translatePoints(points, -fx, -fy);
                const rotated = _rotatePoints(translated, -a);
                const newLabelPoint = rotated[0];

                // ooookay.
                edge.arc = -newLabelPoint[1]; // WHY NEGATIVE? I DON'T KNOW.
            } else {
                // For SELF-ARROWS: just get angle & mag for label.
                const dx = labelX - edge.from.x;
                const dy = labelY - edge.from.y;
                const a = Math.atan2(dy, dx);
                let mag = Math.sqrt(dx * dx + dy * dy);

                // Minimum mag
                const minimum = edge.from.radius + 25;
                if (mag < minimum) mag = minimum;

                // Update edge
                edge.arc = mag;
                edge.rotation = a * (360 / Math.TAU) + 90;
            }

            // update coz visual glitches
            loopy.model.update();
        }

        // If you're dragging a LABEL, move it around!
        if (self.dragging && self.dragging._CLASS_ === 'Label') {
            // Model's been changed!
            publish('model/changed');

            const label = self.dragging;
            label.x = Mouse.x - self.offsetX;
            label.y = Mouse.y - self.offsetY;

            // update coz visual glitches
            loopy.model.update();
        }
    });
    subscribe('mouseup', () => {
        // Let go!
        self.dragging = null;
        self.offsetX = 0;
        self.offsetY = 0;
    });
}
