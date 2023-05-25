/** *************************************************************************************************
User Summary
Is tracking the user’s mouse interactions so that they can interact with the canvas.

Technical Summary
Tracks the following mouse events on the canvas: onMouseDown, onMouseUp, onMouseWheel, onMouseMove.
These events are published so that they can be used in other classes which allows those classes to
provide functionality like drawing, dragging, etc..

************************************************************************************************** */

window.Mouse = {};
Mouse.init = function (target) { // target is the canvas
    // Events!
    // Mouse pressed down
    const _onmousedown = function () {
        Mouse.moved = false;
        Mouse.pressed = true;
        Mouse.startedOnTarget = true;
        publish('mousedown');
    };
    // Mouse scroll wheel
    const _onmousewheel = function (event) {
        publish('mousewheel', [event]);
    };
    // Mouse moving on canvas
    const _onmousemove = function (event) {
        const m = mouseToMouse(event.x, event.y, loopy.offsetScale, loopy.offsetX, loopy.offsetY);
        // Mouse!
        Mouse.x = m.x;
        Mouse.y = m.y;

        Mouse.moved = true;
        publish('mousemove');
    };
    // Mouse let up after being pressed down
    const _onmouseup = function () {
        Mouse.pressed = false;
        if (Mouse.startedOnTarget) {
            publish('mouseup');
            if (!Mouse.moved) publish('mouseclick');
        }
        Mouse.moved = false;
        Mouse.startedOnTarget = false;
    };

    // Add mouse & touch events!
    _addMouseEvents(target, _onmousedown, _onmousemove, _onmouseup, _onmousewheel);

    // Cursor & Update
    // Example: when in play mode and hovering over a node
    Mouse.target = target;
    Mouse.showCursor = function (cursor) {
        Mouse.target.style.cursor = cursor;
    };
    Mouse.update = function () {
        Mouse.showCursor('');
    };
};
// Used to calculate mouse movement on canvas based on loopy scale and offsets
function mouseToMouse(mx, my, scale, offsetX, offsetY) {
    // DO THE INVERSE
    const canvasses = document.getElementById('canvasses');
    let tx = 0;
    let ty = 0;
    const s = 1 / scale;
    const CW = canvasses.clientWidth - _PADDING - _PADDING;
    const CH = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;

    if (loopy.embedded) {
        tx -= _PADDING / 2; // dunno why but this is needed
        ty -= _PADDING / 2; // dunno why but this is needed
    }

    tx -= (CW + _PADDING) / 2;
    ty -= (CH + _PADDING) / 2;

    tx = s * tx;
    ty = s * ty;

    tx += (CW + _PADDING) / 2;
    ty += (CH + _PADDING) / 2;

    tx -= offsetX;
    ty -= offsetY;

    // Mutliply by Mouse vector
    const x = mx * s + tx;
    const y = my * s + ty;
    return { x, y };
}
