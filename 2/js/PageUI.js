/** *************************************************************************************************
User Summary
PageUI controls what the page is being displayed to the user.

Technical Summary
The DOM instance is set using self. An array called “self.pages” stores the pages. The function
addPage() sets the DOM and id of the page instance then pushes it to the pages array. The
showPage(id) function loops through the pages array. It checks the “id” of the current page against
the “id” passed in as a parameter. Once the id’s match that page is displayed to the user.

************************************************************************************************** */

function PageUI(dom) {
    const self = this;
    self.dom = dom;

    self.pages = [];
    self.addPage = function (id, page) {
        page.id = id;
        self.dom.appendChild(page.dom);
        self.pages.push(page);
    };
    self.currentPage = null;
    self.showPage = function (id) {
        let shownPage = null;
        for (let i = 0; i < self.pages.length; i++) {
            const page = self.pages[i];
            if (page.id === id) {
                page.show();
                shownPage = page;
            } else {
                page.hide();
            }
        }
        self.currentPage = shownPage;
        return shownPage;
    };
}

function Page() {
    const self = this;

    // DOM
    self.dom = document.createElement('div');
    self.show = function () { self.dom.style.display = 'block'; };
    self.hide = function () { self.dom.style.display = 'none'; };

    // Add Component
    self.addComponent = function (component) {
        self.dom.appendChild(component.dom); // add to DOM
        return component;
    };
}
