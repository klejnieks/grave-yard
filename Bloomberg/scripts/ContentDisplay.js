import ContentItem from './ContentItem.js';

import EventManager from './utils/EventManager';
import Events from './events/Events';
import DisplayTypes from './utils/DisplayTypes';

class ContentDisplay {

    constructor() {
        this.displayType = DisplayTypes.LIST_TYPE;

        this.el = document.getElementById('content-display');

        this.addListeners();
        this.render();
    }

    addListeners() {
        EventManager.on(Events.CHANGE_DISPLAY_TYPE, this.onChangeDisplayType.bind(this));
    }

    removeListeners() {
        //
    }

    onChangeDisplayType(data) {
        this.el.classList.remove(this.displayType);
        this.el.classList.add(data.type);
        this.displayType = data.type;
    }

    renderItem(data) {
        let item = new ContentItem(data);
        return item.render();
    }

    render() {
        for(var i=0; i<149; i++) {
            this.el.appendChild(this.renderItem(i + 1))
        }
    }

}

export default new ContentDisplay();
