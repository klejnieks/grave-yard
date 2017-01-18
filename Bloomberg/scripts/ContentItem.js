import EventManager from './utils/EventManager';
import Events from './events/Events';
import DisplayTypes from './utils/DisplayTypes';


class ContentItem {

    constructor(data) {
        this.data = data;
        this.name = "TMP";
        this.displayType = DisplayTypes.LIST_TYPE;
        this.addListeners();
    }

    addListeners() {
        EventManager.on(Events.CHANGE_DISPLAY_TYPE, this.onChangeDisplayType.bind(this));
    }

    removeListeners() {
        //
    }

    onChangeDisplayType(data) {
        let items = document.getElementsByClassName("content-item");
        for(let item of items) {
            item.classList.remove(this.displayType);
            item.classList.add(data.type);
        }
        this.displayType = data.type;
    }

    onClickRowHandler(event) {
        let classList = event.currentTarget.classList;
        if(classList.contains("active")){
            classList.remove("active");
        }
        else {
            classList.add("active");
        }
    }

    createItem() {
        let div = document.createElement("div");
            div.className = "content-item " + DisplayTypes.LIST_TYPE;
            div.addEventListener('click', evt => this.onClickRowHandler(evt));

        return div;
    }

    render() {
        let name = this.data;
        let item = this.createItem();
            item.innerHTML = `<p>Item ${name}</p>`;

        return item;
    }

}

export default ContentItem;
