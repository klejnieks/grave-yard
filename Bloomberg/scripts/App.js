import EventManager from './utils/EventManager';
import Events from './events/Events';
import DisplayTypes from './utils/DisplayTypes';

class App {

    constructor() {
        this.displayType = DisplayTypes.LIST_TYPE;

        this.el = document.getElementById('app');

        this.addListeners();
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

}

export default App;
