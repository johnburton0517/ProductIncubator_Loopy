/** *************************************************************************************************
User Summary
The Toolbar is on the left side of the screen. It is where the user selects the tool to use. This
includes Pencil, Text, Move, and Eraser.

Technical Summary
The Toolbarfunction is a constructor that creates the toolbar object and provides methods for
managing the toolbar and its buttons. The ToolbarButton  function creates a button element with an
icon and tooltip. It provides methods for selecting and deselecting the button, as well as a
callback function that gets invoked when the button is clicked. The Toolbar class uses this
ToolbarButton class to create and manage buttons in the toolbar.

************************************************************************************************** */

function Toolbar(loopy) {
    const self = this;

    // Tools & Buttons
    const buttons = []; // Array to store the toolbar buttons
    const buttonsByID = {}; // Object to store buttons by their IDs
    self.dom = document.getElementById('toolbar');
    self.addButton = function (options) {
        const { id } = options; // Button ID
        const { tooltip } = options; // Button tooltip text
        const { callback } = options; // Button callback

        // Add the button
        const button = new ToolbarButton(self, {
            id,
            icon: `css/icons/${id}.png`,
            tooltip,
            callback,
        });
        self.dom.appendChild(button.dom);
        buttons.push(button); // Add the button to the array
        buttonsByID[id] = button; // Store the button id in buttonsByID

        // Keyboard shortcut!
        (function (id) {
            subscribe(`key/${id}`, () => {
                loopy.ink.reset(); // also CLEAR INK CANVAS
                buttonsByID[id].callback();
            });
        }(id));
    };

    // Select button in the toolbar
    self.selectButton = function (button) {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].deselect(); // Deselect all buttons
        }
        button.select(); // Select the button
    };

    // Set Tool
    self.currentTool = 'ink'; // Default tool
    self.setTool = function (tool) {
        self.currentTool = tool;
        const name = `TOOL_${tool.toUpperCase()}`;
        loopy.tool = Loopy[name]; // Set the tool in the loopy object
        document.getElementById('canvasses').setAttribute('cursor', tool); // Set the cursor	on the canvasses
    };

    // Populate those buttons!
    self.addButton({
        id: 'ink',
        tooltip: 'PE(N)CIL',
        callback() {
            self.setTool('ink');
        },
    });
    self.addButton({
        id: 'label',
        tooltip: '(T)EXT',
        callback() {
            self.setTool('label');
        },
    });
    self.addButton({
        id: 'drag',
        tooltip: 'MO(V)E',
        callback() {
            self.setTool('drag');
        },
    });
    self.addButton({
        id: 'erase',
        tooltip: '(E)RASE',
        callback() {
            self.setTool('erase');
        },
    });

    // Select button
    buttonsByID.ink.callback();

    // Hide & Show
}

function ToolbarButton(toolbar, config) {
    const self = this;
    self.id = config.id; // Button ID

    // Icon
    self.dom = document.createElement('div');
    self.dom.setAttribute('class', 'toolbar_button');
    self.dom.style.backgroundImage = `url('${config.icon}')`;

    // Tooltip!
    self.dom.setAttribute('data-balloon', config.tooltip);
    self.dom.setAttribute('data-balloon-pos', 'right');

    // Selected?
    self.select = function () {
        self.dom.setAttribute('selected', 'yes'); // Mark the button as selected by setting the "selected" attribute to "yes"
    };
    self.deselect = function () {
        self.dom.setAttribute('selected', 'no'); // Mark the button as deselected by setting the "selected" attribute to "no"
    };

    // On Click
    self.callback = function () {
        config.callback(); // Invoke the callback function specified in the button configuration
        toolbar.selectButton(self); // Call teh selectButton function in the toolbar and pass it the current button instance
    };
    self.dom.onclick = self.callback; // Assign the callback function to the onclick event of the button
}
