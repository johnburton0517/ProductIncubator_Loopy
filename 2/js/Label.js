/** *************************************************************************************************
User Summary
When the user clicks the Text Tool in the Toolbar on the left side of the screen or presses T on the
keyboard the Text Tool is selected. Users can click anywhere on the screen to create a new text
field. If there is already an object where the user clicks, it will select that object. The menu of
the right of the screen will also open with an editable text field that corresponds to the field on
the screen. From the menu the text field can be deleted with the Delete Node Button.

Technical Summary
The Label class represents a label . The class has properties such as x and y coordinates, text
content, color, and visibility. It provides methods for drawing the label, handling mouse clicks,
and calculating the label's bounding box. The breakText method breaks the label's text into lines
and adds special characters based on the label's properties. The getBounds method calculates the
dimensions of the label's bounding box based on its text content. The isPointInLabel method checks
if a given point is inside the label's bounding box. The kill method removes the label from the
parent model and triggers the "kill" event.

************************************************************************************************** */
Label.COLORS = {
    '-1': '#000000', // black
    0: '#880000', // red
    1: '#885533', // orange
    2: '#888800', // yellow
    3: '#558800', // green
    4: '#446688', // blue
    5: '#664488', // purple
};
Label.FONTSIZE = 40;
Label._CLASS_ = 'Label';

// Label class constructor
function Label(model, config) {
    const self = this;
    self._CLASS_ = 'Label';

    // References to parent objects
    self.loopy = model.loopy;
    self.model = model;
    self.config = config;

    // Default values...
    const defaultProperties = {
        x: 0,
        y: 0,
    };
    injectedDefaultProps(defaultProperties, objTypeToTypeIndex('label'));
    _configureProperties(self, config, defaultProperties);

    // Draw method for rendering the label on the canvas context
    self.draw = function (ctx) {
        if (self.visibility === 1 && self.loopy.mode === Loopy.MODE_PLAY) return;
        // cursor: pointer if clickable
        if (self.loopy.mode === Loopy.MODE_PLAY && self.href && self.isPointInLabel(Mouse.x, Mouse.y)) Mouse.showCursor('pointer');

        // Retina
        const x = self.x * 2;
        const y = self.y * 2;

        // DRAW HIGHLIGHT???
        if (self.loopy.sidebar.currentPage.target === self) {
            const bounds = self.getBounds();
            ctx.save();
            ctx.scale(2, 2); // RETINA
            ctx.beginPath();
            ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
            ctx.fillStyle = HIGHLIGHT_COLOR;
            ctx.fill();
            ctx.restore();
        }

        // Translate!
        ctx.save();
        ctx.translate(x, y);

        // Text!
        ctx.font = `100 ${Label.FONTSIZE}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = Label.COLORS[self.textColor];

        // ugh new lines are a PAIN.
        const lines = self.breakText();
        ctx.translate(0, -(Label.FONTSIZE * lines.length) / 2);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            ctx.fillText(line, 0, 0);
            ctx.translate(0, Label.FONTSIZE);
        }

        // Restore
        ctx.restore();
    };

    /// ///////////////////////////////////
    // KILL LABEL /////////////////////////
    /// ///////////////////////////////////

    self.kill = function () {
        // Remove from parent!
        model.removeLabel(self);

        // Killed!
        publish('kill', [self]);
    };

    /// ///////////////////////////////////
    // HELPER METHODS ////////////////////
    /// ///////////////////////////////////

    self.breakText = function () {
        const lines = self.text.split(/\n/);
        if (self.href) lines[0] = `🔗 ${lines[0]}`;
        if (self.loopy.mode === Loopy.MODE_EDIT && self.loopy.loopyMode) {
            if (!self.visibility) lines.unshift('👁'); // '👁 ⯈'
        }
        return lines;
    };

    self.getBounds = function () {
        const ctx = self.model.context;

        // Get MAX width...
        const lines = self.breakText();
        let maxWidth = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const w = (ctx.measureText(line).width + 10) * 2;
            if (maxWidth < w) maxWidth = w;
        }

        // Dimensions, then:
        const w = maxWidth;
        const h = (Label.FONTSIZE * lines.length) / 2;

        // Bounds, then:
        return {
            x: self.x - w / 2,
            y: self.y - h / 2 - Label.FONTSIZE / 2,
            width: w,
            height: h + Label.FONTSIZE / 2,
        };
    };
    // Event handler for mouse clicks
    subscribe('mouseclick', () => {
        // Check if we're in play mode
        if (self.loopy.mode !== Loopy.MODE_PLAY) return;
        if (!self.href) return;

        // Did you click on a label? If so, edit THAT label.
        const clickedLabel = self.isPointInLabel(Mouse.x, Mouse.y);
        if (clickedLabel) {
            open(self.href, '_blank');
        }
    });

    // Helper method for checking if a point is in the label
    self.isPointInLabel = function (x, y) {
        return _isPointInBox(x, y, self.getBounds());
    };

    // Helper method for getting the bounding box of the label
    self.getBoundingBox = function () {
        const bounds = self.getBounds();
        return {
            left: bounds.x,
            top: bounds.y,
            right: bounds.x + bounds.width,
            bottom: bounds.y + bounds.height,
        };
    };
}
