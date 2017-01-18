import EventManager from './utils/EventManager';
import Events from './events/Events';
import DisplayTypes from './utils/DisplayTypes';

class Sidebar {

    constructor() {
        this.timeout = 0;
        this.secondKeypressTimeout = 0;
        this.isOpen = false;
        this.isAltKeyPressed = false;
        this.isModifierKeyPressed = false;

        this.openedWithMouse = true;
        this.openedWithAltKey = true;

        this.body = document.body;
        this.sidebar = document.getElementById('side-menu');
        this.sidebarButtons = document.getElementsByClassName("sidebar-button");
        this.spotter = document.getElementById('side-menu-spotter');

        this.addListeners();
    }

    addListeners() {
        this.body.addEventListener("keydown", this.onKeyDown.bind(this));
        this.body.addEventListener("keyup", this.onKeyUp.bind(this));
        this.sidebar.addEventListener("mouseleave", this.onMouseLeaveSidebar.bind(this));
        this.spotter.addEventListener("mouseover", this.onMouseOverSpotter.bind(this));
        this.spotter.addEventListener("mouseleave", this.onMouseLeaveSpotter.bind(this));

        for(let btn of this.sidebarButtons) {
            btn.addEventListener("click", this.onClickSidebarButton.bind(this));
        }
    }

    removeListeners() {
        this.body.removeEventListener("keydown", this.onKeyDown);
        this.body.removeEventListener("keyup", this.onKeyUp);
        this.sidebar.removeEventListener("mouseleave", this.onMouseLeaveSidebar);
        this.spotter.removeEventListener("mouseover", this.onMouseOverSpotter);
        this.spotter.removeEventListener("mouseleave", this.onMouseLeaveSpotter);

        for(let button of this.sidebarButtons) {
            button.removeEventListener("onclick", this.onClickSidebarButton);
        }
    }

    onClickSidebarButton(evt) {
        let type = evt.target.getAttribute('data-type');
        this.changeDisplayType(type);
        this.setSidebarButtonState(type);
    }

    onKeyDown(evt) {
        //if(this.isOpen) return;
        if(this.openedWithMouse && this.isOpen) return;

        if(evt.altKey && this.isOpen && this.openedWithAltKey) {
            this.close();
            return;
        }

        if(evt.altKey || this.isAltKeyPressed || this.isOpen) {
            this.isAltKeyPressed = true;
            this.openedWithAltKey = true;
            this.openedWithMouse = false;

            console.log(evt.keyCode);

            let type = undefined;
            if(evt.keyCode === 71) {
                type = DisplayTypes.GRID_TYPE;
            }
            else if(evt.keyCode === 76) {
                type = DisplayTypes.LIST_TYPE;
            }
            else if(evt.keyCode === 77) {
                type = DisplayTypes.METRO_TYPE;
            }

            if(type) {
                this.clearSecondKeypressTimeout();
                this.isModifierKeyPressed = true;
                this.changeDisplayType(type);
            }
            else {
                this.secondKeypressTimeout = setTimeout(() => {
                    this.open()
                }, 500);
            }

        }
    }

    onKeyUp(evt) {
        if(this.isAltKeyPressed && !this.isModifierKeyPressed) {
            this.open();
        }
        this.isModifierKeyPressed = false;
        this.isAltKeyPressed = false;
    }

    onMouseLeaveSidebar(evt) {
        if(!this.openedWithMouse) return;
        this.openedWithMouse = false;
        this.openedWithAltKey = true;
        this.close();
    }

    onMouseOverSpotter(evt) {
        this.timeout = setTimeout(() => {
            this.openedWithMouse = true;
            this.openedWithAltKey = false;
            this.open();
        }, 1000);
    }

    onMouseLeaveSpotter(evt) {
        clearTimeout(this.timeout);
        this.timeout = 0;
    }

    clearSecondKeypressTimeout() {
        clearTimeout(this.secondKeypressTimeout);
        this.secondKeypressTimeout = 0;
    }

    open() {
        if(this.isOpen) return;
        this.clearSecondKeypressTimeout();
        this.isOpen = true;
        this.sidebar.classList.add("open");
    }

    close() {
        this.isOpen = false;
        this.sidebar.classList.remove("open");
    }

    setSidebarButtonState(type) {
        for(let button of this.sidebarButtons) {
            if(button.getAttribute("data-type") === type) {
                button.classList.add("selected");
            }
            else {
                button.classList.remove("selected");
            }
        }
    }

    changeDisplayType(type) {
        this.clearSecondKeypressTimeout();
        this.setSidebarButtonState(type);
        EventManager.trigger(Events.CHANGE_DISPLAY_TYPE, {type: type});
    }

}

export default new Sidebar();
