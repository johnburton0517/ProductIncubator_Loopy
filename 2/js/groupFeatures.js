/*
User Summary
Group features allows the user to change group options such as name, visibility, and color.
Visibility allows the user to hide or display groups on the canvas. Groups in Loopy are still being
developed so group features are not available to the user.

Technical Summary
Group features calls a function to modify the group properties. The objType is “group”, and
propertyName can be “name”, “visibility”, or “color”.

*/
injectProperty('group', 'name', {
});
injectProperty('group', 'contentVisibility', {
    /**
     * always visible
     * always hidden in play mode
     * only visible when including an active signal
     * hidden until an incoming signal reach it (then still visible)

     when a group is hidden all his content is hidden with it.
     if an element is in more than one group, it will be shown if at least one of these group is in visible state.
     */
});
injectProperty('group', 'bgVisibility', {
    // default: when visible (contentVisibility)
    // only in edit mode
    // always but scene cam don't resize to it
});
injectProperty('group', 'bgColor', {
});
