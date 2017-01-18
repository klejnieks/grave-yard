/*!
 * CanJS - 2.1.4
 * http://canjs.us/
 * Copyright (c) 2015 Bitovi
 * Thu, 05 Feb 2015 15:10:06 GMT
 * Licensed MIT
 * Includes: can/construct/construct.js,can/map/map.js,can/list/list.js,can/compute/compute.js,can/view/view.js,can/view/mustache/mustache.js
 * Download from: http://bitbuilder.herokuapp.com/can.custom.js?configuration=jquery&plugins=can%2Fconstruct%2Fconstruct.js&plugins=can%2Fmap%2Fmap.js&plugins=can%2Flist%2Flist.js&plugins=can%2Fcompute%2Fcompute.js&plugins=can%2Fview%2Fview.js&plugins=can%2Fview%2Fmustache%2Fmustache.js
 */
(function(undefined) {

    // ## can/util/can.js
    var __m5 = (function() {

        var can = window.can || {};
        if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
            window.can = can;
        }

        // An empty function useful for where you need a dummy callback.
        can.k = function() {};

        can.isDeferred = function(obj) {
            // Returns `true` if something looks like a deferred.
            return obj && typeof obj.then === "function" && typeof obj.pipe === "function";
        };

        var cid = 0;
        can.cid = function(object, name) {
            if (!object._cid) {
                cid++;
                object._cid = (name || '') + cid;
            }
            return object._cid;
        };
        can.VERSION = '@EDGE';

        can.simpleExtend = function(d, s) {
            for (var prop in s) {
                d[prop] = s[prop];
            }
            return d;
        };

        can.frag = function(item) {
            var frag;
            if (!item || typeof item === "string") {
                frag = can.buildFragment(item == null ? "" : "" + item, document.body);
                // If we have an empty frag...
                if (!frag.childNodes.length) {
                    frag.appendChild(document.createTextNode(''));
                }
                return frag;
            } else if (item.nodeType === 11) {
                return item;
            } else if (typeof item.nodeType === "number") {
                frag = document.createDocumentFragment();
                frag.appendChild(item);
                return frag;
            } else if (typeof item.length === "number") {
                frag = document.createDocumentFragment();
                can.each(item, function(item) {
                    frag.appendChild(can.frag(item));
                });
                return frag;
            } else {
                frag = can.buildFragment("" + item, document.body);
                // If we have an empty frag...
                if (!frag.childNodes.length) {
                    frag.appendChild(document.createTextNode(''));
                }
                return frag;
            }
        };

        // this is here in case can.compute hasn't loaded
        can.__reading = function() {};

        return can;
    })();

    // ## can/util/attr/attr.js
    var __m6 = (function(can) {

        // Acts as a polyfill for setImmediate which only works in IE 10+. Needed to make
        // the triggering of `attributes` event async.
        var setImmediate = window.setImmediate || function(cb) {
                return setTimeout(cb, 0);
            },
            attr = {
                // This property lets us know if the browser supports mutation observers.
                // If they are supported then that will be setup in can/util/jquery and those native events will be used to inform observers of attribute changes.
                // Otherwise this module handles triggering an `attributes` event on the element.
                MutationObserver: window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,


                map: {
                    "class": "className",
                    "value": "value",
                    "innerText": "innerText",
                    "textContent": "textContent",
                    "checked": true,
                    "disabled": true,
                    "readonly": true,
                    "required": true,
                    // For the `src` attribute we are using a setter function to prevent values such as an empty string or null from being set.
                    // An `img` tag attempts to fetch the `src` when it is set, so we need to prevent that from happening by removing the attribute instead.
                    src: function(el, val) {
                        if (val == null || val === "") {
                            el.removeAttribute("src");
                            return null;
                        } else {
                            el.setAttribute("src", val);
                            return val;
                        }
                    },
                    style: function(el, val) {
                        return el.style.cssText = val || "";
                    }
                },
                // These are elements whos default value we should set.
                defaultValue: ["input", "textarea"],
                // ## attr.set
                // Set the value an attribute on an element.
                set: function(el, attrName, val) {
                    var oldValue;
                    // In order to later trigger an event we need to compare the new value to the old value, so here we go ahead and retrieve the old value for browsers that don't have native MutationObservers.
                    if (!attr.MutationObserver) {
                        oldValue = attr.get(el, attrName);
                    }

                    var tagName = el.nodeName.toString()
                        .toLowerCase(),
                        prop = attr.map[attrName],
                        newValue;

                    // Using the property of `attr.map`, go through and check if the property is a function, and if so call it. Then check if the property is `true`, and if so set the value to `true`, also making sure to set `defaultChecked` to `true` for elements of `attr.defaultValue`. We always set the value to true because for these boolean properties, setting them to false would be the same as removing the attribute.
                    // For all other attributes use `setAttribute` to set the new value.
                    if (typeof prop === "function") {
                        newValue = prop(el, val);
                    } else if (prop === true) {
                        newValue = el[attrName] = true;

                        if (attrName === "checked" && el.type === "radio") {
                            if (can.inArray(tagName, attr.defaultValue) >= 0) {
                                el.defaultChecked = true;
                            }
                        }

                    } else if (prop) {
                        newValue = el[prop] = val;
                        if (prop === "value" && can.inArray(tagName, attr.defaultValue) >= 0) {
                            el.defaultValue = val;
                        }
                    } else {
                        el.setAttribute(attrName, val);
                        newValue = val;
                    }

                    // Now that the value has been set, for browsers without MutationObservers, check to see that value has changed and if so trigger the "attributes" event on the element.
                    if (!attr.MutationObserver && newValue !== oldValue) {
                        attr.trigger(el, attrName, oldValue);
                    }
                },
                // ## attr.trigger
                // Used to trigger an "attributes" event on an element. Checks to make sure that someone is listening for the event and then queues a function to be called asynchronously using `setImmediate.
                trigger: function(el, attrName, oldValue) {
                    if (can.data(can.$(el), "canHasAttributesBindings")) {
                        return setImmediate(function() {
                            can.trigger(el, {
                                    type: "attributes",
                                    attributeName: attrName,
                                    target: el,
                                    oldValue: oldValue,
                                    bubbles: false
                                }, []);
                        });
                    }
                },
                // ## attr.get
                // Gets the value of an attribute. First checks to see if the property is a string on `attr.map` and if so returns the value from the element's property. Otherwise uses `getAttribute` to retrieve the value.
                get: function(el, attrName) {
                    var prop = attr.map[attrName];
                    if (typeof prop === "string" && el[prop]) {
                        return el[prop];
                    }

                    return el.getAttribute(attrName);
                },
                // ## attr.remove
                // Removes an attribute from an element. Works by using the `attr.map` to see if the attribute is a special type of property. If the property is a function then the fuction is called with `undefined` as the value. If the property is `true` then the attribute is set to false. If the property is a string then the attribute is set to an empty string. Otherwise `removeAttribute` is used.
                // If the attribute previously had a value and the browser doesn't support MutationObservers we then trigger an "attributes" event.
                remove: function(el, attrName) {
                    var oldValue;
                    if (!attr.MutationObserver) {
                        oldValue = attr.get(el, attrName);
                    }

                    var setter = attr.map[attrName];
                    if (typeof setter === "function") {
                        setter(el, undefined);
                    }
                    if (setter === true) {
                        el[attrName] = false;
                    } else if (typeof setter === "string") {
                        el[setter] = "";
                    } else {
                        el.removeAttribute(attrName);
                    }
                    if (!attr.MutationObserver && oldValue != null) {
                        attr.trigger(el, attrName, oldValue);
                    }

                },
                // ## attr.has
                // Checks if an element contains an attribute.
                // For browsers that support `hasAttribute`, creates a function that calls hasAttribute, otherwise creates a function that uses `getAttribute` to check that the attribute is not null.
                has: (function() {
                    var el = document.createElement('div');
                    if (el.hasAttribute) {
                        return function(el, name) {
                            return el.hasAttribute(name);
                        };
                    } else {
                        return function(el, name) {
                            return el.getAttribute(name) !== null;
                        };
                    }
                })()
            };

        return attr;

    })(__m5);

    // ## can/event/event.js
    var __m7 = (function(can) {
        // ## can.event.addEvent
        // Adds a basic event listener to an object.
        // This consists of storing a cache of event listeners on each object,
        // that are iterated through later when events are dispatched.

        can.addEvent = function(event, handler) {
            // Initialize event cache.
            var allEvents = this.__bindEvents || (this.__bindEvents = {}),
                eventList = allEvents[event] || (allEvents[event] = []);

            // Add the event
            eventList.push({
                    handler: handler,
                    name: event
                });
            return this;
        };

        // ## can.event.listenTo
        // Listens to an event without know how bind is implemented.
        // The primary use for this is to listen to another's objects event while 
        // tracking events on the local object (similar to namespacing).
        // The API was heavily influenced by BackboneJS: http://backbonejs.org/

        can.listenTo = function(other, event, handler) {
            // Initialize event cache
            var idedEvents = this.__listenToEvents;
            if (!idedEvents) {
                idedEvents = this.__listenToEvents = {};
            }

            // Identify the other object
            var otherId = can.cid(other);
            var othersEvents = idedEvents[otherId];

            // Create a local event cache
            if (!othersEvents) {
                othersEvents = idedEvents[otherId] = {
                    obj: other,
                    events: {}
                };
            }
            var eventsEvents = othersEvents.events[event];
            if (!eventsEvents) {
                eventsEvents = othersEvents.events[event] = [];
            }

            // Add the event, both locally and to the other object
            eventsEvents.push(handler);
            can.bind.call(other, event, handler);
        };

        // ## can.event.stopListening
        // Stops listening for events on other objects

        can.stopListening = function(other, event, handler) {
            var idedEvents = this.__listenToEvents,
                iterIdedEvents = idedEvents,
                i = 0;
            if (!idedEvents) {
                return this;
            }
            if (other) {
                var othercid = can.cid(other);
                (iterIdedEvents = {})[othercid] = idedEvents[othercid];
                // you might be trying to listen to something that is not there
                if (!idedEvents[othercid]) {
                    return this;
                }
            }

            // Clean up events on the other object
            for (var cid in iterIdedEvents) {
                var othersEvents = iterIdedEvents[cid],
                    eventsEvents;
                other = idedEvents[cid].obj;

                // Find the cache of events
                if (!event) {
                    eventsEvents = othersEvents.events;
                } else {
                    (eventsEvents = {})[event] = othersEvents.events[event];
                }

                // Unbind event handlers, both locally and on the other object
                for (var eventName in eventsEvents) {
                    var handlers = eventsEvents[eventName] || [];
                    i = 0;
                    while (i < handlers.length) {
                        if (handler && handler === handlers[i] || !handler) {
                            can.unbind.call(other, eventName, handlers[i]);
                            handlers.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                    // no more handlers?
                    if (!handlers.length) {
                        delete othersEvents.events[eventName];
                    }
                }
                if (can.isEmptyObject(othersEvents.events)) {
                    delete idedEvents[cid];
                }
            }
            return this;
        };

        // ## can.event.removeEvent
        // Removes a basic event listener from an object.
        // This removes event handlers from the cache of listened events.

        can.removeEvent = function(event, fn, __validate) {
            if (!this.__bindEvents) {
                return this;
            }
            var events = this.__bindEvents[event] || [],
                i = 0,
                ev, isFunction = typeof fn === 'function';
            while (i < events.length) {
                ev = events[i];
                // Determine whether this event handler is "equivalent" to the one requested
                // Generally this requires the same event/function, but a validation function 
                // can be included for extra conditions. This is used in some plugins like `can/event/namespace`.
                if (__validate ? __validate(ev, event, fn) : isFunction && ev.handler === fn || !isFunction && (ev.cid === fn || !fn)) {
                    events.splice(i, 1);
                } else {
                    i++;
                }
            }
            return this;
        };

        // ## can.event.dispatch
        // Dispatches/triggers a basic event on an object.

        can.dispatch = function(event, args) {
            var events = this.__bindEvents;
            if (!events) {
                return;
            }

            // Initialize the event object
            if (typeof event === 'string') {
                event = {
                    type: event
                };
            }

            // Grab event listeners
            var eventName = event.type,
                handlers = (events[eventName] || []).slice(0),
                passed = [event];

            // Execute handlers listening for this event.
            if (args) {
                passed.push.apply(passed, args);
            }

            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i].handler.apply(this, passed);
            }

            return event;
        };

        // ## can.event.one
        // Adds a basic event listener that listens to an event once and only once.

        can.one = function(event, handler) {
            // Unbind the listener after it has been executed
            var one = function() {
                can.unbind.call(this, event, one);
                return handler.apply(this, arguments);
            };

            // Bind the altered listener
            can.bind.call(this, event, one);
            return this;
        };

        // ## can.event
        // Create and export the `can.event` mixin
        can.event = {
            // Event method aliases

            on: function() {
                if (arguments.length === 0 && can.Control && this instanceof can.Control) {
                    return can.Control.prototype.on.call(this);
                } else {
                    return can.addEvent.apply(this, arguments);
                }
            },


            off: function() {
                if (arguments.length === 0 && can.Control && this instanceof can.Control) {
                    return can.Control.prototype.off.call(this);
                } else {
                    return can.removeEvent.apply(this, arguments);
                }
            },


            bind: can.addEvent,

            unbind: can.removeEvent,

            delegate: function(selector, event, handler) {
                return can.addEvent.call(this, event, handler);
            },

            undelegate: function(selector, event, handler) {
                return can.removeEvent.call(this, event, handler);
            },

            trigger: can.dispatch,

            // Normal can/event methods
            one: can.one,
            addEvent: can.addEvent,
            removeEvent: can.removeEvent,
            listenTo: can.listenTo,
            stopListening: can.stopListening,
            dispatch: can.dispatch
        };

        return can.event;
    })(__m5);

    // ## can/util/array/each.js
    var __m8 = (function(can) {

        // The following is from jQuery
        var isArrayLike = function(obj) {
            var length = obj.length;
            return typeof arr !== "function" &&
            (length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj);
        };

        can.each = function(elements, callback, context) {
            var i = 0,
                key,
                len,
                item;
            if (elements) {
                if (isArrayLike(elements)) {
                    if (can.List && elements instanceof can.List) {
                        for (len = elements.attr("length"); i < len; i++) {
                            item = elements.attr(i);
                            if (callback.call(context || item, item, i, elements) === false) {
                                break;
                            }
                        }
                    } else {
                        for (len = elements.length; i < len; i++) {
                            item = elements[i];
                            if (callback.call(context || item, item, i, elements) === false) {
                                break;
                            }
                        }
                    }

                } else if (typeof elements === "object") {

                    if (can.Map && elements instanceof can.Map || elements === can.route) {
                        var keys = can.Map.keys(elements);
                        for (i = 0, len = keys.length; i < len; i++) {
                            key = keys[i];
                            item = elements.attr(key);
                            if (callback.call(context || item, item, key, elements) === false) {
                                break;
                            }
                        }
                    } else {
                        for (key in elements) {
                            if (elements.hasOwnProperty(key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                                break;
                            }
                        }
                    }

                }
            }
            return elements;
        };
        return can;
    })(__m5);

    // ## can/util/inserted/inserted.js
    var __m9 = (function(can) {
        can.inserted = function(elems) {
            // Turn the `elems` property into an array to prevent mutations from changing the looping.
            elems = can.makeArray(elems);
            var inDocument = false,
                // Gets the `doc` to use as a reference for finding out whether the element is in the document.
                doc = can.$(document.contains ? document : document.body),
                children;
            // Go through `elems` and trigger the `inserted` event.
            // If the first element is not in the document (a Document Fragment) it will exit the function. If it is in the document it sets the `inDocument` flag to true. This means that we only check for the first element and either exit the function or start triggering "inserted" for child elements.
            for (var i = 0, elem;
                (elem = elems[i]) !== undefined; i++) {
                if (!inDocument) {
                    if (elem.getElementsByTagName) {
                        if (can.has(doc, elem)
                            .length) {
                            inDocument = true;
                        } else {
                            return;
                        }
                    } else {
                        continue;
                    }
                }

                // If we've found an element in the document then we can now trigger **"inserted"** for `elem` and all of its children. We are using `getElementsByTagName("*")` so that we grab all of the descendant nodes.
                if (inDocument && elem.getElementsByTagName) {
                    children = can.makeArray(elem.getElementsByTagName("*"));
                    can.trigger(elem, "inserted", [], false);
                    for (var j = 0, child;
                        (child = children[j]) !== undefined; j++) {
                        can.trigger(child, "inserted", [], false);
                    }
                }
            }
        };

        // ## can.appendChild
        // Used to append a node to an element and trigger the "inserted" event on all of the newly inserted children. Since `can.inserted` takes an array we convert the child to an array, or in the case of a DocumentFragment we first convert the childNodes to an array and call inserted on those.
        can.appendChild = function(el, child) {
            var children;
            if (child.nodeType === 11) {
                children = can.makeArray(child.childNodes);
            } else {
                children = [child];
            }
            el.appendChild(child);
            can.inserted(children);
        };

        // ## can.insertBefore
        // Like can.appendChild, used to insert a node to an element before a reference node and then trigger the "inserted" event.
        can.insertBefore = function(el, child, ref) {
            var children;
            if (child.nodeType === 11) {
                children = can.makeArray(child.childNodes);
            } else {
                children = [child];
            }
            el.insertBefore(child, ref);
            can.inserted(children);
        };
    })(__m5);

    // ## can/util/jquery/jquery.js
    var __m3 = (function($, can, attr, event) {
        var isBindableElement = function(node) {
            // In IE8 window.window !== window.window, so we allow == here.

            return (node.nodeName && (node.nodeType === 1 || node.nodeType === 9)) || node == window;
        };
        // _jQuery node list._
        $.extend(can, $, {
                trigger: function(obj, event, args, bubbles) {
                    if (isBindableElement(obj)) {
                        $.event.trigger(event, args, obj, !bubbles);
                    } else if (obj.trigger) {
                        obj.trigger(event, args);
                    } else {
                        if (typeof event === 'string') {
                            event = {
                                type: event
                            };
                        }
                        event.target = event.target || obj;
                        if (args) {
                            if (args.length && typeof args === "string") {
                                args = [args];
                            } else if (!args.length) {
                                args = [args];
                            }
                        }
                        if (!args) {
                            args = [];
                        }
                        can.dispatch.call(obj, event, args);
                    }
                },
                event: can.event,
                addEvent: can.addEvent,
                removeEvent: can.removeEvent,
                buildFragment: function(elems, context) {
                    // Check if this has any html nodes on our own.
                    var ret;
                    elems = [elems];
                    // Set context per 1.8 logic
                    context = context || document;
                    context = !context.nodeType && context[0] || context;
                    context = context.ownerDocument || context;
                    ret = $.buildFragment(elems, context);
                    return ret.cacheable ? $.clone(ret.fragment) : ret.fragment || ret;
                },
                $: $,
                each: can.each,
                bind: function(ev, cb) {
                    // If we can bind to it...
                    if (this.bind && this.bind !== can.bind) {
                        this.bind(ev, cb);
                    } else if (isBindableElement(this)) {
                        $.event.add(this, ev, cb);
                    } else {
                        // Make it bind-able...
                        can.addEvent.call(this, ev, cb);
                    }
                    return this;
                },
                unbind: function(ev, cb) {
                    // If we can bind to it...
                    if (this.unbind && this.unbind !== can.unbind) {
                        this.unbind(ev, cb);
                    } else if (isBindableElement(this)) {
                        $.event.remove(this, ev, cb);
                    } else {
                        // Make it bind-able...
                        can.removeEvent.call(this, ev, cb);
                    }
                    return this;
                },
                delegate: function(selector, ev, cb) {
                    if (this.delegate) {
                        this.delegate(selector, ev, cb);
                    } else if (isBindableElement(this)) {
                        $(this)
                            .delegate(selector, ev, cb);
                    } else {
                        // make it bind-able ...
                        can.bind.call(this, ev, cb);
                    }
                    return this;
                },
                undelegate: function(selector, ev, cb) {
                    if (this.undelegate) {
                        this.undelegate(selector, ev, cb);
                    } else if (isBindableElement(this)) {
                        $(this)
                            .undelegate(selector, ev, cb);
                    } else {
                        can.unbind.call(this, ev, cb);
                    }
                    return this;
                },
                proxy: function(fn, context) {
                    return function() {
                        return fn.apply(context, arguments);
                    };
                },
                attr: attr
            });
        // Wrap binding functions.

        // Aliases
        can.on = can.bind;
        can.off = can.unbind;
        // Wrap modifier functions.
        $.each([
                'append',
                'filter',
                'addClass',
                'remove',
                'data',
                'get',
                'has'
            ], function(i, name) {
                can[name] = function(wrapped) {
                    return wrapped[name].apply(wrapped, can.makeArray(arguments)
                        .slice(1));
                };
            });
        // Memory safe destruction.
        var oldClean = $.cleanData;
        $.cleanData = function(elems) {
            $.each(elems, function(i, elem) {
                if (elem) {
                    can.trigger(elem, 'removed', [], false);
                }
            });
            oldClean(elems);
        };
        var oldDomManip = $.fn.domManip,
            cbIndex;
        // feature detect which domManip we are using
        $.fn.domManip = function(args, cb1, cb2) {
            for (var i = 1; i < arguments.length; i++) {
                if (typeof arguments[i] === 'function') {
                    cbIndex = i;
                    break;
                }
            }
            return oldDomManip.apply(this, arguments);
        };
        $(document.createElement("div"))
            .append(document.createElement("div"));

        $.fn.domManip = (cbIndex === 2 ? function(args, table, callback) {
            return oldDomManip.call(this, args, table, function(elem) {
                var elems;
                if (elem.nodeType === 11) {
                    elems = can.makeArray(elem.childNodes);
                }
                var ret = callback.apply(this, arguments);
                can.inserted(elems ? elems : [elem]);
                return ret;
            });
        } : function(args, callback) {
            return oldDomManip.call(this, args, function(elem) {
                var elems;
                if (elem.nodeType === 11) {
                    elems = can.makeArray(elem.childNodes);
                }
                var ret = callback.apply(this, arguments);
                can.inserted(elems ? elems : [elem]);
                return ret;
            });
        });

        if (!can.attr.MutationObserver) {
            // handle via calls to attr
            var oldAttr = $.attr;
            $.attr = function(el, attrName) {
                var oldValue, newValue;
                if (arguments.length >= 3) {
                    oldValue = oldAttr.call(this, el, attrName);
                }
                var res = oldAttr.apply(this, arguments);
                if (arguments.length >= 3) {
                    newValue = oldAttr.call(this, el, attrName);
                }
                if (newValue !== oldValue) {
                    can.attr.trigger(el, attrName, oldValue);
                }
                return res;
            };
            var oldRemove = $.removeAttr;
            $.removeAttr = function(el, attrName) {
                var oldValue = oldAttr.call(this, el, attrName),
                    res = oldRemove.apply(this, arguments);

                if (oldValue != null) {
                    can.attr.trigger(el, attrName, oldValue);
                }
                return res;
            };
            $.event.special.attributes = {
                setup: function() {
                    can.data(can.$(this), "canHasAttributesBindings", true);
                },
                teardown: function() {
                    $.removeData(this, "canHasAttributesBindings");
                }
            };
        } else {
            // setup a special events
            $.event.special.attributes = {
                setup: function() {
                    var self = this;
                    var observer = new can.attr.MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            var copy = can.simpleExtend({}, mutation);
                            can.trigger(self, copy, []);
                        });

                    });
                    observer.observe(this, {
                            attributes: true,
                            attributeOldValue: true
                        });
                    can.data(can.$(this), "canAttributesObserver", observer);
                },
                teardown: function() {
                    can.data(can.$(this), "canAttributesObserver")
                        .disconnect();
                    $.removeData(this, "canAttributesObserver");

                }
            };
        }

        // ## Fix build fragment.
        // In IE8, we can pass jQuery a fragment and it removes newlines.
        // This checks for that and replaces can.buildFragment with something
        // that if only a single text node is returned, returns a fragment with
        // a text node that is set to the content.
        (function() {

            var text = "<-\n>",
                frag = can.buildFragment(text, document);
            if (text !== frag.childNodes[0].nodeValue) {

                var oldBuildFragment = can.buildFragment;
                can.buildFragment = function(content, context) {
                    var res = oldBuildFragment(content, context);
                    if (res.childNodes.length === 1 && res.childNodes[0].nodeType === 3) {
                        res.childNodes[0].nodeValue = content;
                    }
                    return res;
                };

            }



        })();

        $.event.special.inserted = {};
        $.event.special.removed = {};
        return can;
    })(jQuery, __m5, __m6, __m7, __m8, __m9);

    // ## can/util/string/string.js
    var __m2 = (function(can) {
        // ##string.js
        // _Miscellaneous string utility functions._  
        // Several of the methods in this plugin use code adapated from Prototype
        // Prototype JavaScript framework, version 1.6.0.1.
        // © 2005-2007 Sam Stephenson
        var strUndHash = /_|-/,
            strColons = /\=\=/,
            strWords = /([A-Z]+)([A-Z][a-z])/g,
            strLowUp = /([a-z\d])([A-Z])/g,
            strDash = /([a-z\d])([A-Z])/g,
            strReplacer = /\{([^\}]+)\}/g,
            strQuote = /"/g,
            strSingleQuote = /'/g,
            strHyphenMatch = /-+(.)?/g,
            strCamelMatch = /[a-z][A-Z]/g,
            // Returns the `prop` property from `obj`.
            // If `add` is true and `prop` doesn't exist in `obj`, create it as an
            // empty object.
            getNext = function(obj, prop, add) {
                var result = obj[prop];
                if (result === undefined && add === true) {
                    result = obj[prop] = {};
                }
                return result;
            },
            // Returns `true` if the object can have properties (no `null`s).
            isContainer = function(current) {
                return /^f|^o/.test(typeof current);
            }, convertBadValues = function(content) {
                // Convert bad values into empty strings
                var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
                return '' + (isInvalid ? '' : content);
            };
        can.extend(can, {
                esc: function(content) {
                    return convertBadValues(content)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(strQuote, '&#34;')
                        .replace(strSingleQuote, '&#39;');
                },
                getObject: function(name, roots, add) {
                    // The parts of the name we are looking up
                    // `['App','Models','Recipe']`
                    var parts = name ? name.split('.') : [],
                        length = parts.length,
                        current, r = 0,
                        i, container, rootsLength;
                    // Make sure roots is an `array`.
                    roots = can.isArray(roots) ? roots : [roots || window];
                    rootsLength = roots.length;
                    if (!length) {
                        return roots[0];
                    }
                    // For each root, mark it as current.
                    for (r; r < rootsLength; r++) {
                        current = roots[r];
                        container = undefined;
                        // Walk current to the 2nd to last object or until there
                        // is not a container.
                        for (i = 0; i < length && isContainer(current); i++) {
                            container = current;
                            current = getNext(container, parts[i]);
                        }
                        // If we found property break cycle
                        if (container !== undefined && current !== undefined) {
                            break;
                        }
                    }
                    // Remove property from found container
                    if (add === false && current !== undefined) {
                        delete container[parts[i - 1]];
                    }
                    // When adding property add it to the first root
                    if (add === true && current === undefined) {
                        current = roots[0];
                        for (i = 0; i < length && isContainer(current); i++) {
                            current = getNext(current, parts[i], true);
                        }
                    }
                    return current;
                },
                capitalize: function(s, cache) {
                    // Used to make newId.
                    return s.charAt(0)
                        .toUpperCase() + s.slice(1);
                },
                camelize: function(str) {
                    return convertBadValues(str)
                        .replace(strHyphenMatch, function(match, chr) {
                            return chr ? chr.toUpperCase() : '';
                        });
                },
                hyphenate: function(str) {
                    return convertBadValues(str)
                        .replace(strCamelMatch, function(str, offset) {
                            return str.charAt(0) + '-' + str.charAt(1)
                                .toLowerCase();
                        });
                },
                underscore: function(s) {
                    return s.replace(strColons, '/')
                        .replace(strWords, '$1_$2')
                        .replace(strLowUp, '$1_$2')
                        .replace(strDash, '_')
                        .toLowerCase();
                },
                sub: function(str, data, remove) {
                    var obs = [];
                    str = str || '';
                    obs.push(str.replace(strReplacer, function(whole, inside) {
                                // Convert inside to type.
                                var ob = can.getObject(inside, data, remove === true ? false : undefined);
                                if (ob === undefined || ob === null) {
                                    obs = null;
                                    return '';
                                }
                                // If a container, push into objs (which will return objects found).
                                if (isContainer(ob) && obs) {
                                    obs.push(ob);
                                    return '';
                                }
                                return '' + ob;
                            }));
                    return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
                },
                replacer: strReplacer,
                undHash: strUndHash
            });
        return can;
    })(__m3);

    // ## can/construct/construct.js
    var __m1 = (function(can) {
        // ## construct.js
        // `can.Construct`  
        // _This is a modified version of
        // [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).  
        // It provides class level inheritance and callbacks._
        // A private flag used to initialize a new class instance without
        // initializing it's bindings.
        var initializing = 0;
        var getDescriptor = function(newProps, name) {
            var descriptor = Object.getOwnPropertyDescriptor(newProps, name);
            if (descriptor && (descriptor.get || descriptor.set)) {
                return descriptor;
            }
            return null;
        },
            inheritGetterSetter = function(newProps, oldProps, addTo) {
                addTo = addTo || newProps;
                var descriptor;

                for (var name in newProps) {
                    if ((descriptor = getDescriptor(newProps, name))) {
                        this._defineProperty(addTo, oldProps, name, descriptor);
                    } else {
                        can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
                    }
                }
            },
            simpleInherit = function(newProps, oldProps, addTo) {
                addTo = addTo || newProps;

                for (var name in newProps) {
                    can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
                }
            };


        can.Construct = function() {
            if (arguments.length) {
                return can.Construct.extend.apply(can.Construct, arguments);
            }
        };

        can.extend(can.Construct, {

                constructorExtends: true,

                newInstance: function() {
                    // Get a raw instance object (`init` is not called).
                    var inst = this.instance(),
                        args;
                    // Call `setup` if there is a `setup`
                    if (inst.setup) {
                        args = inst.setup.apply(inst, arguments);
                    }
                    // Call `init` if there is an `init`  
                    // If `setup` returned `args`, use those as the arguments
                    if (inst.init) {
                        inst.init.apply(inst, args || arguments);
                    }
                    return inst;
                },
                // Overwrites an object with methods. Used in the `super` plugin.
                // `newProps` - New properties to add.
                // `oldProps` - Where the old properties might be (used with `super`).
                // `addTo` - What we are adding to.
                _inherit: Object.getOwnPropertyDescriptor ? inheritGetterSetter : simpleInherit,

                // Adds a `defineProperty` with the given name and descriptor
                // Will only ever be called if ES5 is supported
                _defineProperty: function(what, oldProps, propName, descriptor) {
                    Object.defineProperty(what, propName, descriptor);
                },

                // used for overwriting a single property.
                // this should be used for patching other objects
                // the super plugin overwrites this
                _overwrite: function(what, oldProps, propName, val) {
                    what[propName] = val;
                },
                // Set `defaults` as the merger of the parent `defaults` and this
                // object's `defaults`. If you overwrite this method, make sure to
                // include option merging logic.

                setup: function(base, fullName) {
                    this.defaults = can.extend(true, {}, base.defaults, this.defaults);
                },
                // Create's a new `class` instance without initializing by setting the
                // `initializing` flag.
                instance: function() {
                    // Prevents running `init`.
                    initializing = 1;
                    var inst = new this();
                    // Allow running `init`.
                    initializing = 0;
                    return inst;
                },
                // Extends classes.

                extend: function(name, staticProperties, instanceProperties) {
                    var fullName = name,
                        klass = staticProperties,
                        proto = instanceProperties;

                    // Figure out what was passed and normalize it.
                    if (typeof fullName !== 'string') {
                        proto = klass;
                        klass = fullName;
                        fullName = null;
                    }
                    if (!proto) {
                        proto = klass;
                        klass = null;
                    }
                    proto = proto || {};
                    var _super_class = this,
                        _super = this.prototype,
                        parts, current, _fullName, _shortName, propName, shortName, namespace, prototype;
                    // Instantiate a base class (but only create the instance,
                    // don't run the init constructor).
                    prototype = this.instance();
                    // Copy the properties over onto the new prototype.
                    can.Construct._inherit(proto, _super, prototype);
                    // The dummy class constructor.

                    function Constructor() {
                        // All construction is actually done in the init method.
                        if (!initializing) {


                            return this.constructor !== Constructor &&
                            // We are being called without `new` or we are extending.
                            arguments.length && Constructor.constructorExtends ? Constructor.extend.apply(Constructor, arguments) :
                            // We are being called with `new`.
                            Constructor.newInstance.apply(Constructor, arguments);
                        }
                    }
                    // Copy old stuff onto class (can probably be merged w/ inherit)
                    for (propName in _super_class) {
                        if (_super_class.hasOwnProperty(propName)) {
                            Constructor[propName] = _super_class[propName];
                        }
                    }
                    // Copy new static properties on class.
                    can.Construct._inherit(klass, _super_class, Constructor);
                    // Setup namespaces.
                    if (fullName) {

                        parts = fullName.split('.');
                        shortName = parts.pop();
                        current = can.getObject(parts.join('.'), window, true);
                        namespace = current;
                        _fullName = can.underscore(fullName.replace(/\./g, "_"));
                        _shortName = can.underscore(shortName);



                        current[shortName] = Constructor;
                    }
                    // Set things that shouldn't be overwritten.
                    can.extend(Constructor, {
                            constructor: Constructor,
                            prototype: prototype,

                            namespace: namespace,

                            _shortName: _shortName,

                            fullName: fullName,
                            _fullName: _fullName
                        });
                    // Dojo and YUI extend undefined
                    if (shortName !== undefined) {
                        Constructor.shortName = shortName;
                    }
                    // Make sure our prototype looks nice.
                    Constructor.prototype.constructor = Constructor;
                    // Call the class `setup` and `init`
                    var t = [_super_class].concat(can.makeArray(arguments)),
                        args = Constructor.setup.apply(Constructor, t);
                    if (Constructor.init) {
                        Constructor.init.apply(Constructor, args || t);
                    }

                    return Constructor;
                }
            });

        can.Construct.prototype.setup = function() {};

        can.Construct.prototype.init = function() {};
        return can.Construct;
    })(__m2);

    // ## can/util/bind/bind.js
    var __m11 = (function(can) {

        // ## Bind helpers
        can.bindAndSetup = function() {
            // Add the event to this object
            can.addEvent.apply(this, arguments);
            // If not initializing, and the first binding
            // call bindsetup if the function exists.
            if (!this._init) {
                if (!this._bindings) {
                    this._bindings = 1;
                    // setup live-binding
                    if (this._bindsetup) {
                        this._bindsetup();
                    }
                } else {
                    this._bindings++;
                }
            }
            return this;
        };
        can.unbindAndTeardown = function(ev, handler) {
            // Remove the event handler
            can.removeEvent.apply(this, arguments);
            if (this._bindings === null) {
                this._bindings = 0;
            } else {
                this._bindings--;
            }
            // If there are no longer any bindings and
            // there is a bindteardown method, call it.
            if (!this._bindings && this._bindteardown) {
                this._bindteardown();
            }
            return this;
        };
        return can;
    })(__m3);

    // ## can/map/bubble.js
    var __m12 = (function(can) {

        var bubble = can.bubble = {
            // Given a binding, returns a string event name used to set up bubbline.
            // If no binding should be done, undefined or null should be returned
            event: function(map, eventName) {
                return map.constructor._bubbleRule(eventName, map);
            },
            childrenOf: function(parentMap, eventName) {

                parentMap._each(function(child, prop) {
                    if (child && child.bind) {
                        bubble.toParent(child, parentMap, prop, eventName);
                    }
                });

            },
            teardownChildrenFrom: function(parentMap, eventName) {
                parentMap._each(function(child) {

                    bubble.teardownFromParent(parentMap, child, eventName);

                });
            },
            toParent: function(child, parent, prop, eventName) {
                can.listenTo.call(parent, child, eventName, function() {
                    // `batchTrigger` the type on this...
                    var args = can.makeArray(arguments),
                        ev = args.shift();

                    args[0] =
                    (can.List && parent instanceof can.List ?
                        parent.indexOf(child) :
                        prop) + (args[0] ? "." + args[0] : "");

                    // track objects dispatched on this map
                    ev.triggeredNS = ev.triggeredNS || {};

                    // if it has already been dispatched exit
                    if (ev.triggeredNS[parent._cid]) {
                        return;
                    }

                    ev.triggeredNS[parent._cid] = true;
                    // send change event with modified attr to parent
                    can.trigger(parent, ev, args);
                });
            },
            teardownFromParent: function(parent, child, eventName) {
                if (child && child.unbind) {
                    can.stopListening.call(parent, child, eventName);
                }
            },
            isBubbling: function(parent, eventName) {
                return parent._bubbleBindings && parent._bubbleBindings[eventName];
            },
            bind: function(parent, eventName) {
                if (!parent._init) {
                    var bubbleEvent = bubble.event(parent, eventName);
                    if (bubbleEvent) {
                        if (!parent._bubbleBindings) {
                            parent._bubbleBindings = {};
                        }
                        if (!parent._bubbleBindings[bubbleEvent]) {
                            parent._bubbleBindings[bubbleEvent] = 1;
                            // setup live-binding
                            bubble.childrenOf(parent, bubbleEvent);
                        } else {
                            parent._bubbleBindings[bubbleEvent]++;
                        }

                    }
                }
            },
            unbind: function(parent, eventName) {
                var bubbleEvent = bubble.event(parent, eventName);
                if (bubbleEvent) {
                    if (parent._bubbleBindings) {
                        parent._bubbleBindings[bubbleEvent]--;
                    }
                    if (parent._bubbleBindings && !parent._bubbleBindings[bubbleEvent]) {
                        delete parent._bubbleBindings[bubbleEvent];
                        bubble.teardownChildrenFrom(parent, bubbleEvent);
                        if (can.isEmptyObject(parent._bubbleBindings)) {
                            delete parent._bubbleBindings;
                        }
                    }
                }
            },
            add: function(parent, child, prop) {
                if (child instanceof can.Map && parent._bubbleBindings) {
                    for (var eventName in parent._bubbleBindings) {
                        if (parent._bubbleBindings[eventName]) {
                            bubble.teardownFromParent(parent, child, eventName);
                            bubble.toParent(child, parent, prop, eventName);
                        }
                    }
                }
            },
            removeMany: function(parent, children) {
                for (var i = 0, len = children.length; i < len; i++) {
                    bubble.remove(parent, children[i]);
                }
            },
            remove: function(parent, child) {
                if (child instanceof can.Map && parent._bubbleBindings) {
                    for (var eventName in parent._bubbleBindings) {
                        if (parent._bubbleBindings[eventName]) {
                            bubble.teardownFromParent(parent, child, eventName);
                        }
                    }
                }
            },
            set: function(parent, prop, value, current) {

                //var res = parent.__type(value, prop);
                if (can.Map.helpers.isObservable(value)) {
                    bubble.add(parent, value, prop);
                }
                // bubble.add will remove, so only remove if we are replacing another object
                if (can.Map.helpers.isObservable(current)) {
                    bubble.remove(parent, current);
                }
                return value;
            }
        };

        return bubble;

    })(__m3);

    // ## can/util/batch/batch.js
    var __m13 = (function(can) {
        // Which batch of events this is for -- might not want to send multiple
        // messages on the same batch.  This is mostly for event delegation.
        var batchNum = 1,
            // how many times has start been called without a stop
            transactions = 0,
            // an array of events within a transaction
            batchEvents = [],
            stopCallbacks = [];
        can.batch = {

            start: function(batchStopHandler) {
                transactions++;
                if (batchStopHandler) {
                    stopCallbacks.push(batchStopHandler);
                }
            },

            stop: function(force, callStart) {
                if (force) {
                    transactions = 0;
                } else {
                    transactions--;
                }
                if (transactions === 0) {
                    var items = batchEvents.slice(0),
                        callbacks = stopCallbacks.slice(0),
                        i, len;
                    batchEvents = [];
                    stopCallbacks = [];
                    batchNum++;
                    if (callStart) {
                        can.batch.start();
                    }
                    for (i = 0, len = items.length; i < len; i++) {
                        can.dispatch.apply(items[i][0], items[i][1]);
                    }
                    for (i = 0, len = callbacks.length; i < callbacks.length; i++) {
                        callbacks[i]();
                    }
                }
            },

            trigger: function(item, event, args) {
                // Don't send events if initalizing.
                if (!item._init) {
                    if (transactions === 0) {
                        return can.dispatch.call(item, event, args);
                    } else {
                        event = typeof event === 'string' ? {
                            type: event
                        } : event;
                        event.batchNum = batchNum;
                        batchEvents.push([
                                item, [event, args]
                            ]);
                    }
                }
            }
        };
    })(__m5);

    // ## can/map/map.js
    var __m10 = (function(can, bind, bubble) {
        // ## Helpers

        // A temporary map of Maps that have been made from plain JS objects.
        var madeMap = null;
        // Clears out map of converted objects.
        var teardownMap = function() {
            for (var cid in madeMap) {
                if (madeMap[cid].added) {
                    delete madeMap[cid].obj._cid;
                }
            }
            madeMap = null;
        };
        // Retrieves a Map instance from an Object.
        var getMapFromObject = function(obj) {
            return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
        };
        // A temporary map of Maps
        var serializeMap = null;


        var Map = can.Map = can.Construct.extend({

                setup: function() {

                    can.Construct.setup.apply(this, arguments);

                    // Do not run if we are defining can.Map.
                    if (can.Map) {
                        if (!this.defaults) {
                            this.defaults = {};
                        }
                        // Builds a list of compute and non-compute properties in this Object's prototype.
                        this._computes = [];

                        for (var prop in this.prototype) {
                            // Non-functions are regular defaults.
                            if (
                                prop !== "define" &&
                                prop !== "constructor" &&
                                (
                                    typeof this.prototype[prop] !== "function" ||
                                    this.prototype[prop].prototype instanceof can.Construct)) {
                                this.defaults[prop] = this.prototype[prop];
                                // Functions with an `isComputed` property are computes.
                            } else if (this.prototype[prop].isComputed) {
                                this._computes.push(prop);
                            }
                        }
                        if (this.helpers.define) {
                            this.helpers.define(this);
                        }
                    }
                    // If we inherit from can.Map, but not can.List, make sure any lists are the correct type.
                    if (can.List && !(this.prototype instanceof can.List)) {
                        this.List = Map.List.extend({
                                Map: this
                            }, {});
                    }

                },
                // Reference to bubbling helpers.
                _bubble: bubble,
                // Given an eventName, determine if bubbling should be setup.
                _bubbleRule: function(eventName) {
                    return (eventName === "change" || eventName.indexOf(".") >= 0) && "change";
                },
                // List of computes on the Map's prototype.
                _computes: [],
                // Adds an event to this Map.
                bind: can.bindAndSetup,
                on: can.bindAndSetup,
                // Removes an event from this Map.
                unbind: can.unbindAndTeardown,
                off: can.unbindAndTeardown,
                // Name of the id field. Used in can.Model.
                id: "id",
                // ## Internal helpers
                helpers: {
                    // ### can.Map.helpers.define
                    // Stub function for the define plugin.
                    define: null,

                    // ### can.Map.helpers.attrParts
                    // Parses attribute name into its parts.
                    attrParts: function(attr, keepKey) {
                        //Keep key intact

                        if (keepKey) {
                            return [attr];
                        }
                        // Split key on '.'
                        return typeof attr === "object" ? attr : ("" + attr)
                            .split(".");
                    },

                    // ### can.Map.helpers.addToMap
                    // Tracks Map instances created from JS Objects
                    addToMap: function(obj, instance) {
                        var teardown;
                        // Setup a fresh mapping if `madeMap` is missing.
                        if (!madeMap) {
                            teardown = teardownMap;
                            madeMap = {};
                        }
                        // Record if Object has a `_cid` before adding one.
                        var hasCid = obj._cid;
                        var cid = can.cid(obj);

                        // Only update if there already isn't one already.
                        if (!madeMap[cid]) {

                            madeMap[cid] = {
                                obj: obj,
                                instance: instance,
                                added: !hasCid
                            };
                        }
                        return teardown;
                    },

                    // ### can.Map.helpers.isObservable
                    // Determines if `obj` is observable.
                    isObservable: function(obj) {
                        return obj instanceof can.Map || (obj && obj === can.route);
                    },

                    // ### can.Map.helpers.canMakeObserve
                    // Determines if an object can be made into an observable.
                    canMakeObserve: function(obj) {
                        return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj));
                    },

                    // ### can.Map.helpers.serialize
                    // Serializes a Map or Map.List
                    serialize: function(map, how, where) {
                        var cid = can.cid(map),
                            firstSerialize = false;
                        if (!serializeMap) {
                            firstSerialize = true;
                            // Serialize might call .attr() so we need to keep different map
                            serializeMap = {
                                attr: {},
                                serialize: {}
                            };
                        }
                        serializeMap[how][cid] = where;
                        // Go through each property.
                        map.each(function(val, name) {
                            // If the value is an `object`, and has an `attrs` or `serialize` function.
                            var result,
                                isObservable = Map.helpers.isObservable(val),
                                serialized = isObservable && serializeMap[how][can.cid(val)];
                            if (serialized) {
                                result = serialized;
                            } else {
                                if (how === "serialize") {
                                    result = Map.helpers._serialize(map, name, val);
                                } else {
                                    result = Map.helpers._getValue(map, name, val, how);
                                }
                            }
                            // this is probably removable
                            if (result !== undefined) {
                                where[name] = result;
                            }
                        });

                        can.__reading(map, '__keys');
                        if (firstSerialize) {
                            serializeMap = null;
                        }
                        return where;
                    },
                    _serialize: function(map, name, val) {
                        return Map.helpers._getValue(map, name, val, "serialize");
                    },
                    _getValue: function(map, name, val, how) {
                        if (Map.helpers.isObservable(val)) {
                            return val[how]();
                        } else {
                            return val;
                        }
                    }
                },

                keys: function(map) {
                    var keys = [];
                    can.__reading(map, '__keys');
                    for (var keyName in map._data) {
                        keys.push(keyName);
                    }
                    return keys;
                }
            },

            {
                setup: function(obj) {
                    if (obj instanceof can.Map) {
                        obj = obj.serialize();
                    }

                    // `_data` is where we keep the properties.
                    this._data = {};

                    // The namespace this `object` uses to listen to events.
                    can.cid(this, ".map");
                    // Sets all `attrs`.
                    this._init = 1;
                    this._computedBindings = {};

                    // It's handy if we pass this to computes, because computes can have a default value.
                    var defaultValues = this._setupDefaults(obj);
                    this._setupComputes(defaultValues);
                    var teardownMapping = obj && can.Map.helpers.addToMap(obj, this);

                    var data = can.extend(can.extend(true, {}, defaultValues), obj);

                    this.attr(data);

                    if (teardownMapping) {
                        teardownMapping();
                    }

                    // `batchTrigger` change events.
                    this.bind('change', can.proxy(this._changes, this));

                    delete this._init;
                },
                // Sets up computed properties on a Map.
                _setupComputes: function() {
                    var computes = this.constructor._computes;

                    for (var i = 0, len = computes.length, prop; i < len; i++) {
                        prop = computes[i];
                        // Make the context of the compute the current Map
                        this[prop] = this[prop].clone(this);
                        // Keep track of computed properties
                        this._computedBindings[prop] = {
                            count: 0
                        };
                    }
                },
                _setupDefaults: function() {
                    return this.constructor.defaults || {};
                },
                // Setup child bindings.
                _bindsetup: function() {},
                // Teardown child bindings.
                _bindteardown: function() {},
                // `change`event handler.
                _changes: function(ev, attr, how, newVal, oldVal) {
                    // when a change happens, create the named event.
                    can.batch.trigger(this, {
                            type: attr,
                            batchNum: ev.batchNum,
                            target: ev.target
                        }, [newVal, oldVal]);

                },
                // Trigger a change event.
                _triggerChange: function(attr, how, newVal, oldVal) {
                    // so this change can bubble ... a bubbling change triggers the
                    // _changes trigger
                    if (bubble.isBubbling(this, "change")) {
                        can.batch.trigger(this, {
                                type: "change",
                                target: this
                            }, [attr, how, newVal, oldVal]);
                    } else {
                        can.batch.trigger(this, attr, [newVal, oldVal]);
                    }

                    if (how === "remove" || how === "add") {
                        can.batch.trigger(this, {
                                type: "__keys",
                                target: this
                            });
                    }
                },
                // Iterator that does not trigger live binding.
                _each: function(callback) {
                    var data = this.__get();
                    for (var prop in data) {
                        if (data.hasOwnProperty(prop)) {
                            callback(data[prop], prop);
                        }
                    }
                },

                attr: function(attr, val) {
                    // This is super obfuscated for space -- basically, we're checking
                    // if the type of the attribute is not a `number` or a `string`.
                    var type = typeof attr;
                    if (type !== "string" && type !== "number") {
                        return this._attrs(attr, val);
                        // If we are getting a value.
                    } else if (arguments.length === 1) {
                        can.__reading(this, attr);
                        return this._get(attr);
                    } else {
                        // Otherwise we are setting.
                        this._set(attr, val);
                        return this;
                    }
                },

                each: function() {
                    return can.each.apply(undefined, [this].concat(can.makeArray(arguments)));
                },

                removeAttr: function(attr) {
                    // If this is List.
                    var isList = can.List && this instanceof can.List,
                        // Convert the `attr` into parts (if nested).
                        parts = can.Map.helpers.attrParts(attr),
                        // The actual property to remove.
                        prop = parts.shift(),
                        // The current value.
                        current = isList ? this[prop] : this._data[prop];

                    // If we have more parts, call `removeAttr` on that part.
                    if (parts.length && current) {
                        return current.removeAttr(parts);
                    } else {

                        // If attr does not have a `.`
                        if (typeof attr === 'string' && !! ~attr.indexOf('.')) {
                            prop = attr;
                        }

                        this._remove(prop, current);
                        return current;
                    }
                },
                // Remove a property.
                _remove: function(prop, current) {
                    if (prop in this._data) {
                        // Delete the property from `_data` and the Map
                        // as long as it isn't part of the Map's prototype.
                        delete this._data[prop];
                        if (!(prop in this.constructor.prototype)) {
                            delete this[prop];
                        }
                        // Let others now this property has been removed.
                        this._triggerChange(prop, "remove", undefined, current);

                    }
                },
                // Reads a property from the `object`.
                _get: function(attr) {
                    attr = "" + attr;
                    var dotIndex = attr.indexOf('.');

                    // Handles the case of a key having a `.` in its name
                    // Otherwise we have to dig deeper into the Map to get the value.
                    if (dotIndex >= 0) {
                        // Attempt to get the value
                        var value = this.__get(attr);
                        // For keys with a `.` in them, value will be defined
                        if (value !== undefined) {
                            return value;
                        }
                        var first = attr.substr(0, dotIndex),
                            second = attr.substr(dotIndex + 1),
                            current = this.__get(first);
                        return current && current._get ? current._get(second) : undefined;
                    } else {
                        return this.__get(attr);
                    }
                },
                // Reads a property directly if an `attr` is provided, otherwise
                // returns the "real" data object itself.
                __get: function(attr) {
                    if (attr) {
                        // If property is a compute return the result, otherwise get the value directly
                        if (this._computedBindings[attr]) {
                            return this[attr]();
                        } else {
                            return this._data[attr];
                        }
                        // If not property is provided, return entire `_data` object
                    } else {
                        return this._data;
                    }
                },
                // converts the value into an observable if needed
                __type: function(value, prop) {
                    // If we are getting an object.
                    if (!(value instanceof can.Map) && can.Map.helpers.canMakeObserve(value)) {

                        var cached = getMapFromObject(value);
                        if (cached) {
                            return cached;
                        }
                        if (can.isArray(value)) {
                            var List = can.List;
                            return new List(value);
                        } else {
                            var Map = this.constructor.Map || can.Map;
                            return new Map(value);
                        }
                    }
                    return value;
                },
                // Sets `attr` prop as value on this object where.
                // `attr` - Is a string of properties or an array  of property values.
                // `value` - The raw value to set.
                _set: function(attr, value, keepKey) {
                    attr = "" + attr;
                    var dotIndex = attr.indexOf('.'),
                        current;
                    if (!keepKey && dotIndex >= 0) {
                        var first = attr.substr(0, dotIndex),
                            second = attr.substr(dotIndex + 1);

                        current = this._init ? undefined : this.__get(first);

                        if (Map.helpers.isObservable(current)) {
                            current._set(second, value);
                        } else {
                            throw "can.Map: Object does not exist";
                        }
                    } else {
                        if (this.__convert) {
                            //Convert if there is a converter
                            value = this.__convert(attr, value);
                        }
                        current = this._init ? undefined : this.__get(attr);
                        this.__set(attr, this.__type(value, attr), current);
                    }
                },
                __set: function(prop, value, current) {
                    // TODO: Check if value is object and transform.
                    // Don't do anything if the value isn't changing.
                    if (value !== current) {
                        // Check if we are adding this for the first time --
                        // if we are, we need to create an `add` event.
                        var changeType = current !== undefined || this.__get()
                            .hasOwnProperty(prop) ? "set" : "add";

                        // Set the value on `_data` and hook it up to send event.
                        this.___set(prop, this.constructor._bubble.set(this, prop, value, current));

                        // `batchTrigger` the change event.
                        this._triggerChange(prop, changeType, value, current);

                        // If we can stop listening to our old value, do it.
                        if (current) {
                            this.constructor._bubble.teardownFromParent(this, current);
                        }
                    }

                },
                // Directly sets a property on this `object`.
                ___set: function(prop, val) {
                    if (this._computedBindings[prop]) {
                        this[prop](val);
                    } else {
                        this._data[prop] = val;
                    }
                    // Add property directly for easy writing.
                    // Check if its on the `prototype` so we don't overwrite methods like `attrs`.
                    if (typeof this.constructor.prototype[prop] !== 'function' && !this._computedBindings[prop]) {
                        this[prop] = val;
                    }
                },

                bind: function(eventName, handler) {
                    var computedBinding = this._computedBindings && this._computedBindings[eventName];
                    if (computedBinding) {
                        // The first time we bind to this computed property we
                        // initialize `count` and `batchTrigger` the change event.
                        if (!computedBinding.count) {
                            computedBinding.count = 1;
                            var self = this;
                            computedBinding.handler = function(ev, newVal, oldVal) {
                                can.batch.trigger(self, {
                                        type: eventName,
                                        batchNum: ev.batchNum,
                                        target: self
                                    }, [newVal, oldVal]);
                            };
                            this[eventName].bind("change", computedBinding.handler);
                        } else {
                            // Increment number of things listening to this computed property.
                            computedBinding.count++;
                        }

                    }
                    // The first time we bind to this Map, `_bindsetup` will
                    // be called to setup child event bubbling.
                    this.constructor._bubble.bind(this, eventName);
                    return can.bindAndSetup.apply(this, arguments);

                },

                unbind: function(eventName, handler) {
                    var computedBinding = this._computedBindings && this._computedBindings[eventName];
                    if (computedBinding) {
                        // If there is only one listener, we unbind the change event handler
                        // and clean it up since no one is listening to this property any more.
                        if (computedBinding.count === 1) {
                            computedBinding.count = 0;
                            this[eventName].unbind("change", computedBinding.handler);
                            delete computedBinding.handler;
                        } else {
                            // Decrement number of things listening to this computed property
                            computedBinding.count--;
                        }

                    }
                    this.constructor._bubble.unbind(this, eventName);
                    return can.unbindAndTeardown.apply(this, arguments);

                },

                serialize: function() {
                    return can.Map.helpers.serialize(this, 'serialize', {});
                },

                _attrs: function(props, remove) {
                    if (props === undefined) {
                        return Map.helpers.serialize(this, 'attr', {});
                    }

                    props = can.simpleExtend({}, props);
                    var prop,
                        self = this,
                        newVal;

                    // Batch all of the change events until we are done.
                    can.batch.start();
                    // Merge current properties with the new ones.
                    this.each(function(curVal, prop) {
                        // You can not have a _cid property; abort.
                        if (prop === "_cid") {
                            return;
                        }
                        newVal = props[prop];

                        // If we are merging, remove the property if it has no value.
                        if (newVal === undefined) {
                            if (remove) {
                                self.removeAttr(prop);
                            }
                            return;
                        }

                        // Run converter if there is one
                        if (self.__convert) {
                            newVal = self.__convert(prop, newVal);
                        }

                        // If we're dealing with models, we want to call _set to let converters run.
                        if (Map.helpers.isObservable(newVal)) {

                            self.__set(prop, self.__type(newVal, prop), curVal);
                            // If its an object, let attr merge.
                        } else if (Map.helpers.isObservable(curVal) && Map.helpers.canMakeObserve(newVal)) {
                            curVal.attr(newVal, remove);
                            // Otherwise just set.
                        } else if (curVal !== newVal) {
                            self.__set(prop, self.__type(newVal, prop), curVal);
                        }

                        delete props[prop];
                    });
                    // Add remaining props.
                    for (prop in props) {
                        // Ignore _cid.
                        if (prop !== "_cid") {
                            newVal = props[prop];
                            this._set(prop, newVal, true);
                        }

                    }
                    can.batch.stop();
                    return this;
                },

                compute: function(prop) {
                    // If the property is a function, use it as the getter/setter
                    // otherwise, create a new compute that returns the value of a property on `this`
                    if (can.isFunction(this.constructor.prototype[prop])) {
                        return can.compute(this[prop], this);
                    } else {
                        var reads = prop.split("."),
                            last = reads.length - 1,
                            options = {
                                args: []
                            };
                        return can.compute(function(newVal) {
                            if (arguments.length) {
                                can.compute.read(this, reads.slice(0, last))
                                    .value.attr(reads[last], newVal);
                            } else {
                                return can.compute.read(this, reads, options)
                                    .value;
                            }
                        }, this);
                    }

                }
            });

        // Setup on/off aliases
        Map.prototype.on = Map.prototype.bind;
        Map.prototype.off = Map.prototype.unbind;

        return Map;
    })(__m3, __m11, __m12, __m1, __m13);

    // ## can/list/list.js
    var __m14 = (function(can, Map, bubble) {

        // Helpers for `observable` lists.
        var splice = [].splice,
            // test if splice works correctly
            spliceRemovesProps = (function() {
                // IE's splice doesn't remove properties
                var obj = {
                    0: "a",
                    length: 1
                };
                splice.call(obj, 0, 1);
                return !obj[0];
            })();


        var list = Map.extend(

            {

                Map: Map

            },

            {
                setup: function(instances, options) {
                    this.length = 0;
                    can.cid(this, ".map");
                    this._init = 1;
                    this._computedBindings = {};
                    this._setupComputes();
                    instances = instances || [];
                    var teardownMapping;

                    if (can.isDeferred(instances)) {
                        this.replace(instances);
                    } else {
                        teardownMapping = instances.length && can.Map.helpers.addToMap(instances, this);
                        this.push.apply(this, can.makeArray(instances || []));
                    }

                    if (teardownMapping) {
                        teardownMapping();
                    }

                    // this change needs to be ignored
                    this.bind('change', can.proxy(this._changes, this));
                    can.simpleExtend(this, options);
                    delete this._init;
                },
                _triggerChange: function(attr, how, newVal, oldVal) {

                    Map.prototype._triggerChange.apply(this, arguments);
                    // `batchTrigger` direct add and remove events...
                    var index = +attr;
                    // Make sure this is not nested and not an expando
                    if (!~attr.indexOf('.') && !isNaN(index)) {

                        if (how === 'add') {
                            can.batch.trigger(this, how, [newVal, index]);
                            can.batch.trigger(this, 'length', [this.length]);
                        } else if (how === 'remove') {
                            can.batch.trigger(this, how, [oldVal, index]);
                            can.batch.trigger(this, 'length', [this.length]);
                        } else {
                            can.batch.trigger(this, how, [newVal, index]);
                        }

                    }

                },
                __get: function(attr) {
                    if (attr) {
                        if (this[attr] && this[attr].isComputed && can.isFunction(this.constructor.prototype[attr])) {
                            return this[attr]();
                        } else {
                            return this[attr];
                        }
                    } else {
                        return this;
                    }
                },
                ___set: function(attr, val) {
                    this[attr] = val;
                    if (+attr >= this.length) {
                        this.length = (+attr + 1);
                    }
                },
                _remove: function(prop, current) {
                    // if removing an expando property
                    if (isNaN(+prop)) {
                        delete this[prop];
                        this._triggerChange(prop, "remove", undefined, current);
                    } else {
                        this.splice(prop, 1);
                    }
                },
                _each: function(callback) {
                    var data = this.__get();
                    for (var i = 0; i < data.length; i++) {
                        callback(data[i], i);
                    }
                },
                // Returns the serialized form of this list.

                serialize: function() {
                    return Map.helpers.serialize(this, 'serialize', []);
                },

                splice: function(index, howMany) {
                    var args = can.makeArray(arguments),
                        added = [],
                        i, len;

                    // converting the arguments to the right type
                    for (i = 2, len = args.length; i < len; i++) {
                        args[i] = this.__type(args[i], i);
                        added.push(args[i]);
                    }

                    // default howMany if not provided
                    if (howMany === undefined) {
                        howMany = args[1] = this.length - index;
                    }

                    var removed = splice.apply(this, args);

                    // delete properties for browsers who's splice sucks (old ie)
                    if (!spliceRemovesProps) {
                        for (i = this.length; i < removed.length + this.length; i++) {
                            delete this[i];
                        }
                    }

                    can.batch.start();
                    if (howMany > 0) {
                        // tears down bubbling
                        bubble.removeMany(this, removed);
                        this._triggerChange("" + index, "remove", undefined, removed);
                    }
                    if (args.length > 2) {
                        // make added items bubble to this list
                        for (i = 0, len = added.length; i < len; i++) {
                            bubble.set(this, i, added[i]);
                        }
                        this._triggerChange("" + index, "add", added, removed);
                    }
                    can.batch.stop();
                    return removed;
                },

                _attrs: function(items, remove) {
                    if (items === undefined) {
                        return Map.helpers.serialize(this, 'attr', []);
                    }

                    // Create a copy.
                    items = can.makeArray(items);

                    can.batch.start();
                    this._updateAttrs(items, remove);
                    can.batch.stop();
                },

                _updateAttrs: function(items, remove) {
                    var len = Math.min(items.length, this.length);

                    for (var prop = 0; prop < len; prop++) {
                        var curVal = this[prop],
                            newVal = items[prop];

                        if (Map.helpers.isObservable(curVal) && Map.helpers.canMakeObserve(newVal)) {
                            curVal.attr(newVal, remove);
                            //changed from a coercion to an explicit
                        } else if (curVal !== newVal) {
                            this._set(prop, newVal);
                        } else {

                        }
                    }
                    if (items.length > this.length) {
                        // Add in the remaining props.
                        this.push.apply(this, items.slice(this.length));
                    } else if (items.length < this.length && remove) {
                        this.splice(items.length);
                    }
                }
            }),

            // Converts to an `array` of arguments.
            getArgs = function(args) {
                return args[0] && can.isArray(args[0]) ?
                    args[0] :
                    can.makeArray(args);
            };
        // Create `push`, `pop`, `shift`, and `unshift`
        can.each({

                push: "length",

                unshift: 0
            },
            // Adds a method
            // `name` - The method name.
            // `where` - Where items in the `array` should be added.

            function(where, name) {
                var orig = [][name];
                list.prototype[name] = function() {
                    // Get the items being added.
                    var args = [],
                        // Where we are going to add items.
                        len = where ? this.length : 0,
                        i = arguments.length,
                        res, val;

                    // Go through and convert anything to an `map` that needs to be converted.
                    while (i--) {
                        val = arguments[i];
                        args[i] = bubble.set(this, i, this.__type(val, i));
                    }

                    // Call the original method.
                    res = orig.apply(this, args);

                    if (!this.comparator || args.length) {

                        this._triggerChange("" + len, "add", args, undefined);
                    }

                    return res;
                };
            });

        can.each({

                pop: "length",

                shift: 0
            },
            // Creates a `remove` type method

            function(where, name) {
                list.prototype[name] = function() {

                    var args = getArgs(arguments),
                        len = where && this.length ? this.length - 1 : 0;

                    var res = [][name].apply(this, args);

                    // Create a change where the args are
                    // `len` - Where these items were removed.
                    // `remove` - Items removed.
                    // `undefined` - The new values (there are none).
                    // `res` - The old, removed values (should these be unbound).
                    this._triggerChange("" + len, "remove", undefined, [res]);

                    if (res && res.unbind) {
                        bubble.remove(this, res);
                    }

                    return res;
                };
            });

        can.extend(list.prototype, {

                indexOf: function(item, fromIndex) {
                    this.attr('length');
                    return can.inArray(item, this, fromIndex);
                },


                join: function() {
                    return [].join.apply(this.attr(), arguments);
                },


                reverse: function() {
                    var list = can.makeArray([].reverse.call(this));
                    this.replace(list);
                },


                slice: function() {
                    var temp = Array.prototype.slice.apply(this, arguments);
                    return new this.constructor(temp);
                },


                concat: function() {
                    var args = [];
                    can.each(can.makeArray(arguments), function(arg, i) {
                        args[i] = arg instanceof can.List ? arg.serialize() : arg;
                    });
                    return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
                },


                forEach: function(cb, thisarg) {
                    return can.each(this, cb, thisarg || this);
                },


                replace: function(newList) {
                    if (can.isDeferred(newList)) {
                        newList.then(can.proxy(this.replace, this));
                    } else {
                        this.splice.apply(this, [0, this.length].concat(can.makeArray(newList || [])));
                    }

                    return this;
                },
                filter: function(callback, thisArg) {
                    var filteredList = new can.List(),
                        self = this,
                        filtered;
                    this.each(function(item, index, list) {
                        filtered = callback.call(thisArg | self, item, index, self);
                        if (filtered) {
                            filteredList.push(item);
                        }
                    });
                    return filteredList;
                }
            });
        can.List = Map.List = list;
        return can.List;
    })(__m3, __m10, __m12);

    // ## can/compute/compute.js
    var __m15 = (function(can, bind) {

        // ## Reading Helpers
        // The following methods are used to call a function that relies on
        // observable data and to track the observable events which should 
        // be listened to when changes occur.
        // To do this, [`can.__reading(observable, event)`](#can-__reading) is called to
        // "broadcast" the corresponding event on each read.
        // ### Observed
        // An "Observed" is an object of observable objects and events that
        // a function relies on. These objects and events must be listened to
        // in order to determine when to check a function for updates.
        // This looks like the following:
        //     { 
        //       "map1|first": {obj: map, event: "first"},
        //       "map1|last" : {obj: map, event: "last"}
        //     }
        // Each object-event pair is mapped so no duplicates will be listed.

        // ### State
        // `can.__read` may call a function that calls `can.__read` again. For
        // example, a compute can read another compute. To track each compute's
        // `Observed` object (containing observable objects and events), we maintain
        // a stack of Observed values for each call to `__read`.
        var stack = [];

        // ### can.__read
        // With a given function and context, calls the function
        // and returns the resulting value of the function as well
        // as the observable properties and events that were read.
        can.__read = function(func, self) {

            // Add an object that `can.__read` will write to.
            stack.push({});

            var value = func.call(self);

            // Example return value:
            // `{value: 100, observed: Observed}`
            return {
                value: value,
                observed: stack.pop()
            };
        };

        // ### can.__reading
        // When an observable value is read, it must call `can.__reading` to 
        // broadcast which object and event should be listened to.
        can.__reading = function(obj, event) {
            // Add the observable object and the event
            // that was read to the `Observed` object on
            // the stack.
            if (stack.length) {
                stack[stack.length - 1][obj._cid + '|' + event] = {
                    obj: obj,
                    event: event + ""
                };
            }

        };

        // ### can.__clearReading
        // Clears and returns the current observables.
        // This can be used to access a value without 
        // it being handled as a regular `read`.
        can.__clearReading = function() {
            if (stack.length) {
                var ret = stack[stack.length - 1];
                stack[stack.length - 1] = {};
                return ret;
            }
        };
        // Specifies current observables.
        can.__setReading = function(o) {
            if (stack.length) {
                stack[stack.length - 1] = o;
            }
        };
        can.__addReading = function(o) {
            if (stack.length) {
                can.simpleExtend(stack[stack.length - 1], o);
            }
        };

        // ## Section Name

        // ### getValueAndBind
        // Calls a function and sets up bindings to call `onchanged`
        // when events from its "Observed" object are triggered.
        // Removes bindings from `oldObserved` that are no longer needed.
        // - func - the function to call.
        // - context - the `this` of the function.
        // - oldObserved - an object that contains what has already been bound to
        // - onchanged - the function to call when any change occurs
        var getValueAndBind = function(func, context, oldObserved, onchanged) {
            // Call the function, get the value as well as the observed objects and events
            var info = can.__read(func, context),
                // The objects-event pairs that must be bound to
                newObserveSet = info.observed;
            // Go through what needs to be observed.
            bindNewSet(oldObserved, newObserveSet, onchanged);
            unbindOldSet(oldObserved, onchanged);

            return info;
        };
        // This will not be optimized.
        var bindNewSet = function(oldObserved, newObserveSet, onchanged) {
            for (var name in newObserveSet) {
                bindOrPreventUnbinding(oldObserved, newObserveSet, name, onchanged);
            }
        };
        // This will be optimized.
        var bindOrPreventUnbinding = function(oldObserved, newObserveSet, name, onchanged) {
            if (oldObserved[name]) {
                // After binding is set up, values
                // in `oldObserved` will be unbound. So if a name
                // has already be observed, remove from `oldObserved`
                // to prevent this.
                delete oldObserved[name];
            } else {
                // If current name has not been observed, listen to it.
                var obEv = newObserveSet[name];
                obEv.obj.bind(obEv.event, onchanged);
            }
        };
        // Iterate through oldObserved, looking for observe/attributes
        // that are no longer being bound and unbind them.
        var unbindOldSet = function(oldObserved, onchanged) {
            for (var name in oldObserved) {
                var obEv = oldObserved[name];
                obEv.obj.unbind(obEv.event, onchanged);
            }
        };

        // ### updateOnChange
        // Fires a change event when a compute's value changes
        var updateOnChange = function(compute, newValue, oldValue, batchNum) {
            // Only trigger event when value has changed
            if (newValue !== oldValue) {
                can.batch.trigger(compute, batchNum ? {
                        type: "change",
                        batchNum: batchNum
                    } : 'change', [
                        newValue,
                        oldValue
                    ]);
            }
        };

        // ###setupComputeHandlers
        // Sets up handlers for a compute.
        // - compute - the compute to set up handlers for
        // - func - the getter/setter function for the compute
        // - context - the `this` for the compute
        // - setCachedValue - function for setting cached value
        // Returns an object with `on` and `off` functions.
        var setupComputeHandlers = function(compute, func, context, setCachedValue) {
            var readInfo,
                onchanged,
                batchNum;

            return {
                // Set up handler for when the compute changes
                on: function(updater) {
                    if (!onchanged) {
                        onchanged = function(ev) {
                            if (compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum)) {
                                // Keep the old value
                                var oldValue = readInfo.value;

                                // Get the new value
                                readInfo = getValueAndBind(func, context, readInfo.observed, onchanged);

                                // Call the updater with old and new values
                                updater(readInfo.value, oldValue, ev.batchNum);

                                batchNum = batchNum = ev.batchNum;
                            }
                        };
                    }

                    readInfo = getValueAndBind(func, context, {}, onchanged);

                    setCachedValue(readInfo.value);

                    compute.hasDependencies = !can.isEmptyObject(readInfo.observed);
                },
                // Remove handler for the compute
                off: function(updater) {
                    for (var name in readInfo.observed) {
                        var ob = readInfo.observed[name];
                        ob.obj.unbind(ob.event, onchanged);
                    }
                }
            };
        };
        var setupSingleBindComputeHandlers = function(compute, func, context, setCachedValue) {
            var readInfo,
                oldValue,
                onchanged,
                batchNum;

            return {
                // Set up handler for when the compute changes
                on: function(updater) {
                    if (!onchanged) {
                        onchanged = function(ev) {
                            if (compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum)) {
                                // Get the new value
                                var reads = can.__clearReading();
                                var newValue = func.call(context);
                                can.__setReading(reads);
                                // Call the updater with old and new values
                                updater(newValue, oldValue, ev.batchNum);
                                oldValue = newValue;
                                batchNum = batchNum = ev.batchNum;
                            }
                        };
                    }

                    readInfo = getValueAndBind(func, context, {}, onchanged);
                    oldValue = readInfo.value;

                    setCachedValue(readInfo.value);

                    compute.hasDependencies = !can.isEmptyObject(readInfo.observed);
                },
                // Remove handler for the compute
                off: function(updater) {
                    for (var name in readInfo.observed) {
                        var ob = readInfo.observed[name];
                        ob.obj.unbind(ob.event, onchanged);
                    }
                }
            };
        };

        // ###isObserve
        // Checks if an object is observable
        var isObserve = function(obj) {
            return obj instanceof can.Map || obj && obj.__get;
        },
            // Instead of calculating whether anything is listening every time,
            // use a function to do nothing (which may be overwritten)
            k = function() {};

        // ## Creating a can.compute
        // A `can.compute` can be created by
        // - [Specifying the getterSeter function](#specifying-gettersetter-function)
        // - [Observing a property of an object](#observing-a-property-of-an-object)
        // - [Specifying an initial value and a setter function](#specifying-an-initial-value-and-a-setter)
        // - [Specifying an initial value and how to read, update, and listen to changes](#specifying-an-initial-value-and-a-settings-object)
        // - [Simply specifying an initial value](#specifying-only-a-value)
        can.compute = function(getterSetter, context, eventName, bindOnce) {
            // ### Setting up
            // Do nothing if getterSetter is already a compute
            if (getterSetter && getterSetter.isComputed) {
                return getterSetter;
            }
            // The computed object
            var computed,
                // The following functions are overwritten depending on how compute() is called
                // A method to set up listening
                on = k,
                // A method to teardown listening
                off = k,
                // Current cached value (valid only when bound is true)
                value,
                // How the value is read by default
                get = function() {
                    return value;
                },
                // How the value is set by default
                set = function(newVal) {
                    value = newVal;
                },
                setCached = set,
                // Save arguments for cloning
                args = [],
                // updater for when value is changed
                updater = function(newValue, oldValue, batchNum) {
                    setCached(newValue);
                    updateOnChange(computed, newValue, oldValue, batchNum);
                },
                // the form of the arguments
                form;


            // convert arguments to args to make V8 Happy
            for (var i = 0, arglen = arguments.length; i < arglen; i++) {
                args[i] = arguments[i];
            }

            computed = function(newVal) {
                // If the computed function is called with arguments,
                // a value should be set
                if (arguments.length) {
                    // Save a reference to the old value
                    var old = value;
                    // Setter may return the value if setter
                    // is for a value maintained exclusively by this compute.
                    var setVal = set.call(context, newVal, old);
                    // If the computed function has dependencies,
                    // return the current value
                    if (computed.hasDependencies) {
                        return get.call(context);
                    }
                    // Setting may not fire a change event, in which case
                    // the value must be read
                    if (setVal === undefined) {
                        value = get.call(context);
                    } else {
                        value = setVal;
                    }
                    // Fire the change
                    updateOnChange(computed, value, old);
                    return value;
                } else {
                    // Another compute may bind to this `computed`
                    if (stack.length && computed.canReadForChangeEvent !== false) {

                        // Tell the compute to listen to change on this computed
                        // Use `can.__reading` to allow other compute to listen
                        // for a change on this `computed`
                        can.__reading(computed, 'change');
                        // We are going to bind on this compute.
                        // If we are not bound, we should bind so that
                        // we don't have to re-read to get the value of this compute.
                        if (!computed.bound) {
                            can.compute.temporarilyBind(computed);
                        }
                    }
                    // If computed is bound, use the cached value
                    if (computed.bound) {
                        return value;
                    } else {
                        return get.call(context);
                    }
                }
            };
            // ###Specifying getterSetter function
            // If `can.compute` is [called with a getterSetter function](http://canjs.com/docs/can.compute.html#sig_can_compute_getterSetter__context__),
            // override set and get
            if (typeof getterSetter === 'function') {
                // `can.compute(getterSetter, [context])`
                set = getterSetter;
                get = getterSetter;
                computed.canReadForChangeEvent = eventName === false ? false : true;

                var handlers = bindOnce ?
                    setupSingleBindComputeHandlers(computed, getterSetter, context || this, setCached) :
                    setupComputeHandlers(computed, getterSetter, context || this, setCached);
                on = handlers.on;
                off = handlers.off;

                // ###Observing a property of an object
                // If `can.compute` is called with an 
                // [object, property name, and optional event name](http://canjs.com/docs/can.compute.html#sig_can_compute_object_propertyName__eventName__),
                // create a compute from a property of an object. This allows the
                // creation of a compute on objects that can be listened to with [`can.bind`](http://canjs.com/docs/can.bind.html)
            } else if (context) {
                if (typeof context === 'string') {
                    // `can.compute(obj, "propertyName", [eventName])`
                    var propertyName = context,
                        isObserve = getterSetter instanceof can.Map;
                    if (isObserve) {
                        computed.hasDependencies = true;
                        var handler;
                        get = function() {
                            return getterSetter.attr(propertyName);
                        };
                        set = function(newValue) {
                            getterSetter.attr(propertyName, newValue);
                        };
                        on = function(update) {
                            handler = function(ev, newVal, oldVal) {
                                update(newVal, oldVal, ev.batchNum);
                            };
                            getterSetter.bind(eventName || propertyName, handler);
                            // Set the cached value
                            value = can.__read(get).value;
                        };
                        off = function(update) {
                            getterSetter.unbind(eventName || propertyName, handler);
                        };
                    } else {
                        get = function() {
                            return getterSetter[propertyName];
                        };
                        set = function(newValue) {
                            getterSetter[propertyName] = newValue;
                        };

                        on = function(update) {
                            handler = function() {
                                update(get(), value);
                            };
                            can.bind.call(getterSetter, eventName || propertyName, handler);
                            // use can.__read because
                            // we should not be indicating that some parent
                            // reads this property if it happens to be binding on it
                            value = can.__read(get)
                                .value;
                        };
                        off = function(update) {
                            can.unbind.call(getterSetter, eventName || propertyName, handler);
                        };
                    }
                    // ###Specifying an initial value and a setter
                    // If `can.compute` is called with an [initial value and a setter function](http://canjs.com/docs/can.compute.html#sig_can_compute_initialValue_setter_newVal_oldVal__),
                    // a compute that can adjust incoming values is set up.
                } else {
                    // `can.compute(initialValue, setter)`
                    if (typeof context === 'function') {

                        value = getterSetter;
                        set = context;
                        context = eventName;
                        form = 'setter';
                        // ###Specifying an initial value and a settings object
                        // If `can.compute` is called with an [initial value and optionally a settings object](http://canjs.com/docs/can.compute.html#sig_can_compute_initialValue__settings__),
                        // a can.compute is created that can optionally specify how to read,
                        // update, and listen to changes in dependent values. This form of
                        // can.compute can be used to derive a compute that derives its
                        // value from any source
                    } else {
                        // `can.compute(initialValue,{get:, set:, on:, off:})`


                        value = getterSetter;
                        var options = context,
                            oldUpdater = updater;

                        context = options.context || options;
                        get = options.get || get;
                        set = options.set || function() {
                            return value;
                        };
                        // This is a "hack" to allow async computes.
                        if (options.fn) {
                            var fn = options.fn,
                                data;
                            // make sure get is called with the newVal, but not setter
                            get = function() {
                                return fn.call(context, value);
                            };
                            // Check the number of arguments the 
                            // async function takes.
                            if (fn.length === 0) {

                                data = setupComputeHandlers(computed, fn, context, setCached);

                            } else if (fn.length === 1) {
                                data = setupComputeHandlers(computed, function() {
                                    return fn.call(context, value);
                                }, context, setCached);
                            } else {
                                updater = function(newVal) {
                                    if (newVal !== undefined) {
                                        oldUpdater(newVal, value);
                                    }
                                };
                                data = setupComputeHandlers(computed, function() {
                                    var res = fn.call(context, value, function(newVal) {
                                        oldUpdater(newVal, value);
                                    });
                                    // If undefined is returned, don't update the value.
                                    return res !== undefined ? res : value;
                                }, context, setCached);
                            }


                            on = data.on;
                            off = data.off;
                        } else {
                            updater = function() {
                                var newVal = get.call(context);
                                oldUpdater(newVal, value);
                            };
                        }

                        on = options.on || on;
                        off = options.off || off;
                    }
                }
                // ###Specifying only a value
                // If can.compute is called with an initialValue only,
                // reads to this value can be observed.
            } else {
                // `can.compute(initialValue)`
                value = getterSetter;
            }
            can.cid(computed, 'compute');
            return can.simpleExtend(computed, {

                    isComputed: true,
                    _bindsetup: function() {
                        this.bound = true;
                        // Set up live-binding
                        // While binding, this should not count as a read
                        var oldReading = can.__clearReading();
                        on.call(this, updater);
                        // Restore "Observed" for reading
                        can.__setReading(oldReading);
                    },
                    _bindteardown: function() {
                        off.call(this, updater);
                        this.bound = false;
                    },

                    bind: can.bindAndSetup,

                    unbind: can.unbindAndTeardown,
                    clone: function(context) {
                        if (context) {
                            if (form === 'setter') {
                                args[2] = context;
                            } else {
                                args[1] = context;
                            }
                        }
                        return can.compute.apply(can, args);
                    }
                });
        };
        // A list of temporarily bound computes
        var computes, unbindComputes = function() {
                for (var i = 0, len = computes.length; i < len; i++) {
                    computes[i].unbind('change', k);
                }
                computes = null;
            };
        // Binds computes for a moment to retain their value and prevent caching
        can.compute.temporarilyBind = function(compute) {
            compute.bind('change', k);
            if (!computes) {
                computes = [];
                setTimeout(unbindComputes, 10);
            }
            computes.push(compute);
        };

        // Whether a compute is truthy
        can.compute.truthy = function(compute) {
            return can.compute(function() {
                var res = compute();
                if (typeof res === 'function') {
                    res = res();
                }
                return !!res;
            });
        };
        can.compute.async = function(initialValue, asyncComputer, context) {
            return can.compute(initialValue, {
                    fn: asyncComputer,
                    context: context
                });
        };
        // {map: new can.Map({first: "Justin"})}, ["map","first"]
        can.compute.read = function(parent, reads, options) {
            options = options || {};
            // `cur` is the current value.
            var cur = parent,
                type,
                // `prev` is the object we are reading from.
                prev,
                // `foundObs` did we find an observable.
                foundObs;
            for (var i = 0, readLength = reads.length; i < readLength; i++) {
                // Update what we are reading from.
                prev = cur;
                // Read from the compute. We can't read a property yet.
                if (prev && prev.isComputed) {
                    if (options.foundObservable) {
                        options.foundObservable(prev, i);
                    }
                    prev = cur = prev();
                }
                // Look to read a property from something.
                if (isObserve(prev)) {
                    if (!foundObs && options.foundObservable) {
                        options.foundObservable(prev, i);
                    }
                    foundObs = 1;
                    // is it a method on the prototype?
                    if (typeof prev[reads[i]] === 'function' && prev.constructor.prototype[reads[i]] === prev[reads[i]]) {
                        // call that method
                        if (options.returnObserveMethods) {
                            cur = cur[reads[i]];
                        } else if ((reads[i] === 'constructor' && prev instanceof can.Construct) ||
                            (prev[reads[i]].prototype instanceof can.Construct)) {
                            cur = prev[reads[i]];
                        } else {
                            cur = prev[reads[i]].apply(prev, options.args || []);
                        }
                    } else {
                        // use attr to get that value
                        cur = cur.attr(reads[i]);
                    }
                } else {
                    // just do the dot operator
                    if (cur == null) {
                        cur = undefined;
                    } else {
                        cur = prev[reads[i]];
                    }

                }
                type = typeof cur;
                // If it's a compute, get the compute's value
                // unless we are at the end of the 
                if (cur && cur.isComputed && (!options.isArgument && i < readLength - 1)) {
                    if (!foundObs && options.foundObservable) {
                        options.foundObservable(prev, i + 1);
                    }
                    cur = cur();
                }
                // If it's an anonymous function, execute as requested
                else if (i < reads.length - 1 && type === 'function' && options.executeAnonymousFunctions && !(can.Construct && cur.prototype instanceof can.Construct)) {
                    cur = cur();
                }
                // if there are properties left to read, and we don't have an object, early exit
                if (i < reads.length - 1 && (cur === null || type !== 'function' && type !== 'object')) {
                    if (options.earlyExit) {
                        options.earlyExit(prev, i, cur);
                    }
                    // return undefined so we know this isn't the right value
                    return {
                        value: undefined,
                        parent: prev
                    };
                }
            }
            // handle an ending function
            // unless it is a can.Construct-derived constructor
            if (typeof cur === 'function' && !(can.Construct && cur.prototype instanceof can.Construct) && !(can.route && cur === can.route)) {
                if (options.isArgument) {
                    if (!cur.isComputed && options.proxyMethods !== false) {
                        cur = can.proxy(cur, prev);
                    }
                } else {
                    if (cur.isComputed && !foundObs && options.foundObservable) {
                        options.foundObservable(cur, i);
                    }
                    cur = cur.call(prev);
                }
            }
            // if we don't have a value, exit early.
            if (cur === undefined) {
                if (options.earlyExit) {
                    options.earlyExit(prev, i - 1);
                }
            }
            return {
                value: cur,
                parent: prev
            };
        };

        can.compute.set = function(parent, key, value) {
            if (isObserve(parent)) {
                return parent.attr(key, value);
            }

            if (parent[key] && parent[key].isComputed) {
                return parent[key](value);
            }

            if (typeof parent === 'object') {
                parent[key] = value;
            }
        };

        return can.compute;
    })(__m3, __m11, __m13);

    // ## can/view/view.js
    var __m16 = (function(can) {

        var isFunction = can.isFunction,
            makeArray = can.makeArray,
            // Used for hookup `id`s.
            hookupId = 1;

        // internal utility methods
        // ------------------------

        // ##### makeRenderer

        var makeRenderer = function(textRenderer) {
            var renderer = function() {
                return $view.frag(textRenderer.apply(this, arguments));
            };
            renderer.render = function() {
                return textRenderer.apply(textRenderer, arguments);
            };
            return renderer;
        };

        // ##### checkText
        // Makes sure there's a template, if not, have `steal` provide a warning.
        var checkText = function(text, url) {
            if (!text.length) {

                // _removed if not used as a steal module_



                throw "can.view: No template or empty template:" + url;
            }
        };

        // ##### get
        // get a deferred renderer for provided url

        var getRenderer = function(obj, async) {
            // If `obj` already is a renderer function just resolve a Deferred with it
            if (isFunction(obj)) {
                var def = can.Deferred();
                return def.resolve(obj);
            }

            var url = typeof obj === 'string' ? obj : obj.url,
                suffix = (obj.engine && '.' + obj.engine) || url.match(/\.[\w\d]+$/),
                type,
                // If we are reading a script element for the content of the template,
                // `el` will be set to that script element.
                el,
                // A unique identifier for the view (used for caching).
                // This is typically derived from the element id or
                // the url for the template.
                id;

            //If the url has a #, we assume we want to use an inline template
            //from a script element and not current page's HTML
            if (url.match(/^#/)) {
                url = url.substr(1);
            }
            // If we have an inline template, derive the suffix from the `text/???` part.
            // This only supports `<script>` tags.
            if (el = document.getElementById(url)) {
                suffix = '.' + el.type.match(/\/(x\-)?(.+)/)[2];
            }

            // If there is no suffix, add one.
            if (!suffix && !$view.cached[url]) {
                url += suffix = $view.ext;
            }

            // if the suffix was derived from the .match() operation, pluck out the first value
            if (can.isArray(suffix)) {
                suffix = suffix[0];
            }

            // Convert to a unique and valid id.
            id = $view.toId(url);

            // If an absolute path, use `steal`/`require` to get it.
            // You should only be using `//` if you are using an AMD loader like `steal` or `require` (not almond).
            if (url.match(/^\/\//)) {
                url = url.substr(2);
                url = !window.steal ?
                    url :
                    steal.config()
                    .root.mapJoin("" + steal.id(url));
            }

            // Localize for `require` (not almond)
            if (window.require) {
                if (require.toUrl) {
                    url = require.toUrl(url);
                }
            }

            // Set the template engine type.
            type = $view.types[suffix];

            // If it is cached,
            if ($view.cached[id]) {
                // Return the cached deferred renderer.
                return $view.cached[id];

                // Otherwise if we are getting this from a `<script>` element.
            } else if (el) {
                // Resolve immediately with the element's `innerHTML`.
                return $view.registerView(id, el.innerHTML, type);
            } else {
                // Make an ajax request for text.
                var d = new can.Deferred();
                can.ajax({
                        async: async,
                        url: url,
                        dataType: 'text',
                        error: function(jqXHR) {
                            checkText('', url);
                            d.reject(jqXHR);
                        },
                        success: function(text) {
                            // Make sure we got some text back.
                            checkText(text, url);
                            $view.registerView(id, text, type, d);
                        }
                    });
                return d;
            }
        };
        // ##### getDeferreds
        // Gets an `array` of deferreds from an `object`.
        // This only goes one level deep.

        var getDeferreds = function(data) {
            var deferreds = [];

            // pull out deferreds
            if (can.isDeferred(data)) {
                return [data];
            } else {
                for (var prop in data) {
                    if (can.isDeferred(data[prop])) {
                        deferreds.push(data[prop]);
                    }
                }
            }
            return deferreds;
        };

        // ##### usefulPart
        // Gets the useful part of a resolved deferred.
        // When a jQuery.when is resolved, it returns an array to each argument.
        // Reference ($.when)[https://api.jquery.com/jQuery.when/]
        // This is for `model`s and `can.ajax` that resolve to an `array`.

        var usefulPart = function(resolved) {
            return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved;
        };

        // #### can.view
        //defines $view for internal use, can.template for backwards compatibility

        var $view = can.view = can.template = function(view, data, helpers, callback) {
            // If helpers is a `function`, it is actually a callback.
            if (isFunction(helpers)) {
                callback = helpers;
                helpers = undefined;
            }

            // Render the view as a fragment
            return $view.renderAs("fragment", view, data, helpers, callback);
        };

        // can.view methods
        // --------------------------
        can.extend($view, {
                // ##### frag
                // creates a fragment and hooks it up all at once

                frag: function(result, parentNode) {
                    return $view.hookup($view.fragment(result), parentNode);
                },

                // #### fragment
                // this is used internally to create a document fragment, insert it,then hook it up
                fragment: function(result) {
                    if (typeof result !== "string" && result.nodeType === 11) {
                        return result;
                    }
                    var frag = can.buildFragment(result, document.body);
                    // If we have an empty frag...
                    if (!frag.childNodes.length) {
                        frag.appendChild(document.createTextNode(''));
                    }
                    return frag;
                },

                // ##### toId
                // Convert a path like string into something that's ok for an `element` ID.
                toId: function(src) {
                    return can.map(src.toString()
                        .split(/\/|\./g), function(part) {
                            // Dont include empty strings in toId functions
                            if (part) {
                                return part;
                            }
                        })
                        .join('_');
                },
                // ##### toStr
                // convert argument to a string
                toStr: function(txt) {
                    return txt == null ? "" : "" + txt;
                },

                // ##### hookup
                // attach the provided `fragment` to `parentNode`

                hookup: function(fragment, parentNode) {
                    var hookupEls = [],
                        id,
                        func;

                    // Get all `childNodes`.
                    can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function(node) {
                        if (node.nodeType === 1) {
                            hookupEls.push(node);
                            hookupEls.push.apply(hookupEls, can.makeArray(node.getElementsByTagName('*')));
                        }
                    });

                    // Filter by `data-view-id` attribute.
                    can.each(hookupEls, function(el) {
                        if (el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id])) {
                            func(el, parentNode, id);
                            delete $view.hookups[id];
                            el.removeAttribute('data-view-id');
                        }
                    });

                    return fragment;
                },

                // `hookups` keeps list of pending hookups, ie fragments to attach to a parent node

                hookups: {},

                // `hook` factory method for hookup function inserted into templates
                // hookup functions are called after the html is rendered to the page
                // only implemented by EJS templates.

                hook: function(cb) {
                    $view.hookups[++hookupId] = cb;
                    return ' data-view-id=\'' + hookupId + '\'';
                },


                cached: {},
                cachedRenderers: {},

                // cache view templates resolved via XHR on the client

                cache: true,

                // ##### register
                // given an info object, register a template type
                // different templating solutions produce strings or document fragments via their renderer function

                register: function(info) {
                    this.types['.' + info.suffix] = info;

                    // _removed if not used as a steal module_



                    can[info.suffix] = $view[info.suffix] = function(id, text) {
                        var renderer,
                            renderFunc;
                        // If there is no text, assume id is the template text, so return a nameless renderer.
                        if (!text) {
                            renderFunc = function() {
                                if (!renderer) {
                                    // if the template has a fragRenderer already, just return that.
                                    if (info.fragRenderer) {
                                        renderer = info.fragRenderer(null, id);
                                    } else {
                                        renderer = makeRenderer(info.renderer(null, id));
                                    }
                                }
                                return renderer.apply(this, arguments);
                            };
                            renderFunc.render = function() {
                                var textRenderer = info.renderer(null, id);
                                return textRenderer.apply(textRenderer, arguments);
                            };
                            return renderFunc;
                        }
                        var registeredRenderer = function() {
                            if (!renderer) {
                                if (info.fragRenderer) {
                                    renderer = info.fragRenderer(id, text);
                                } else {
                                    renderer = info.renderer(id, text);
                                }
                            }
                            return renderer.apply(this, arguments);
                        };
                        if (info.fragRenderer) {
                            return $view.preload(id, registeredRenderer);
                        } else {
                            return $view.preloadStringRenderer(id, registeredRenderer);
                        }

                    };

                },

                //registered view types
                types: {},


                ext: ".ejs",


                registerScript: function(type, id, src) {
                    return 'can.view.preloadStringRenderer(\'' + id + '\',' + $view.types['.' + type].script(id, src) + ');';
                },


                preload: function(id, renderer) {
                    var def = $view.cached[id] = new can.Deferred()
                        .resolve(function(data, helpers) {
                            return renderer.call(data, data, helpers);
                        });

                    // set cache references (otherwise preloaded recursive views won't recurse properly)
                    def.__view_id = id;
                    $view.cachedRenderers[id] = renderer;

                    return renderer;
                },


                preloadStringRenderer: function(id, stringRenderer) {
                    return this.preload(id, makeRenderer(stringRenderer));
                },

                // #### renderers
                // ---------------
                // can.view's primary purpose is to load templates (from strings or filesystem) and render them
                // can.view supports two different forms of rendering systems
                // mustache templates return a string based rendering function

                // stache (or other fragment based templating systems) return a document fragment, so 'hookup' steps are not required
                // ##### render
                //call `renderAs` with a hardcoded string, as view.render
                // always operates against resolved template files or hardcoded strings
                render: function(view, data, helpers, callback) {
                    return can.view.renderAs("string", view, data, helpers, callback);
                },

                // ##### renderTo
                renderTo: function(format, renderer, data, helpers) {
                    return (format === "string" && renderer.render ? renderer.render : renderer)(data, helpers);
                },


                renderAs: function(format, view, data, helpers, callback) {
                    // If helpers is a `function`, it is actually a callback.
                    if (isFunction(helpers)) {
                        callback = helpers;
                        helpers = undefined;
                    }

                    // See if we got passed any deferreds.
                    var deferreds = getDeferreds(data);
                    var reading, deferred, dataCopy, async, response;
                    if (deferreds.length) {
                        // Does data contain any deferreds?
                        // The deferred that resolves into the rendered content...
                        deferred = new can.Deferred();
                        dataCopy = can.extend({}, data);

                        // Add the view request to the list of deferreds.
                        deferreds.push(getRenderer(view, true));
                        // Wait for the view and all deferreds to finish...
                        can.when.apply(can, deferreds)
                            .then(function(resolved) {
                                // Get all the resolved deferreds.
                                var objs = makeArray(arguments),
                                    // Renderer is the last index of the data.
                                    renderer = objs.pop(),
                                    // The result of the template rendering with data.
                                    result;

                                // Make data look like the resolved deferreds.
                                if (can.isDeferred(data)) {
                                    dataCopy = usefulPart(resolved);
                                } else {
                                    // Go through each prop in data again and
                                    // replace the defferreds with what they resolved to.
                                    for (var prop in data) {
                                        if (can.isDeferred(data[prop])) {
                                            dataCopy[prop] = usefulPart(objs.shift());
                                        }
                                    }
                                }

                                // Get the rendered result.
                                result = can.view.renderTo(format, renderer, dataCopy, helpers);

                                // Resolve with the rendered view.
                                deferred.resolve(result, dataCopy);

                                // If there's a `callback`, call it back with the result.
                                if (callback) {
                                    callback(result, dataCopy);
                                }
                            }, function() {
                                deferred.reject.apply(deferred, arguments);
                            });
                        // Return the deferred...
                        return deferred;
                    } else {
                        // get is called async but in 
                        // ff will be async so we need to temporarily reset
                        reading = can.__clearReading();

                        // If there's a `callback` function
                        async = isFunction(callback);
                        // Get the `view` type
                        deferred = getRenderer(view, async);

                        if (reading) {
                            can.__setReading(reading);
                        }

                        // If we are `async`...
                        if (async) {
                            // Return the deferred
                            response = deferred;
                            // And fire callback with the rendered result.
                            deferred.then(function(renderer) {
                                callback(data ? can.view.renderTo(format, renderer, data, helpers) : renderer);
                            });
                        } else {
                            // if the deferred is resolved, call the cached renderer instead
                            // this is because it's possible, with recursive deferreds to
                            // need to render a view while its deferred is _resolving_.  A _resolving_ deferred
                            // is a deferred that was just resolved and is calling back it's success callbacks.
                            // If a new success handler is called while resoliving, it does not get fired by
                            // jQuery's deferred system.  So instead of adding a new callback
                            // we use the cached renderer.
                            // We also add __view_id on the deferred so we can look up it's cached renderer.
                            // In the future, we might simply store either a deferred or the cached result.
                            if (deferred.state() === 'resolved' && deferred.__view_id) {
                                var currentRenderer = $view.cachedRenderers[deferred.__view_id];
                                return data ? can.view.renderTo(format, currentRenderer, data, helpers) : currentRenderer;
                            } else {
                                // Otherwise, the deferred is complete, so
                                // set response to the result of the rendering.
                                deferred.then(function(renderer) {
                                    response = data ? can.view.renderTo(format, renderer, data, helpers) : renderer;
                                });
                            }
                        }

                        return response;
                    }
                },


                registerView: function(id, text, type, def) {
                    // Get the renderer function.
                    var info = (typeof type === "object" ? type : $view.types[type || $view.ext]),
                        renderer;
                    if (info.fragRenderer) {
                        renderer = info.fragRenderer(id, text);
                    } else {
                        renderer = makeRenderer(info.renderer(id, text));
                    }

                    def = def || new can.Deferred();

                    // Cache if we are caching.
                    if ($view.cache) {
                        $view.cached[id] = def;
                        def.__view_id = id;
                        $view.cachedRenderers[id] = renderer;
                    }

                    // Return the objects for the response's `dataTypes`
                    // (in this case view).
                    return def.resolve(renderer);
                }
            });

        // _removed if not used as a steal module_

        return can;
    })(__m3);

    // ## can/view/scope/scope.js
    var __m18 = (function(can) {

        // ## Helpers

        // Regex for escaped periods
        var escapeReg = /(\\)?\./g,
            // Regex for double escaped periods
            escapeDotReg = /\\\./g,
            // **getNames**
            // Returns array of names by splitting provided string by periods and single escaped periods.
            // ```getNames("a.b\.c.d\\.e") //-> ['a', 'b', 'c', 'd.e']```
            getNames = function(attr) {
                var names = [],
                    last = 0;
                // Goes through attr string and places the characters found between the periods and single escaped periods into the
                // `names` array.  Double escaped periods are ignored.
                attr.replace(escapeReg, function(first, second, index) {

                    if (!second) {
                        names.push(
                            attr
                            .slice(last, index)

                            .replace(escapeDotReg, '.'));
                        last = index + first.length;
                    }
                });

                names.push(
                    attr
                    .slice(last)

                    .replace(escapeDotReg, '.'));
                return names;
            };


        var Scope = can.Construct.extend(


            {
                // ## Scope.read
                // Scope.read was moved to can.compute.read
                // can.compute.read reads properties from a parent.  A much more complex version of getObject.
                read: can.compute.read
            },

            {
                init: function(context, parent) {
                    this._context = context;
                    this._parent = parent;
                    this.__cache = {};
                },

                // ## Scope.prototype.attr
                // Reads a value from the current context or parent contexts.
                attr: function(key, value) {
                    // Reads for whatever called before attr.  It's possible
                    // that this.read clears them.  We want to restore them.
                    var previousReads = can.__clearReading(),
                        res = this.read(key, {
                                isArgument: true,
                                returnObserveMethods: true,
                                proxyMethods: false
                            });

                    // Allow setting a value on the context
                    if (arguments.length === 2) {
                        var lastIndex = key.lastIndexOf('.'),
                            // Either get the paren of a key or the current context object with `.`
                            readKey = lastIndex !== -1 ? key.substring(0, lastIndex) : '.',
                            obj = this.read(readKey, {
                                    isArgument: true,
                                    returnObserveMethods: true,
                                    proxyMethods: false
                                }).value;

                        if (lastIndex !== -1) {
                            // Get the last part of the key which is what we want to set
                            key = key.substring(lastIndex + 1, key.length);
                        }

                        can.compute.set(obj, key, value);
                    }

                    can.__setReading(previousReads);
                    return res.value;
                },

                // ## Scope.prototype.add
                // Creates a new scope and sets the current scope to be the parent.
                // ```
                // var scope = new can.view.Scope([{name:"Chris"}, {name: "Justin"}]).add({name: "Brian"});
                // scope.attr("name") //-> "Brian"
                // ```
                add: function(context) {
                    if (context !== this._context) {
                        return new this.constructor(context, this);
                    } else {
                        return this;
                    }
                },

                // ## Scope.prototype.computeData
                // Finds the first location of the key in the scope and then provides a get-set compute that represents the key's value
                // and other information about where the value was found.
                computeData: function(key, options) {
                    options = options || {
                        args: []
                    };
                    var self = this,
                        rootObserve,
                        rootReads,
                        computeData = {
                            // computeData.compute returns a get-set compute that is tied to the first location of the provided
                            // key in the context of the scope.
                            compute: can.compute(function(newVal) {
                                // **Compute setter**
                                if (arguments.length) {
                                    if (rootObserve.isComputed) {
                                        rootObserve(newVal);
                                    } else if (rootReads.length) {
                                        var last = rootReads.length - 1;
                                        var obj = rootReads.length ? can.compute.read(rootObserve, rootReads.slice(0, last)).value : rootObserve;
                                        can.compute.set(obj, rootReads[last], newVal);
                                    }
                                    // **Compute getter**
                                } else {
                                    // If computeData has found the value for the key in the past in an observable then go directly to
                                    // the observable (rootObserve) that the value was found in the last time and return the new value.  This
                                    // is a huge performance gain for the fact that we aren't having to check the entire scope each time.
                                    if (rootObserve) {
                                        return can.compute.read(rootObserve, rootReads, options)
                                            .value;
                                    }
                                    // If the key has not already been located in a observable then we need to search the scope for the
                                    // key.  Once we find the key then we need to return it's value and if it is found in an observable
                                    // then we need to store the observable so the next time this compute is called it can grab the value
                                    // directly from the observable.
                                    var data = self.read(key, options);
                                    rootObserve = data.rootObserve;
                                    rootReads = data.reads;
                                    computeData.scope = data.scope;
                                    computeData.initialValue = data.value;
                                    computeData.reads = data.reads;
                                    computeData.root = rootObserve;
                                    return data.value;
                                }
                            })
                        };
                    return computeData;
                },

                // ## Scope.prototype.compute
                // Provides a get-set compute that represents a key's value.
                compute: function(key, options) {
                    return this.computeData(key, options)
                        .compute;
                },

                // ## Scope.prototype.read
                // Finds the first isntance of a key in the available scopes and returns the keys value along with the the observable the key
                // was found in, readsData and the current scope.

                read: function(attr, options) {
                    // check if we should only look within current scope
                    var stopLookup;
                    if (attr.substr(0, 2) === './') {
                        // set flag to halt lookup from walking up scope
                        stopLookup = true;
                        // stop lookup from checking parent scopes
                        attr = attr.substr(2);
                    }
                    // check if we should be running this on a parent.
                    else if (attr.substr(0, 3) === "../") {
                        return this._parent.read(attr.substr(3), options);
                    } else if (attr === "..") {
                        return {
                            value: this._parent._context
                        };
                    } else if (attr === "." || attr === "this") {
                        return {
                            value: this._context
                        };
                    }

                    // Array of names from splitting attr string into names.  ```"a.b\.c.d\\.e" //-> ['a', 'b', 'c', 'd.e']```
                    var names = attr.indexOf('\\.') === -1 ?
                    // Reference doesn't contain escaped periods
                    attr.split('.')
                    // Reference contains escaped periods ```(`a.b\.c.foo` == `a["b.c"].foo)```
                    : getNames(attr),
                        // The current context (a scope is just data and a parent scope).
                        context,
                        // The current scope.
                        scope = this,
                        // While we are looking for a value, we track the most likely place this value will be found.
                        // This is so if there is no me.name.first, we setup a listener on me.name.
                        // The most likely candidate is the one with the most "read matches" "lowest" in the
                        // context chain.
                        // By "read matches", we mean the most number of values along the key.
                        // By "lowest" in the context chain, we mean the closest to the current context.
                        // We track the starting position of the likely place with `defaultObserve`.
                        defaultObserve,
                        // Tracks how to read from the defaultObserve.
                        defaultReads = [],
                        // Tracks the highest found number of "read matches".
                        defaultPropertyDepth = -1,
                        // `scope.read` is designed to be called within a compute, but
                        // for performance reasons only listens to observables within one context.
                        // This is to say, if you have me.name in the current context, but me.name.first and
                        // we are looking for me.name.first, we don't setup bindings on me.name and me.name.first.
                        // To make this happen, we clear readings if they do not find a value.  But,
                        // if that path turns out to be the default read, we need to restore them.  This
                        // variable remembers those reads so they can be restored.
                        defaultComputeReadings,
                        // Tracks the default's scope.
                        defaultScope,
                        // Tracks the first found observe.
                        currentObserve,
                        // Tracks the reads to get the value for a scope.
                        currentReads;

                    // Goes through each scope context provided until it finds the key (attr).  Once the key is found
                    // then it's value is returned along with an observe, the current scope and reads.
                    // While going through each scope context searching for the key, each observable found is returned and
                    // saved so that either the observable the key is found in can be returned, or in the case the key is not
                    // found in an observable the closest observable can be returned.

                    while (scope) {
                        context = scope._context;
                        if (context !== null) {
                            var data = can.compute.read(context, names, can.simpleExtend({

                                        foundObservable: function(observe, nameIndex) {
                                            currentObserve = observe;
                                            currentReads = names.slice(nameIndex);
                                        },
                                        // Called when we were unable to find a value.
                                        earlyExit: function(parentValue, nameIndex) {

                                            if (nameIndex > defaultPropertyDepth) {
                                                defaultObserve = currentObserve;
                                                defaultReads = currentReads;
                                                defaultPropertyDepth = nameIndex;
                                                defaultScope = scope;

                                                defaultComputeReadings = can.__clearReading();
                                            }
                                        },
                                        // Execute anonymous functions found along the way
                                        executeAnonymousFunctions: true
                                    }, options));
                            // **Key was found**, return value and location data
                            if (data.value !== undefined) {
                                return {
                                    scope: scope,
                                    rootObserve: currentObserve,
                                    value: data.value,
                                    reads: currentReads
                                };
                            }
                        }
                        // Prevent prior readings and then move up to the next scope.
                        can.__clearReading();
                        if (!stopLookup) {
                            // Move up to the next scope.
                            scope = scope._parent;
                        } else {
                            scope = null;
                        }
                    }

                    // **Key was not found**, return undefined for the value.  Unless an observable was
                    // found in the process of searching for the key, then return the most likely observable along with it's
                    // scope and reads.

                    if (defaultObserve) {
                        can.__setReading(defaultComputeReadings);
                        return {
                            scope: defaultScope,
                            rootObserve: defaultObserve,
                            reads: defaultReads,
                            value: undefined
                        };
                    } else {
                        return {
                            names: names,
                            value: undefined
                        };
                    }
                }
            });

        can.view.Scope = Scope;
        return Scope;
    })(__m3, __m1, __m10, __m14, __m16, __m15);

    // ## can/view/elements.js
    var __m20 = (function(can) {

        var selectsCommentNodes = (function() {
            return can.$(document.createComment('~')).length === 1;
        })();


        var elements = {
            tagToContentPropMap: {
                option: 'textContent' in document.createElement('option') ? 'textContent' : 'innerText',
                textarea: 'value'
            },

            // 3.0 TODO: remove
            attrMap: can.attr.map,
            // matches the attrName of a regexp
            attrReg: /([^\s=]+)[\s]*=[\s]*/,
            // 3.0 TODO: remove
            defaultValue: can.attr.defaultValue,
            // a map of parent element to child elements

            tagMap: {
                '': 'span',
                colgroup: 'col',
                table: 'tbody',
                tr: 'td',
                ol: 'li',
                ul: 'li',
                tbody: 'tr',
                thead: 'tr',
                tfoot: 'tr',
                select: 'option',
                optgroup: 'option'
            },
            // a tag's parent element
            reverseTagMap: {
                col: 'colgroup',
                tr: 'tbody',
                option: 'select',
                td: 'tr',
                th: 'tr',
                li: 'ul'
            },
            // Used to determine the parentNode if el is directly within a documentFragment
            getParentNode: function(el, defaultParentNode) {
                return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
            },
            // 3.0 TODO: remove
            setAttr: can.attr.set,
            // 3.0 TODO: remove
            getAttr: can.attr.get,
            // 3.0 TODO: remove
            removeAttr: can.attr.remove,
            // Gets a "pretty" value for something
            contentText: function(text) {
                if (typeof text === 'string') {
                    return text;
                }
                // If has no value, return an empty string.
                if (!text && text !== 0) {
                    return '';
                }
                return '' + text;
            },

            after: function(oldElements, newFrag) {
                var last = oldElements[oldElements.length - 1];
                // Insert it in the `document` or `documentFragment`
                if (last.nextSibling) {
                    can.insertBefore(last.parentNode, newFrag, last.nextSibling);
                } else {
                    can.appendChild(last.parentNode, newFrag);
                }
            },

            replace: function(oldElements, newFrag) {
                elements.after(oldElements, newFrag);
                if (can.remove(can.$(oldElements)).length < oldElements.length && !selectsCommentNodes) {
                    can.each(oldElements, function(el) {
                        if (el.nodeType === 8) {
                            el.parentNode.removeChild(el);
                        }
                    });
                }
            }
        };

        can.view.elements = elements;

        return elements;
    })(__m3, __m16);

    // ## can/view/callbacks/callbacks.js
    var __m21 = (function(can) {

        var attr = can.view.attr = function(attributeName, attrHandler) {
            if (attrHandler) {
                if (typeof attributeName === "string") {
                    attributes[attributeName] = attrHandler;
                } else {
                    regExpAttributes.push({
                            match: attributeName,
                            handler: attrHandler
                        });
                }
            } else {
                var cb = attributes[attributeName];
                if (!cb) {

                    for (var i = 0, len = regExpAttributes.length; i < len; i++) {
                        var attrMatcher = regExpAttributes[i];
                        if (attrMatcher.match.test(attributeName)) {
                            cb = attrMatcher.handler;
                            break;
                        }
                    }
                }
                return cb;
            }
        };

        var attributes = {},
            regExpAttributes = [],
            automaticCustomElementCharacters = /[-\:]/;

        var tag = can.view.tag = function(tagName, tagHandler) {
            if (tagHandler) {
                // if we have html5shive ... re-generate
                if (window.html5) {
                    window.html5.elements += " " + tagName;
                    window.html5.shivDocument();
                }

                tags[tagName.toLowerCase()] = tagHandler;
            } else {
                var cb = tags[tagName.toLowerCase()];
                if (!cb && automaticCustomElementCharacters.test(tagName)) {
                    // empty callback for things that look like special tags
                    cb = function() {};
                }
                return cb;
            }

        };
        var tags = {};

        can.view.callbacks = {
            _tags: tags,
            _attributes: attributes,
            _regExpAttributes: regExpAttributes,
            tag: tag,
            attr: attr,
            // handles calling back a tag callback
            tagHandler: function(el, tagName, tagData) {
                var helperTagCallback = tagData.options.attr('tags.' + tagName),
                    tagCallback = helperTagCallback || tags[tagName];

                // If this was an element like <foo-bar> that doesn't have a component, just render its content
                var scope = tagData.scope,
                    res;

                if (tagCallback) {
                    var reads = can.__clearReading();
                    res = tagCallback(el, tagData);
                    can.__setReading(reads);
                } else {
                    res = scope;
                }



                // If the tagCallback gave us something to render with, and there is content within that element
                // render it!
                if (res && tagData.subtemplate) {

                    if (scope !== res) {
                        scope = scope.add(res);
                    }
                    var result = tagData.subtemplate(scope, tagData.options);
                    var frag = typeof result === "string" ? can.view.frag(result) : result;
                    can.appendChild(el, frag);
                }
            }
        };
        return can.view.callbacks;
    })(__m3, __m16);

    // ## can/view/scanner.js
    var __m19 = (function(can, elements, viewCallbacks) {


        var newLine = /(\r|\n)+/g,
            notEndTag = /\//,
            // Escapes characters starting with `\`.
            clean = function(content) {
                return content
                    .split('\\')
                    .join("\\\\")
                    .split("\n")
                    .join("\\n")
                    .split('"')
                    .join('\\"')
                    .split("\t")
                    .join("\\t");
            },
            // Returns a tagName to use as a temporary placeholder for live content
            // looks forward ... could be slow, but we only do it when necessary
            getTag = function(tagName, tokens, i) {
                // if a tagName is provided, use that
                if (tagName) {
                    return tagName;
                } else {
                    // otherwise go searching for the next two tokens like "<",TAG
                    while (i < tokens.length) {
                        if (tokens[i] === "<" && !notEndTag.test(tokens[i + 1])) {
                            return elements.reverseTagMap[tokens[i + 1]] || 'span';
                        }
                        i++;
                    }
                }
                return '';
            },
            bracketNum = function(content) {
                return (--content.split("{")
                    .length) - (--content.split("}")
                    .length);
            },
            myEval = function(script) {
                eval(script);
            },
            attrReg = /([^\s]+)[\s]*=[\s]*$/,
            // Commands for caching.
            startTxt = 'var ___v1ew = [];',
            finishTxt = "return ___v1ew.join('')",
            put_cmd = "___v1ew.push(\n",
            insert_cmd = put_cmd,
            // Global controls (used by other functions to know where we are).
            // Are we inside a tag?
            htmlTag = null,
            // Are we within a quote within a tag?
            quote = null,
            // What was the text before the current quote? (used to get the `attr` name)
            beforeQuote = null,
            // Whether a rescan is in progress
            rescan = null,
            getAttrName = function() {
                var matches = beforeQuote.match(attrReg);
                return matches && matches[1];
            },
            // Used to mark where the element is.
            status = function() {
                // `t` - `1`.
                // `h` - `0`.
                // `q` - String `beforeQuote`.
                return quote ? "'" + getAttrName() + "'" : (htmlTag ? 1 : 0);
            },
            // returns the top of a stack
            top = function(stack) {
                return stack[stack.length - 1];
            },
            Scanner;


        can.view.Scanner = Scanner = function(options) {
            // Set options on self
            can.extend(this, {

                    text: {},
                    tokens: []
                }, options);
            // make sure it's an empty string if it's not
            this.text.options = this.text.options || "";

            // Cache a token lookup
            this.tokenReg = [];
            this.tokenSimple = {
                "<": "<",
                ">": ">",
                '"': '"',
                "'": "'"
            };
            this.tokenComplex = [];
            this.tokenMap = {};
            for (var i = 0, token; token = this.tokens[i]; i++) {


                // Save complex mappings (custom regexp)
                if (token[2]) {
                    this.tokenReg.push(token[2]);
                    this.tokenComplex.push({
                            abbr: token[1],
                            re: new RegExp(token[2]),
                            rescan: token[3]
                        });
                }
                // Save simple mappings (string only, no regexp)
                else {
                    this.tokenReg.push(token[1]);
                    this.tokenSimple[token[1]] = token[0];
                }
                this.tokenMap[token[0]] = token[1];
            }

            // Cache the token registry.
            this.tokenReg = new RegExp("(" + this.tokenReg.slice(0)
                .concat(["<", ">", '"', "'"])
                .join("|") + ")", "g");
        };


        Scanner.prototype = {
            // a default that can be overwritten
            helpers: [],

            scan: function(source, name) {
                var tokens = [],
                    last = 0,
                    simple = this.tokenSimple,
                    complex = this.tokenComplex;

                source = source.replace(newLine, "\n");
                if (this.transform) {
                    source = this.transform(source);
                }
                source.replace(this.tokenReg, function(whole, part) {
                    // offset is the second to last argument
                    var offset = arguments[arguments.length - 2];

                    // if the next token starts after the last token ends
                    // push what's in between
                    if (offset > last) {
                        tokens.push(source.substring(last, offset));
                    }

                    // push the simple token (if there is one)
                    if (simple[whole]) {
                        tokens.push(whole);
                    }
                    // otherwise lookup complex tokens
                    else {
                        for (var i = 0, token; token = complex[i]; i++) {
                            if (token.re.test(whole)) {
                                tokens.push(token.abbr);
                                // Push a rescan function if one exists
                                if (token.rescan) {
                                    tokens.push(token.rescan(part));
                                }
                                break;
                            }
                        }
                    }

                    // update the position of the last part of the last token
                    last = offset + part.length;
                });

                // if there's something at the end, add it
                if (last < source.length) {
                    tokens.push(source.substr(last));
                }

                var content = '',
                    buff = [startTxt + (this.text.start || '')],
                    // Helper `function` for putting stuff in the view concat.
                    put = function(content, bonus) {
                        buff.push(put_cmd, '"', clean(content), '"' + (bonus || '') + ');');
                    },
                    // A stack used to keep track of how we should end a bracket
                    // `}`.
                    // Once we have a `<%= %>` with a `leftBracket`,
                    // we store how the file should end here (either `))` or `;`).
                    endStack = [],
                    // The last token, used to remember which tag we are in.
                    lastToken,
                    // The corresponding magic tag.
                    startTag = null,
                    // Was there a magic tag inside an html tag?
                    magicInTag = false,
                    // was there a special state
                    specialStates = {
                        attributeHookups: [],
                        // a stack of tagHookups
                        tagHookups: [],
                        //last tag hooked up
                        lastTagHookup: ''
                    },
                    // Helper `function` for removing tagHookups from the hookup stack
                    popTagHookup = function() {
                        // The length of tagHookups is the nested depth which can be used to uniquely identify custom tags of the same type
                        specialStates.lastTagHookup = specialStates.tagHookups.pop() + specialStates.tagHookups.length;
                    },
                    // The current tag name.
                    tagName = '',
                    // stack of tagNames
                    tagNames = [],
                    // Pop from tagNames?
                    popTagName = false,
                    // Declared here.
                    bracketCount,
                    // in a special attr like src= or style=
                    specialAttribute = false,

                    i = 0,
                    token,
                    tmap = this.tokenMap,
                    attrName;

                // Reinitialize the tag state goodness.
                htmlTag = quote = beforeQuote = null;
                for (;
                    (token = tokens[i++]) !== undefined;) {
                    if (startTag === null) {
                        switch (token) {
                            case tmap.left:
                            case tmap.escapeLeft:
                            case tmap.returnLeft:
                                magicInTag = htmlTag && 1;

                            case tmap.commentLeft:
                                // A new line -- just add whatever content within a clean.
                                // Reset everything.
                                startTag = token;
                                if (content.length) {
                                    put(content);
                                }
                                content = '';
                                break;
                            case tmap.escapeFull:
                                // This is a full line escape (a line that contains only whitespace and escaped logic)
                                // Break it up into escape left and right
                                magicInTag = htmlTag && 1;
                                rescan = 1;
                                startTag = tmap.escapeLeft;
                                if (content.length) {
                                    put(content);
                                }
                                rescan = tokens[i++];
                                content = rescan.content || rescan;
                                if (rescan.before) {
                                    put(rescan.before);
                                }
                                tokens.splice(i, 0, tmap.right);
                                break;
                            case tmap.commentFull:
                                // Ignore full line comments.
                                break;
                            case tmap.templateLeft:
                                content += tmap.left;
                                break;
                            case '<':
                                // Make sure we are not in a comment.
                                if (tokens[i].indexOf("!--") !== 0) {
                                    htmlTag = 1;
                                    magicInTag = 0;
                                }

                                content += token;

                                break;
                            case '>':
                                htmlTag = 0;
                                // content.substr(-1) doesn't work in IE7/8
                                var emptyElement = (content.substr(content.length - 1) === "/" || content.substr(content.length - 2) === "--"),
                                    attrs = "";
                                // if there was a magic tag
                                // or it's an element that has text content between its tags,
                                // but content is not other tags add a hookup
                                // TODO: we should only add `can.EJS.pending()` if there's a magic tag
                                // within the html tags.
                                if (specialStates.attributeHookups.length) {
                                    attrs = "attrs: ['" + specialStates.attributeHookups.join("','") + "'], ";
                                    specialStates.attributeHookups = [];
                                }
                                // this is the > of a special tag
                                // comparison to lastTagHookup makes sure the same custom tags can be nested
                                if ((tagName + specialStates.tagHookups.length) !== specialStates.lastTagHookup && tagName === top(specialStates.tagHookups)) {
                                    // If it's a self closing tag (like <content/>) make sure we put the / at the end.
                                    if (emptyElement) {
                                        content = content.substr(0, content.length - 1);
                                    }
                                    // Put the start of the end
                                    buff.push(put_cmd,
                                        '"', clean(content), '"',
                                        ",can.view.pending({tagName:'" + tagName + "'," + (attrs) + "scope: " + (this.text.scope || "this") + this.text.options);

                                    // if it's a self closing tag (like <content/>) close and end the tag
                                    if (emptyElement) {
                                        buff.push("}));");
                                        content = "/>";
                                        popTagHookup();
                                    }
                                    // if it's an empty tag	 
                                    else if (tokens[i] === "<" && tokens[i + 1] === "/" + tagName) {
                                        buff.push("}));");
                                        content = token;
                                        popTagHookup();
                                    } else {
                                        // it has content
                                        buff.push(",subtemplate: function(" + this.text.argNames + "){\n" + startTxt + (this.text.start || ''));
                                        content = '';
                                    }

                                } else if (magicInTag || (!popTagName && elements.tagToContentPropMap[tagNames[tagNames.length - 1]]) || attrs) {
                                    // make sure / of /> is on the right of pending
                                    var pendingPart = ",can.view.pending({" + attrs + "scope: " + (this.text.scope || "this") + this.text.options + "}),\"";
                                    if (emptyElement) {
                                        put(content.substr(0, content.length - 1), pendingPart + "/>\"");
                                    } else {
                                        put(content, pendingPart + ">\"");
                                    }
                                    content = '';
                                    magicInTag = 0;
                                } else {
                                    content += token;
                                }

                                // if it's a tag like <input/>
                                if (emptyElement || popTagName) {
                                    // remove the current tag in the stack
                                    tagNames.pop();
                                    // set the current tag to the previous parent
                                    tagName = tagNames[tagNames.length - 1];
                                    // Don't pop next time
                                    popTagName = false;
                                }
                                specialStates.attributeHookups = [];
                                break;
                            case "'":
                            case '"':
                                // If we are in an html tag, finding matching quotes.
                                if (htmlTag) {
                                    // We have a quote and it matches.
                                    if (quote && quote === token) {
                                        // We are exiting the quote.
                                        quote = null;
                                        // Otherwise we are creating a quote.
                                        // TODO: does this handle `\`?
                                        var attr = getAttrName();
                                        if (viewCallbacks.attr(attr)) {
                                            specialStates.attributeHookups.push(attr);
                                        }

                                        if (specialAttribute) {

                                            content += token;
                                            put(content);
                                            buff.push(finishTxt, "}));\n");
                                            content = "";
                                            specialAttribute = false;

                                            break;
                                        }

                                    } else if (quote === null) {
                                        quote = token;
                                        beforeQuote = lastToken;
                                        attrName = getAttrName();
                                        // TODO: check if there's magic!!!!
                                        if ((tagName === "img" && attrName === "src") || attrName === "style") {
                                            // put content that was before the attr name, but don't include the src=
                                            put(content.replace(attrReg, ""));
                                            content = "";

                                            specialAttribute = true;

                                            buff.push(insert_cmd, "can.view.txt(2,'" + getTag(tagName, tokens, i) + "'," + status() + ",this,function(){", startTxt);
                                            put(attrName + "=" + token);
                                            break;
                                        }

                                    }
                                }

                            default:
                                // Track the current tag
                                if (lastToken === '<') {

                                    tagName = token.substr(0, 3) === "!--" ?
                                        "!--" : token.split(/\s/)[0];

                                    var isClosingTag = false,
                                        cleanedTagName;

                                    if (tagName.indexOf("/") === 0) {
                                        isClosingTag = true;
                                        cleanedTagName = tagName.substr(1);
                                    }

                                    if (isClosingTag) { // </tag>

                                        // when we enter a new tag, pop the tag name stack
                                        if (top(tagNames) === cleanedTagName) {
                                            // set tagName to the last tagName
                                            // if there are no more tagNames, we'll rely on getTag.
                                            tagName = cleanedTagName;
                                            popTagName = true;
                                        }
                                        // if we are in a closing tag of a custom tag
                                        if (top(specialStates.tagHookups) === cleanedTagName) {

                                            // remove the last < from the content
                                            put(content.substr(0, content.length - 1));

                                            // finish the "section"
                                            buff.push(finishTxt + "}}) );");
                                            // the < belongs to the outside
                                            content = "><";
                                            popTagHookup();
                                        }

                                    } else {
                                        if (tagName.lastIndexOf("/") === tagName.length - 1) {
                                            tagName = tagName.substr(0, tagName.length - 1);

                                        }

                                        if (tagName !== "!--" && (viewCallbacks.tag(tagName))) {
                                            // if the content tag is inside something it doesn't belong ...
                                            if (tagName === "content" && elements.tagMap[top(tagNames)]) {
                                                // convert it to an element that will work
                                                token = token.replace("content", elements.tagMap[top(tagNames)]);
                                            }
                                            // we will hookup at the ending tag>
                                            specialStates.tagHookups.push(tagName);
                                        }

                                        tagNames.push(tagName);

                                    }

                                }
                                content += token;
                                break;
                        }
                    } else {
                        // We have a start tag.
                        switch (token) {
                            case tmap.right:
                            case tmap.returnRight:
                                switch (startTag) {
                                    case tmap.left:
                                        // Get the number of `{ minus }`
                                        bracketCount = bracketNum(content);

                                        // We are ending a block.
                                        if (bracketCount === 1) {
                                            // We are starting on. 
                                            buff.push(insert_cmd, 'can.view.txt(0,\'' + getTag(tagName, tokens, i) + '\',' + status() + ',this,function(){', startTxt, content);
                                            endStack.push({
                                                    before: "",
                                                    after: finishTxt + "}));\n"
                                                });
                                        } else {

                                            // How are we ending this statement?
                                            last = // If the stack has value and we are ending a block...
                                            endStack.length && bracketCount === -1 ? // Use the last item in the block stack.
                                            endStack.pop() : // Or use the default ending.
                                            {
                                                after: ";"
                                            };

                                            // If we are ending a returning block,
                                            // add the finish text which returns the result of the
                                            // block.
                                            if (last.before) {
                                                buff.push(last.before);
                                            }
                                            // Add the remaining content.
                                            buff.push(content, ";", last.after);
                                        }
                                        break;
                                    case tmap.escapeLeft:
                                    case tmap.returnLeft:
                                        // We have an extra `{` -> `block`.
                                        // Get the number of `{ minus }`.
                                        bracketCount = bracketNum(content);
                                        // If we have more `{`, it means there is a block.
                                        if (bracketCount) {
                                            // When we return to the same # of `{` vs `}` end with a `doubleParent`.
                                            endStack.push({
                                                    before: finishTxt,
                                                    after: "}));\n"
                                                });
                                        }

                                        var escaped = startTag === tmap.escapeLeft ? 1 : 0,
                                            commands = {
                                                insert: insert_cmd,
                                                tagName: getTag(tagName, tokens, i),
                                                status: status(),
                                                specialAttribute: specialAttribute
                                            };

                                        for (var ii = 0; ii < this.helpers.length; ii++) {
                                            // Match the helper based on helper
                                            // regex name value
                                            var helper = this.helpers[ii];
                                            if (helper.name.test(content)) {
                                                content = helper.fn(content, commands);

                                                // dont escape partials
                                                if (helper.name.source === /^>[\s]*\w*/.source) {
                                                    escaped = 0;
                                                }
                                                break;
                                            }
                                        }

                                        // Handle special cases
                                        if (typeof content === 'object') {

                                            if (content.startTxt && content.end && specialAttribute) {
                                                buff.push(insert_cmd, "can.view.toStr( ", content.content, '() ) );');

                                            } else {

                                                if (content.startTxt) {
                                                    buff.push(insert_cmd, "can.view.txt(\n" +
                                                        (typeof status() === "string" || (content.escaped != null ? content.escaped : escaped)) + ",\n'" + tagName + "',\n" + status() + ",\nthis,\n");
                                                } else if (content.startOnlyTxt) {
                                                    buff.push(insert_cmd, 'can.view.onlytxt(this,\n');
                                                }
                                                buff.push(content.content);
                                                if (content.end) {
                                                    buff.push('));');
                                                }

                                            }

                                        } else if (specialAttribute) {

                                            buff.push(insert_cmd, content, ');');

                                        } else {
                                            // If we have `<%== a(function(){ %>` then we want
                                            // `can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];`.

                                            buff.push(insert_cmd, "can.view.txt(\n" + (typeof status() === "string" || escaped) +
                                                ",\n'" + tagName + "',\n" + status() + ",\nthis,\nfunction(){ " +
                                                (this.text.escape || '') +
                                                "return ", content,
                                                // If we have a block.
                                                bracketCount ?
                                                // Start with startTxt `"var _v1ew = [];"`.
                                                startTxt :
                                                // If not, add `doubleParent` to close push and text.
                                                "}));\n");



                                        }

                                        if (rescan && rescan.after && rescan.after.length) {
                                            put(rescan.after.length);
                                            rescan = null;
                                        }
                                        break;
                                }
                                startTag = null;
                                content = '';
                                break;
                            case tmap.templateLeft:
                                content += tmap.left;
                                break;
                            default:
                                content += token;
                                break;
                        }
                    }
                    lastToken = token;
                }

                // Put it together...
                if (content.length) {
                    // Should be `content.dump` in Ruby.
                    put(content);
                }
                buff.push(";");
                var template = buff.join(''),
                    out = {
                        out: (this.text.outStart || "") + template + " " + finishTxt + (this.text.outEnd || "")
                    };

                // Use `eval` instead of creating a function, because it is easier to debug.
                myEval.call(out, 'this.fn = (function(' + this.text.argNames + '){' + out.out + '});\r\n//# sourceURL=' + name + '.js');
                return out;
            }
        };

        // can.view.attr

        // This is called when there is a special tag
        can.view.pending = function(viewData) {
            // we need to call any live hookups
            // so get that and return the hook
            // a better system will always be called with the same stuff
            var hooks = can.view.getHooks();
            return can.view.hook(function(el) {
                can.each(hooks, function(fn) {
                    fn(el);
                });
                viewData.templateType = "legacy";
                if (viewData.tagName) {
                    viewCallbacks.tagHandler(el, viewData.tagName, viewData);
                }

                can.each(viewData && viewData.attrs || [], function(attributeName) {
                    viewData.attributeName = attributeName;
                    var callback = viewCallbacks.attr(attributeName);
                    if (callback) {
                        callback(el, viewData);
                    }
                });

            });

        };

        can.view.tag("content", function(el, tagData) {
            return tagData.scope;
        });

        can.view.Scanner = Scanner;

        return Scanner;
    })(__m16, __m20, __m21);

    // ## can/view/node_lists/node_lists.js
    var __m24 = (function(can) {
        // ## Helpers
        // Some browsers don't allow expando properties on HTMLTextNodes
        // so let's try to assign a custom property, an 'expando' property.
        // We use this boolean to determine how we are going to hold on
        // to HTMLTextNode within a nodeList.  More about this in the 'id'
        // function.
        var canExpando = true;
        try {
            document.createTextNode('')._ = 0;
        } catch (ex) {
            canExpando = false;
        }

        // A mapping of element ids to nodeList id allowing us to quickly find an element
        // that needs to be replaced when updated.
        var nodeMap = {},
            // A mapping of ids to text nodes, this map will be used in the 
            // case of the browser not supporting expando properties.
            textNodeMap = {},
            // The name of the expando property; the value returned 
            // given a nodeMap key.
            expando = 'ejs_' + Math.random(),
            // The id used as the key in our nodeMap, this integer
            // will be preceded by 'element_' or 'obj_' depending on whether
            // the element has a nodeName.
            _id = 0,

            // ## nodeLists.id
            // Given a template node, create an id on the node as a expando
            // property, or if the node is an HTMLTextNode and the browser
            // doesn't support expando properties store the id with a
            // reference to the text node in an internal collection then return
            // the lookup id.
            id = function(node, localMap) {
                var _textNodeMap = localMap || textNodeMap;
                var id = readId(node, _textNodeMap);
                if (id) {
                    return id;
                } else {
                    // If the browser supports expando properties or the node
                    // provided is not an HTMLTextNode, we don't need to work
                    // with the internal textNodeMap and we can place the property
                    // on the node.
                    if (canExpando || node.nodeType !== 3) {
                        ++_id;
                        return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
                    } else {
                        // If we didn't find the node, we need to register it and return
                        // the id used.
                        ++_id;

                        // If we didn't find the node, we need to register it and return
                        // the id used.
                        // We have to store the node itself because of the browser's lack
                        // of support for expando properties (i.e. we can't use a look-up
                        // table and store the id on the node as a custom property).
                        _textNodeMap['text_' + _id] = node;
                        return 'text_' + _id;
                    }
                }
            },
            readId = function(node, textNodeMap) {
                if (canExpando || node.nodeType !== 3) {
                    return node[expando];
                } else {
                    // The nodeList has a specific collection for HTMLTextNodes for 
                    // (older) browsers that do not support expando properties.
                    for (var textNodeID in textNodeMap) {
                        if (textNodeMap[textNodeID] === node) {
                            return textNodeID;
                        }
                    }
                }
            },
            splice = [].splice,
            push = [].push,

            // ## nodeLists.itemsInChildListTree
            // Given a nodeList return the number of child items in the provided
            // list and any child lists.
            itemsInChildListTree = function(list) {
                var count = 0;
                for (var i = 0, len = list.length; i < len; i++) {
                    var item = list[i];
                    // If the item is an HTMLElement then increment the count by 1.
                    if (item.nodeType) {
                        count++;
                    } else {
                        // If the item is not an HTMLElement it is a list, so
                        // increment the count by the number of items in the child
                        // list.
                        count += itemsInChildListTree(item);
                    }
                }
                return count;
            },
            replacementMap = function(replacements, idMap) {
                var map = {};
                for (var i = 0, len = replacements.length; i < len; i++) {
                    var node = nodeLists.first(replacements[i]);
                    map[id(node, idMap)] = replacements[i];
                }
                return map;
            };

        // ## Registering & Updating
        // To keep all live-bound sections knowing which elements they are managing,
        // all live-bound elments are registered and updated when they change.
        // For example, the above template, when rendered with data like:
        //     data = new can.Map({
        //         items: ["first","second"]
        //     })
        // This will first render the following content:
        //     <div>
        //         <span data-view-id='5'/>
        //     </div>
        // When the `5` callback is called, this will register the `<span>` like:
        //     var ifsNodes = [<span 5>]
        //     nodeLists.register(ifsNodes);
        // And then render `{{if}}`'s contents and update `ifsNodes` with it:
        //     nodeLists.update( ifsNodes, [<"\nItems:\n">, <span data-view-id="6">] );
        // Next, hookup `6` is called which will regsiter the `<span>` like:
        //     var eachsNodes = [<span 6>];
        //     nodeLists.register(eachsNodes);
        // And then it will render `{{#each}}`'s content and update `eachsNodes` with it:
        //     nodeLists.update(eachsNodes, [<label>,<label>]);
        // As `nodeLists` knows that `eachsNodes` is inside `ifsNodes`, it also updates
        // `ifsNodes`'s nodes to look like:
        //     [<"\nItems:\n">,<label>,<label>]
        // Now, if all items were removed, `{{#if}}` would be able to remove
        // all the `<label>` elements.
        // When you regsiter a nodeList, you can also provide a callback to know when
        // that nodeList has been replaced by a parent nodeList.  This is
        // useful for tearing down live-binding.
        var nodeLists = {
            id: id,

            // ## nodeLists.update
            // Updates a nodeList with new items, i.e. when values for the template have changed.
            update: function(nodeList, newNodes) {
                // Unregister all childNodeLists.
                var oldNodes = nodeLists.unregisterChildren(nodeList);

                newNodes = can.makeArray(newNodes);

                var oldListLength = nodeList.length;

                // Replace oldNodeLists's contents.
                splice.apply(nodeList, [
                        0,
                        oldListLength
                    ].concat(newNodes));

                if (nodeList.replacements) {
                    nodeLists.nestReplacements(nodeList);
                } else {
                    nodeLists.nestList(nodeList);
                }

                return oldNodes;
            },
            nestReplacements: function(list) {
                var index = 0,
                    // temporary id map that is limited to this call
                    idMap = {},
                    // replacements are in reverse order in the DOM
                    rMap = replacementMap(list.replacements, idMap),
                    rCount = list.replacements.length;

                while (index < list.length && rCount) {
                    var node = list[index],
                        replacement = rMap[readId(node, idMap)];
                    if (replacement) {
                        list.splice(index, itemsInChildListTree(replacement), replacement);
                        rCount--;
                    }
                    index++;
                }
                list.replacements = [];
            },
            // ## nodeLists.nestList
            // If a given list does not exist in the nodeMap then create an lookup
            // id for it in the nodeMap and assign the list to it.
            // If the the provided does happen to exist in the nodeMap update the
            // elements in the list.
            // @param {Array.<HTMLElement>} nodeList The nodeList being nested.
            nestList: function(list) {
                var index = 0;
                while (index < list.length) {
                    var node = list[index],
                        childNodeList = nodeMap[id(node)];
                    if (childNodeList) {
                        if (childNodeList !== list) {
                            list.splice(index, itemsInChildListTree(childNodeList), childNodeList);
                        }
                    } else {
                        // Indicate the new nodes belong to this list.
                        nodeMap[id(node)] = list;
                    }
                    index++;
                }
            },

            // ## nodeLists.last
            // Return the last HTMLElement in a nodeList, if the last
            // element is a nodeList, returns the last HTMLElement of
            // the child list, etc.
            last: function(nodeList) {
                var last = nodeList[nodeList.length - 1];
                // If the last node in the list is not an HTMLElement
                // it is a nodeList so call `last` again.
                if (last.nodeType) {
                    return last;
                } else {
                    return nodeLists.last(last);
                }
            },

            // ## nodeLists.first
            // Return the first HTMLElement in a nodeList, if the first
            // element is a nodeList, returns the first HTMLElement of
            // the child list, etc.
            first: function(nodeList) {
                var first = nodeList[0];
                // If the first node in the list is not an HTMLElement
                // it is a nodeList so call `first` again. 
                if (first.nodeType) {
                    return first;
                } else {
                    return nodeLists.first(first);
                }
            },

            // ## nodeLists.register
            // Registers a nodeList and returns the nodeList passed to register
            register: function(nodeList, unregistered, parent) {
                // If a unregistered callback has been provided assign it to the nodeList
                // as a property to be called when the nodeList is unregistred.
                nodeList.unregistered = unregistered;
                nodeList.parentList = parent;

                if (parent === true) {
                    // this is the "top" parent in stache
                    nodeList.replacements = [];
                } else if (parent) {
                    // TOOD: remove
                    parent.replacements.push(nodeList);
                    nodeList.replacements = [];
                } else {
                    nodeLists.nestList(nodeList);
                }


                return nodeList;
            },

            // ## nodeLists.unregisterChildren
            // Unregister all childen within the provided list and return the 
            // unregistred nodes.
            // @param {Array.<HTMLElement>} nodeList The child list to unregister.
            unregisterChildren: function(nodeList) {
                var nodes = [];
                // For each node in the nodeList we want to compute it's id
                // and delete it from the nodeList's internal map.
                can.each(nodeList, function(node) {
                    // If the node does not have a nodeType it is an array of
                    // nodes.
                    if (node.nodeType) {
                        if (!nodeList.replacements) {
                            delete nodeMap[id(node)];
                        }

                        nodes.push(node);
                    } else {
                        // Recursively unregister each of the child lists in 
                        // the nodeList.
                        push.apply(nodes, nodeLists.unregister(node));
                    }
                });
                return nodes;
            },

            // ## nodeLists.unregister
            // Unregister's a nodeList and returns the unregistered nodes.  
            // Call if the nodeList is no longer being updated. This will 
            // also unregister all child nodeLists.
            unregister: function(nodeList) {
                var nodes = nodeLists.unregisterChildren(nodeList);
                // If an 'unregisted' function was provided during registration, remove
                // it from the list, and call the function provided.
                if (nodeList.unregistered) {
                    var unregisteredCallback = nodeList.unregistered;
                    delete nodeList.unregistered;
                    delete nodeList.replacements;
                    unregisteredCallback();
                }
                return nodes;
            },

            nodeMap: nodeMap
        };
        can.view.nodeLists = nodeLists;
        return nodeLists;
    })(__m3, __m20);

    // ## can/view/parser/parser.js
    var __m25 = (function(can) {


        function makeMap(str) {
            var obj = {}, items = str.split(",");
            for (var i = 0; i < items.length; i++) {
                obj[items[i]] = true;
            }

            return obj;
        }

        var alphaNumericHU = "-:A-Za-z0-9_",
            attributeNames = "[a-zA-Z_:][" + alphaNumericHU + ":.]*",
            spaceEQspace = "\\s*=\\s*",
            dblQuote2dblQuote = "\"((?:\\\\.|[^\"])*)\"",
            quote2quote = "'((?:\\\\.|[^'])*)'",
            attributeEqAndValue = "(?:" + spaceEQspace + "(?:" +
                "(?:\"[^\"]*\")|(?:'[^']*')|[^>\\s]+))?",
            matchStash = "\\{\\{[^\\}]*\\}\\}\\}?",
            stash = "\\{\\{([^\\}]*)\\}\\}\\}?",
            startTag = new RegExp("^<([" + alphaNumericHU + "]+)" +
                "(" +
                "(?:\\s*" +
                "(?:(?:" +
                "(?:" + attributeNames + ")?" +
                attributeEqAndValue + ")|" +
                "(?:" + matchStash + ")+)" +
                ")*" +
                ")\\s*(\\/?)>"),
            endTag = new RegExp("^<\\/([" + alphaNumericHU + "]+)[^>]*>"),
            attr = new RegExp("(?:" +
                "(?:(" + attributeNames + ")|" + stash + ")" +
                "(?:" + spaceEQspace +
                "(?:" +
                "(?:" + dblQuote2dblQuote + ")|(?:" + quote2quote + ")|([^>\\s]+)" +
                ")" +
                ")?)", "g"),
            mustache = new RegExp(stash, "g"),
            txtBreak = /<|\{\{/;

        // Empty Elements - HTML 5
        var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

        // Block Elements - HTML 5
        var block = makeMap("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

        // Inline Elements - HTML 5
        var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

        // Elements that you can, intentionally, leave open
        // (and which close themselves)
        var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

        // Attributes that have their values filled in disabled="disabled"
        var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

        // Special Elements (can contain anything)
        var special = makeMap("script,style");

        var HTMLParser = function(html, handler) {

            function parseStartTag(tag, tagName, rest, unary) {
                tagName = tagName.toLowerCase();

                if (block[tagName]) {
                    while (stack.last() && inline[stack.last()]) {
                        parseEndTag("", stack.last());
                    }
                }

                if (closeSelf[tagName] && stack.last() === tagName) {
                    parseEndTag("", tagName);
                }

                unary = empty[tagName] || !! unary;

                handler.start(tagName, unary);

                if (!unary) {
                    stack.push(tagName);
                }
                // find attribute or special
                HTMLParser.parseAttrs(rest, handler);

                handler.end(tagName, unary);

            }

            function parseEndTag(tag, tagName) {
                // If no tag name is provided, clean shop
                var pos;
                if (!tagName) {
                    pos = 0;
                }


                // Find the closest opened tag of the same type
                else {
                    for (pos = stack.length - 1; pos >= 0; pos--) {
                        if (stack[pos] === tagName) {
                            break;
                        }
                    }

                }


                if (pos >= 0) {
                    // Close all the open elements, up the stack
                    for (var i = stack.length - 1; i >= pos; i--) {
                        if (handler.close) {
                            handler.close(stack[i]);
                        }
                    }

                    // Remove the open elements from the stack
                    stack.length = pos;
                }
            }

            function parseMustache(mustache, inside) {
                if (handler.special) {
                    handler.special(inside);
                }
            }


            var index, chars, match, stack = [],
                last = html;
            stack.last = function() {
                return this[this.length - 1];
            };

            while (html) {
                chars = true;

                // Make sure we're not in a script or style element
                if (!stack.last() || !special[stack.last()]) {

                    // Comment
                    if (html.indexOf("<!--") === 0) {
                        index = html.indexOf("-->");

                        if (index >= 0) {
                            if (handler.comment) {
                                handler.comment(html.substring(4, index));
                            }
                            html = html.substring(index + 3);
                            chars = false;
                        }

                        // end tag
                    } else if (html.indexOf("</") === 0) {
                        match = html.match(endTag);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(endTag, parseEndTag);
                            chars = false;
                        }

                        // start tag
                    } else if (html.indexOf("<") === 0) {
                        match = html.match(startTag);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(startTag, parseStartTag);
                            chars = false;
                        }
                    } else if (html.indexOf("{{") === 0) {
                        match = html.match(mustache);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(mustache, parseMustache);
                        }
                    }

                    if (chars) {
                        index = html.search(txtBreak);

                        var text = index < 0 ? html : html.substring(0, index);
                        html = index < 0 ? "" : html.substring(index);

                        if (handler.chars && text) {
                            handler.chars(text);
                        }
                    }

                } else {
                    html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function(all, text) {
                        text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
                        if (handler.chars) {
                            handler.chars(text);
                        }
                        return "";
                    });

                    parseEndTag("", stack.last());
                }

                if (html === last) {
                    throw "Parse Error: " + html;
                }

                last = html;
            }

            // Clean up any remaining tags
            parseEndTag();


            handler.done();
        };
        HTMLParser.parseAttrs = function(rest, handler) {


            (rest != null ? rest : "").replace(attr, function(text, name, special, dblQuote, singleQuote, val) {
                if (special) {
                    handler.special(special);

                }
                if (name || dblQuote || singleQuote || val) {
                    var value = arguments[3] ? arguments[3] :
                        arguments[4] ? arguments[4] :
                        arguments[5] ? arguments[5] :
                        fillAttrs[name.toLowerCase()] ? name : "";
                    handler.attrStart(name || "");

                    var last = mustache.lastIndex = 0,
                        res = mustache.exec(value),
                        chars;
                    while (res) {
                        chars = value.substring(
                            last,
                            mustache.lastIndex - res[0].length);
                        if (chars.length) {
                            handler.attrValue(chars);
                        }
                        handler.special(res[1]);
                        last = mustache.lastIndex;
                        res = mustache.exec(value);
                    }
                    chars = value.substr(
                        last,
                        value.length);
                    if (chars) {
                        handler.attrValue(chars);
                    }
                    handler.attrEnd(name || "");
                }


            });


        };

        can.view.parser = HTMLParser;

        return HTMLParser;

    })(__m16);

    // ## can/view/live/live.js
    var __m23 = (function(can, elements, view, nodeLists, parser) {

        elements = elements || can.view.elements;
        nodeLists = nodeLists || can.view.NodeLists;
        parser = parser || can.view.parser;

        // ## live.js
        // The live module provides live binding for computes
        // and can.List.
        // Currently, it's API is designed for `can/view/render`, but
        // it could easily be used for other purposes.
        // ### Helper methods
        // #### setup
        // `setup(HTMLElement, bind(data), unbind(data)) -> data`
        // Calls bind right away, but will call unbind
        // if the element is "destroyed" (removed from the DOM).
        var setup = function(el, bind, unbind) {
            // Removing an element can call teardown which
            // unregister the nodeList which calls teardown
            var tornDown = false,
                teardown = function() {
                    if (!tornDown) {
                        tornDown = true;
                        unbind(data);
                        can.unbind.call(el, 'removed', teardown);
                    }
                    return true;
                }, data = {
                    teardownCheck: function(parent) {
                        return parent ? false : teardown();
                    }
                };
            can.bind.call(el, 'removed', teardown);
            bind(data);
            return data;
        },
            // #### listen
            // Calls setup, but presets bind and unbind to
            // operate on a compute
            listen = function(el, compute, change) {
                return setup(el, function() {
                    compute.bind('change', change);
                }, function(data) {
                    compute.unbind('change', change);
                    if (data.nodeList) {
                        nodeLists.unregister(data.nodeList);
                    }
                });
            },
            // #### getAttributeParts
            // Breaks up a string like foo='bar' into ["foo","'bar'""]
            getAttributeParts = function(newVal) {
                var attrs = {},
                    attr;
                parser.parseAttrs(newVal, {
                        attrStart: function(name) {
                            attrs[name] = "";
                            attr = name;
                        },
                        attrValue: function(value) {
                            attrs[attr] += value;
                        },
                        attrEnd: function() {}
                    });
                return attrs;
            },
            splice = [].splice,
            isNode = function(obj) {
                return obj && obj.nodeType;
            },
            addTextNodeIfNoChildren = function(frag) {
                if (!frag.childNodes.length) {
                    frag.appendChild(document.createTextNode(""));
                }
            };

        var live = {

            list: function(el, compute, render, context, parentNode, nodeList) {

                // A nodeList of all elements this live-list manages.
                // This is here so that if this live list is within another section
                // that section is able to remove the items in this list.
                var masterNodeList = nodeList || [el],
                    // A mapping of items to their indicies'
                    indexMap = [],
                    // Called when items are added to the list.
                    add = function(ev, items, index) {
                        // Collect new html and mappings
                        var frag = document.createDocumentFragment(),
                            newNodeLists = [],
                            newIndicies = [];
                        // For each new item,
                        can.each(items, function(item, key) {
                            var itemNodeList = [];

                            if (nodeList) {
                                nodeLists.register(itemNodeList, null, true);
                            }

                            var itemIndex = can.compute(key + index),
                                // get its string content
                                itemHTML = render.call(context, item, itemIndex, itemNodeList),
                                gotText = typeof itemHTML === "string",
                                // and convert it into elements.
                                itemFrag = can.frag(itemHTML);
                            // Add those elements to the mappings.

                            itemFrag = gotText ? can.view.hookup(itemFrag) : itemFrag;

                            var childNodes = can.makeArray(itemFrag.childNodes);
                            if (nodeList) {
                                nodeLists.update(itemNodeList, childNodes);
                                newNodeLists.push(itemNodeList);
                            } else {
                                newNodeLists.push(nodeLists.register(childNodes));
                            }


                            // Hookup the fragment (which sets up child live-bindings) and
                            // add it to the collection of all added elements.
                            frag.appendChild(itemFrag);
                            // track indicies;
                            newIndicies.push(itemIndex);
                        });
                        // The position of elements is always after the initial text placeholder node
                        var masterListIndex = index + 1;


                        // Check if we are adding items at the end
                        if (!masterNodeList[masterListIndex]) {
                            elements.after(masterListIndex === 1 ? [text] : [nodeLists.last(masterNodeList[masterListIndex - 1])], frag);
                        } else {
                            // Add elements before the next index's first element.
                            var el = nodeLists.first(masterNodeList[masterListIndex]);
                            can.insertBefore(el.parentNode, frag, el);
                        }
                        splice.apply(masterNodeList, [
                                masterListIndex,
                                0
                            ].concat(newNodeLists));

                        // update indices after insert point
                        splice.apply(indexMap, [
                                index,
                                0
                            ].concat(newIndicies));

                        for (var i = index + newIndicies.length, len = indexMap.length; i < len; i++) {
                            indexMap[i](i);
                        }
                    },
                    // Called when items are removed or when the bindings are torn down.
                    remove = function(ev, items, index, duringTeardown, fullTeardown) {
                        // If this is because an element was removed, we should
                        // check to make sure the live elements are still in the page.
                        // If we did this during a teardown, it would cause an infinite loop.
                        if (!duringTeardown && data.teardownCheck(text.parentNode)) {
                            return;
                        }
                        if (index < 0) {
                            index = indexMap.length + index;
                        }

                        var removedMappings = masterNodeList.splice(index + 1, items.length),
                            itemsToRemove = [];
                        can.each(removedMappings, function(nodeList) {

                            // Unregister to free up event bindings.
                            var nodesToRemove = nodeLists.unregister(nodeList);

                            // add items that we will remove all at once
                            [].push.apply(itemsToRemove, nodesToRemove);
                        });
                        // update indices after remove point
                        indexMap.splice(index, items.length);
                        for (var i = index, len = indexMap.length; i < len; i++) {
                            indexMap[i](i);
                        }
                        // don't remove elements during teardown.  Something else will probably be doing that.
                        if (!fullTeardown) {
                            can.remove(can.$(itemsToRemove));
                        }

                    },
                    // A text node placeholder
                    text = document.createTextNode(''),
                    // The current list.
                    list,
                    // Called when the list is replaced with a new list or the binding is torn-down.
                    teardownList = function(fullTeardown) {
                        // there might be no list right away, and the list might be a plain
                        // array
                        if (list && list.unbind) {
                            list.unbind('add', add)
                                .unbind('remove', remove);
                        }
                        // use remove to clean stuff up for us
                        remove({}, {
                                length: masterNodeList.length - 1
                            }, 0, true, fullTeardown);
                    },
                    // Called when the list is replaced or setup.
                    updateList = function(ev, newList, oldList) {
                        teardownList();
                        // make an empty list if the compute returns null or undefined
                        list = newList || [];
                        // list might be a plain array
                        if (list.bind) {
                            list.bind('add', add)
                                .bind('remove', remove);
                        }
                        add({}, list, 0);
                    };
                parentNode = elements.getParentNode(el, parentNode);
                // Setup binding and teardown to add and remove events
                var data = setup(parentNode, function() {
                    if (can.isFunction(compute)) {
                        compute.bind('change', updateList);
                    }
                }, function() {
                    if (can.isFunction(compute)) {
                        compute.unbind('change', updateList);
                    }
                    teardownList(true);
                });
                if (!nodeList) {
                    live.replace(masterNodeList, text, data.teardownCheck);
                } else {
                    elements.replace(masterNodeList, text);
                    nodeLists.update(masterNodeList, [text]);
                    nodeList.unregistered = data.teardownCheck;
                }

                // run the list setup
                updateList({}, can.isFunction(compute) ? compute() : compute);
            },

            html: function(el, compute, parentNode, nodeList) {
                var data;
                parentNode = elements.getParentNode(el, parentNode);
                data = listen(parentNode, compute, function(ev, newVal, oldVal) {

                    // TODO: remove teardownCheck in 2.1
                    var attached = nodeLists.first(nodes).parentNode;
                    // update the nodes in the DOM with the new rendered value
                    if (attached) {
                        makeAndPut(newVal);
                    }
                    data.teardownCheck(nodeLists.first(nodes).parentNode);
                });

                var nodes = nodeList || [el],
                    makeAndPut = function(val) {
                        var isString = !isNode(val),
                            frag = can.frag(val),
                            oldNodes = can.makeArray(nodes);

                        // Add a placeholder textNode if necessary.
                        addTextNodeIfNoChildren(frag);

                        if (isString) {
                            frag = can.view.hookup(frag, parentNode);
                        }
                        // We need to mark each node as belonging to the node list.
                        oldNodes = nodeLists.update(nodes, frag.childNodes);
                        elements.replace(oldNodes, frag);
                    };
                data.nodeList = nodes;

                // register the span so nodeLists knows the parentNodeList
                if (!nodeList) {
                    nodeLists.register(nodes, data.teardownCheck);
                } else {
                    nodeList.unregistered = data.teardownCheck;
                }
                makeAndPut(compute());
            },

            replace: function(nodes, val, teardown) {
                var oldNodes = nodes.slice(0),
                    frag = can.frag(val);
                nodeLists.register(nodes, teardown);


                if (typeof val === 'string') {
                    // if it was a string, check for hookups
                    frag = can.view.hookup(frag, nodes[0].parentNode);
                }
                // We need to mark each node as belonging to the node list.
                nodeLists.update(nodes, frag.childNodes);
                elements.replace(oldNodes, frag);
                return nodes;
            },

            text: function(el, compute, parentNode, nodeList) {
                var parent = elements.getParentNode(el, parentNode);
                // setup listening right away so we don't have to re-calculate value
                var data = listen(parent, compute, function(ev, newVal, oldVal) {
                    // Sometimes this is 'unknown' in IE and will throw an exception if it is

                    if (typeof node.nodeValue !== 'unknown') {
                        node.nodeValue = can.view.toStr(newVal);
                    }

                    // TODO: remove in 2.1
                    data.teardownCheck(node.parentNode);
                });
                // The text node that will be updated

                var node = document.createTextNode(can.view.toStr(compute()));
                if (nodeList) {
                    nodeList.unregistered = data.teardownCheck;
                    data.nodeList = nodeList;

                    nodeLists.update(nodeList, [node]);
                    elements.replace([el], node);
                } else {
                    // Replace the placeholder with the live node and do the nodeLists thing.
                    // Add that node to nodeList so we can remove it when the parent element is removed from the page
                    data.nodeList = live.replace([el], node, data.teardownCheck);
                }

            },
            setAttributes: function(el, newVal) {
                var attrs = getAttributeParts(newVal);
                for (var name in attrs) {
                    can.attr.set(el, name, attrs[name]);
                }
            },

            attributes: function(el, compute, currentValue) {
                var oldAttrs = {};

                var setAttrs = function(newVal) {
                    var newAttrs = getAttributeParts(newVal),
                        name;
                    for (name in newAttrs) {
                        var newValue = newAttrs[name],
                            oldValue = oldAttrs[name];
                        if (newValue !== oldValue) {
                            can.attr.set(el, name, newValue);
                        }
                        delete oldAttrs[name];
                    }
                    for (name in oldAttrs) {
                        elements.removeAttr(el, name);
                    }
                    oldAttrs = newAttrs;
                };
                listen(el, compute, function(ev, newVal) {
                    setAttrs(newVal);
                });
                // current value has been set
                if (arguments.length >= 3) {
                    oldAttrs = getAttributeParts(currentValue);
                } else {
                    setAttrs(compute());
                }
            },
            attributePlaceholder: '__!!__',
            attributeReplace: /__!!__/g,
            attribute: function(el, attributeName, compute) {
                listen(el, compute, function(ev, newVal) {
                    elements.setAttr(el, attributeName, hook.render());
                });
                var wrapped = can.$(el),
                    hooks;
                // Get the list of hookups or create one for this element.
                // Hooks is a map of attribute names to hookup `data`s.
                // Each hookup data has:
                // `render` - A `function` to render the value of the attribute.
                // `funcs` - A list of hookup `function`s on that attribute.
                // `batchNum` - The last event `batchNum`, used for performance.
                hooks = can.data(wrapped, 'hooks');
                if (!hooks) {
                    can.data(wrapped, 'hooks', hooks = {});
                }
                // Get the attribute value.
                var attr = elements.getAttr(el, attributeName),
                    // Split the attribute value by the template.
                    // Only split out the first __!!__ so if we have multiple hookups in the same attribute,
                    // they will be put in the right spot on first render
                    parts = attr.split(live.attributePlaceholder),
                    goodParts = [],
                    hook;
                goodParts.push(parts.shift(), parts.join(live.attributePlaceholder));
                // If we already had a hookup for this attribute...
                if (hooks[attributeName]) {
                    // Just add to that attribute's list of `function`s.
                    hooks[attributeName].computes.push(compute);
                } else {
                    // Create the hookup data.
                    hooks[attributeName] = {
                        render: function() {
                            var i = 0,
                                // attr doesn't have a value in IE
                                newAttr = attr ? attr.replace(live.attributeReplace, function() {
                                    return elements.contentText(hook.computes[i++]());
                                }) : elements.contentText(hook.computes[i++]());
                            return newAttr;
                        },
                        computes: [compute],
                        batchNum: undefined
                    };
                }
                // Save the hook for slightly faster performance.
                hook = hooks[attributeName];
                // Insert the value in parts.
                goodParts.splice(1, 0, compute());

                // Set the attribute.
                elements.setAttr(el, attributeName, goodParts.join(''));
            },
            specialAttribute: function(el, attributeName, compute) {
                listen(el, compute, function(ev, newVal) {
                    elements.setAttr(el, attributeName, getValue(newVal));
                });
                elements.setAttr(el, attributeName, getValue(compute()));
            },

            simpleAttribute: function(el, attributeName, compute) {
                listen(el, compute, function(ev, newVal) {
                    elements.setAttr(el, attributeName, newVal);
                });
                elements.setAttr(el, attributeName, compute());
            }
        };
        live.attr = live.simpleAttribute;
        live.attrs = live.attributes;
        var newLine = /(\r|\n)+/g;
        var getValue = function(val) {
            var regexp = /^["'].*["']$/;
            val = val.replace(elements.attrReg, '')
                .replace(newLine, '');
            // check if starts and ends with " or '
            return regexp.test(val) ? val.substr(1, val.length - 2) : val;
        };
        can.view.live = live;

        return live;
    })(__m3, __m20, __m16, __m24, __m25);

    // ## can/view/render.js
    var __m22 = (function(can, elements, live) {


        var pendingHookups = [],
            tagChildren = function(tagName) {
                var newTag = elements.tagMap[tagName] || "span";
                if (newTag === "span") {
                    //innerHTML in IE doesn't honor leading whitespace after empty elements
                    return "@@!!@@";
                }
                return "<" + newTag + ">" + tagChildren(newTag) + "</" + newTag + ">";
            },
            contentText = function(input, tag) {

                // If it's a string, return.
                if (typeof input === 'string') {
                    return input;
                }
                // If has no value, return an empty string.
                if (!input && input !== 0) {
                    return '';
                }

                // If it's an object, and it has a hookup method.
                var hook = (input.hookup &&

                    // Make a function call the hookup method.

                    function(el, id) {
                        input.hookup.call(input, el, id);
                    }) ||

                // Or if it's a `function`, just use the input.
                (typeof input === 'function' && input);

                // Finally, if there is a `function` to hookup on some dom,
                // add it to pending hookups.
                if (hook) {
                    if (tag) {
                        return "<" + tag + " " + can.view.hook(hook) + "></" + tag + ">";
                    } else {
                        pendingHookups.push(hook);
                    }

                    return '';
                }

                // Finally, if all else is `false`, `toString()` it.
                return "" + input;
            },
            // Returns escaped/sanatized content for anything other than a live-binding
            contentEscape = function(txt, tag) {
                return (typeof txt === 'string' || typeof txt === 'number') ?
                    can.esc(txt) :
                    contentText(txt, tag);
            },
            // A flag to indicate if .txt was called within a live section within an element like the {{name}}
            // within `<div {{#person}}{{name}}{{/person}}/>`.
            withinTemplatedSectionWithinAnElement = false,
            emptyHandler = function() {};

        var lastHookups;

        can.extend(can.view, {
                live: live,
                // called in text to make a temporary 
                // can.view.lists function that can be called with
                // the list to iterate over and the template
                // used to produce the content within the list
                setupLists: function() {

                    var old = can.view.lists,
                        data;

                    can.view.lists = function(list, renderer) {
                        data = {
                            list: list,
                            renderer: renderer
                        };
                        return Math.random();
                    };
                    // sets back to the old data
                    return function() {
                        can.view.lists = old;
                        return data;
                    };
                },
                getHooks: function() {
                    var hooks = pendingHookups.slice(0);
                    lastHookups = hooks;
                    pendingHookups = [];
                    return hooks;
                },
                onlytxt: function(self, func) {
                    return contentEscape(func.call(self));
                },

                txt: function(escape, tagName, status, self, func) {
                    // the temporary tag needed for any live setup
                    var tag = (elements.tagMap[tagName] || "span"),
                        // should live-binding be setup
                        setupLiveBinding = false,
                        // the compute's value
                        value,
                        listData,
                        compute,
                        unbind = emptyHandler,
                        attributeName;

                    // Are we currently within a live section within an element like the {{name}}
                    // within `<div {{#person}}{{name}}{{/person}}/>`.
                    if (withinTemplatedSectionWithinAnElement) {
                        value = func.call(self);
                    } else {

                        // If this magic tag is within an attribute or an html element,
                        // set the flag to true so we avoid trying to live bind
                        // anything that func might be setup.
                        // TODO: the scanner should be able to set this up.
                        if (typeof status === "string" || status === 1) {
                            withinTemplatedSectionWithinAnElement = true;
                        }

                        // Sets up a listener so we know any can.view.lists called 
                        // when func is called
                        var listTeardown = can.view.setupLists();
                        unbind = function() {
                            compute.unbind("change", emptyHandler);
                        };
                        // Create a compute that calls func and looks for dependencies.
                        // By passing `false`, this compute can not be a dependency of other 
                        // computes.  This is because live-bits are nested, but 
                        // handle their own updating. For example:
                        //     {{#if items.length}}{{#items}}{{.}}{{/items}}{{/if}}
                        // We do not want `{{#if items.length}}` changing the DOM if
                        // `{{#items}}` text changes.
                        compute = can.compute(func, self, false);

                        // Bind to get and temporarily cache the value of the compute.
                        compute.bind("change", emptyHandler);

                        // Call the "wrapping" function and get the binding information
                        listData = listTeardown();

                        // Get the value of the compute
                        value = compute();

                        // Let people know we are no longer within an element.
                        withinTemplatedSectionWithinAnElement = false;

                        // If we should setup live-binding.
                        setupLiveBinding = compute.hasDependencies;
                    }

                    if (listData) {
                        unbind();
                        return "<" + tag + can.view.hook(function(el, parentNode) {
                            live.list(el, listData.list, listData.renderer, self, parentNode);
                        }) + "></" + tag + ">";
                    }

                    // If we had no observes just return the value returned by func.
                    if (!setupLiveBinding || typeof value === "function") {
                        unbind();
                        return ((withinTemplatedSectionWithinAnElement || escape === 2 || !escape) ?
                            contentText :
                            contentEscape)(value, status === 0 && tag);
                    }

                    // the property (instead of innerHTML elements) to adjust. For
                    // example options should use textContent
                    var contentProp = elements.tagToContentPropMap[tagName];

                    // The magic tag is outside or between tags.
                    if (status === 0 && !contentProp) {
                        // Return an element tag with a hookup in place of the content
                        return "<" + tag + can.view.hook(
                            // if value is an object, it's likely something returned by .safeString
                            escape && typeof value !== "object" ?
                            // If we are escaping, replace the parentNode with 
                            // a text node who's value is `func`'s return value.

                            function(el, parentNode) {
                                live.text(el, compute, parentNode);
                                unbind();
                            } :
                            // If we are not escaping, replace the parentNode with a
                            // documentFragment created as with `func`'s return value.

                            function(el, parentNode) {
                                live.html(el, compute, parentNode);
                                unbind();
                                //children have to be properly nested HTML for buildFragment to work properly
                            }) + ">" + tagChildren(tag) + "</" + tag + ">";
                        // In a tag, but not in an attribute
                    } else if (status === 1) {
                        // remember the old attr name
                        pendingHookups.push(function(el) {
                            live.attributes(el, compute, compute());
                            unbind();
                        });

                        return compute();
                    } else if (escape === 2) { // In a special attribute like src or style

                        attributeName = status;
                        pendingHookups.push(function(el) {
                            live.specialAttribute(el, attributeName, compute);
                            unbind();
                        });
                        return compute();
                    } else { // In an attribute...
                        attributeName = status === 0 ? contentProp : status;
                        // if the magic tag is inside the element, like `<option><% TAG %></option>`,
                        // we add this hookup to the last element (ex: `option`'s) hookups.
                        // Otherwise, the magic tag is in an attribute, just add to the current element's
                        // hookups.
                        (status === 0 ? lastHookups : pendingHookups)
                            .push(function(el) {
                                live.attribute(el, attributeName, compute);
                                unbind();
                            });
                        return live.attributePlaceholder;
                    }
                }
            });

        return can;
    })(__m16, __m20, __m23, __m2);

    // ## can/view/mustache/mustache.js
    var __m17 = (function(can) {

        // # mustache.js
        // `can.Mustache`: The Mustache templating engine.
        // See the [Transformation](#section-29) section within *Scanning Helpers* for a detailed explanation 
        // of the runtime render code design. The majority of the Mustache engine implementation 
        // occurs within the *Transformation* scanning helper.

        // ## Initialization
        // Define the view extension.
        can.view.ext = ".mustache";

        // ### Setup internal helper variables and functions.
        // An alias for the context variable used for tracking a stack of contexts.
        // This is also used for passing to helper functions to maintain proper context.
        var SCOPE = 'scope',
            // An alias for the variable used for the hash object that can be passed
            // to helpers via `options.hash`.
            HASH = '___h4sh',
            // An alias for the most used context stacking call.
            CONTEXT_OBJ = '{scope:' + SCOPE + ',options:options}',
            // a context object used to incidate being special
            SPECIAL_CONTEXT_OBJ = '{scope:' + SCOPE + ',options:options, special: true}',
            // argument names used to start the function (used by scanner and steal)
            ARG_NAMES = SCOPE + ",options",

            // matches arguments inside a {{ }}
            argumentsRegExp = /((([^'"\s]+?=)?('.*?'|".*?"))|.*?)\s/g,

            // matches a literal number, string, null or regexp
            literalNumberStringBooleanRegExp = /^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/,

            // returns an object literal that we can use to look up a value in the current scope
            makeLookupLiteral = function(type) {
                return '{get:"' + type.replace(/"/g, '\\"') + '"}';
            },
            // returns if the object is a lookup
            isLookup = function(obj) {
                return obj && typeof obj.get === "string";
            },


            isObserveLike = function(obj) {
                return obj instanceof can.Map || (obj && !! obj._get);
            },


            isArrayLike = function(obj) {
                return obj && obj.splice && typeof obj.length === 'number';
            },
            // used to make sure .fn and .inverse are always called with a Scope like object
            makeConvertToScopes = function(original, scope, options) {
                var originalWithScope = function(ctx, opts) {
                    return original(ctx || scope, opts);
                };
                return function(updatedScope, updatedOptions) {
                    if (updatedScope !== undefined && !(updatedScope instanceof can.view.Scope)) {
                        updatedScope = scope.add(updatedScope);
                    }
                    if (updatedOptions !== undefined && !(updatedOptions instanceof can.view.Options)) {
                        updatedOptions = options.add(updatedOptions);
                    }
                    return originalWithScope(updatedScope, updatedOptions || options);
                };
            };

        // ## Mustache

        var Mustache = function(options, helpers) {
            // Support calling Mustache without the constructor.
            // This returns a function that renders the template.
            if (this.constructor !== Mustache) {
                var mustache = new Mustache(options);
                return function(data, options) {
                    return mustache.render(data, options);
                };
            }

            // If we get a `function` directly, it probably is coming from
            // a `steal`-packaged view.
            if (typeof options === "function") {
                this.template = {
                    fn: options
                };
                return;
            }

            // Set options on self.
            can.extend(this, options);
            this.template = this.scanner.scan(this.text, this.name);
        };


        // Put Mustache on the `can` object.
        can.Mustache = window.Mustache = Mustache;


        Mustache.prototype.

        render = function(data, options) {
            if (!(data instanceof can.view.Scope)) {
                data = new can.view.Scope(data || {});
            }
            if (!(options instanceof can.view.Options)) {
                options = new can.view.Options(options || {});
            }
            options = options || {};

            return this.template.fn.call(data, data, options);
        };

        can.extend(Mustache.prototype, {
                // Share a singleton scanner for parsing templates.
                scanner: new can.view.Scanner({
                        // A hash of strings for the scanner to inject at certain points.
                        text: {
                            // This is the logic to inject at the beginning of a rendered template. 
                            // This includes initializing the `context` stack.
                            start: "", //"var "+SCOPE+"= this instanceof can.view.Scope? this : new can.view.Scope(this);\n",
                            scope: SCOPE,
                            options: ",options: options",
                            argNames: ARG_NAMES
                        },

                        // An ordered token registry for the scanner.
                        // This needs to be ordered by priority to prevent token parsing errors.
                        // Each token follows the following structure:
                        //		[
                        //			// Which key in the token map to match.
                        //			"tokenMapName",
                        //			// A simple token to match, like "{{".
                        //			"token",
                        //			// Optional. A complex (regexp) token to match that 
                        //			// overrides the simple token.
                        //			"[\\s\\t]*{{",
                        //			// Optional. A function that executes advanced 
                        //			// manipulation of the matched content. This is 
                        //			// rarely used.
                        //			function(content){   
                        //				return content;
                        //			}
                        //		]
                        tokens: [

                            // Return unescaped
                            ["returnLeft", "{{{", "{{[{&]"],
                            // Full line comments
                            ["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"],

                            // Inline comments
                            ["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"],

                            // Full line escapes
                            // This is used for detecting lines with only whitespace and an escaped tag
                            ["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)",
                                function(content) {
                                    return {
                                        before: /^\n.+?\n$/.test(content) ? '\n' : '',
                                        content: content.match(/\{\{(.+?)\}\}/)[1] || ''
                                    };
                                }
                            ],
                            // Return escaped
                            ["escapeLeft", "{{"],
                            // Close return unescaped
                            ["returnRight", "}}}"],
                            // Close tag
                            ["right", "}}"]
                        ],

                        // ## Scanning Helpers
                        // This is an array of helpers that transform content that is within escaped tags like `{{token}}`. These helpers are solely for the scanning phase; they are unrelated to Mustache/Handlebars helpers which execute at render time. Each helper has a definition like the following:
                        //		{
                        //			// The content pattern to match in order to execute.
                        //			// Only the first matching helper is executed.
                        //			name: /pattern to match/,
                        //			// The function to transform the content with.
                        //			// @param {String} content   The content to transform.
                        //			// @param {Object} cmd       Scanner helper data.
                        //			//                           {
                        //			//                             insert: "insert command",
                        //			//                             tagName: "div",
                        //			//                             status: 0
                        //			//                           }
                        //			fn: function(content, cmd) {
                        //				return 'for text injection' || 
                        //					{ raw: 'to bypass text injection' };
                        //			}
                        //		}
                        helpers: [
                            // ### Partials
                            // Partials begin with a greater than sign, like {{> box}}.
                            // Partials are rendered at runtime (as opposed to compile time), 
                            // so recursive partials are possible. Just avoid infinite loops.
                            // For example, this template and partial:
                            // 		base.mustache:
                            // 			<h2>Names</h2>
                            // 			{{#names}}
                            // 				{{> user}}
                            // 			{{/names}}
                            // 		user.mustache:
                            // 			<strong>{{name}}</strong>
                            {
                                name: /^>[\s]*\w*/,
                                fn: function(content, cmd) {
                                    // Get the template name and call back into the render method,
                                    // passing the name and the current context.
                                    var templateName = can.trim(content.replace(/^>\s?/, ''))
                                        .replace(/["|']/g, "");
                                    return "can.Mustache.renderPartial('" + templateName + "'," + ARG_NAMES + ")";
                                }
                            },

                            // ### Data Hookup
                            // This will attach the data property of `this` to the element
                            // its found on using the first argument as the data attribute
                            // key.
                            // For example:
                            //		<li id="nameli" {{ data 'name' }}></li>
                            // then later you can access it like:
                            //		can.$('#nameli').data('name');

                            {
                                name: /^\s*data\s/,
                                fn: function(content, cmd) {
                                    var attr = content.match(/["|'](.*)["|']/)[1];
                                    // return a function which calls `can.data` on the element
                                    // with the attribute name with the current context.
                                    return "can.proxy(function(__){" +
                                    // "var context = this[this.length-1];" +
                                    // "context = context." + STACKED + " ? context[context.length-2] : context; console.warn(this, context);" +
                                    "can.data(can.$(__),'" + attr + "', this.attr('.')); }, " + SCOPE + ")";
                                }
                            }, {
                                name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                                fn: function(content) {
                                    var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                                        parts = content.match(quickFunc);

                                    //find 
                                    return "can.proxy(function(__){var " + parts[1] + "=can.$(__);with(" + SCOPE + ".attr('.')){" + parts[2] + "}}, this);";
                                }
                            },
                            // ### Transformation (default)
                            // This transforms all content to its interpolated equivalent,
                            // including calls to the corresponding helpers as applicable. 
                            // This outputs the render code for almost all cases.
                            // #### Definitions
                            // * `context` - This is the object that the current rendering context operates within. 
                            //		Each nested template adds a new `context` to the context stack.
                            // * `stack` - Mustache supports nested sections, 
                            //		each of which add their own context to a stack of contexts.
                            //		Whenever a token gets interpolated, it will check for a match against the 
                            //		last context in the stack, then iterate through the rest of the stack checking for matches.
                            //		The first match is the one that gets returned.
                            // * `Mustache.txt` - This serializes a collection of logic, optionally contained within a section.
                            //		If this is a simple interpolation, only the interpolation lookup will be passed.
                            //		If this is a section, then an `options` object populated by the truthy (`options.fn`) and 
                            //		falsey (`options.inverse`) encapsulated functions will also be passed. This section handling 
                            //		exists to support the runtime context nesting that Mustache supports.
                            // * `Mustache.get` - This resolves an interpolation reference given a stack of contexts.
                            // * `options` - An object containing methods for executing the inner contents of sections or helpers.  
                            //		`options.fn` - Contains the inner template logic for a truthy section.  
                            //		`options.inverse` - Contains the inner template logic for a falsey section.  
                            //		`options.hash` - Contains the merged hash object argument for custom helpers.
                            // #### Design
                            // This covers the design of the render code that the transformation helper generates.
                            // ##### Pseudocode
                            // A detailed explanation is provided in the following sections, but here is some brief pseudocode
                            // that gives a high level overview of what the generated render code does (with a template similar to  
                            // `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`).
                            // *Initialize the render code.*
                            // 		view = []
                            // 		context = []
                            // 		stack = fn { context.concat([this]) }
                            // *Render the root section.*
                            // 		view.push( "string" )
                            // 		view.push( can.view.txt(
                            // *Render the nested section with `can.Mustache.txt`.*
                            // 			txt( 
                            // *Add the current context to the stack.*
                            // 				stack(), 
                            // *Flag this for truthy section mode.*
                            // 				"#",
                            // *Interpolate and check the `a` variable for truthyness using the stack with `can.Mustache.get`.*
                            // 				get( "a", stack() ),
                            // *Include the nested section's inner logic.
                            // The stack argument is usually the parent section's copy of the stack, 
                            // but it can be an override context that was passed by a custom helper.
                            // Sections can nest `0..n` times -- **NESTCEPTION**.*
                            // 				{ fn: fn(stack) {
                            // *Render the nested section (everything between the `{{#a}}` and `{{/a}}` tokens).*
                            // 					view = []
                            // 					view.push( "string" )
                            // 					view.push(
                            // *Add the current context to the stack.*
                            // 						stack(),
                            // *Flag this as interpolation-only mode.*
                            // 						null,
                            // *Interpolate the `b.c.d.e.name` variable using the stack.*
                            // 						get( "b.c.d.e.name", stack() ),
                            // 					)
                            // 					view.push( "string" )
                            // *Return the result for the nested section.*
                            // 					return view.join()
                            // 				}}
                            // 			)
                            // 		))
                            // 		view.push( "string" )
                            // *Return the result for the root section, which includes all nested sections.*
                            // 		return view.join()
                            // ##### Initialization
                            // Each rendered template is started with the following initialization code:
                            // 		var ___v1ew = [];
                            // 		var ___c0nt3xt = [];
                            // 		___c0nt3xt.__sc0pe = true;
                            // 		var __sc0pe = function(context, self) {
                            // 			var s;
                            // 			if (arguments.length == 1 && context) {
                            // 				s = !context.__sc0pe ? [context] : context;
                            // 			} else {
                            // 				s = context && context.__sc0pe 
                            //					? context.concat([self]) 
                            //					: __sc0pe(context).concat([self]);
                            // 			}
                            // 			return (s.__sc0pe = true) && s;
                            // 		};
                            // The `___v1ew` is the the array used to serialize the view.
                            // The `___c0nt3xt` is a stacking array of contexts that slices and expands with each nested section.
                            // The `__sc0pe` function is used to more easily update the context stack in certain situations.
                            // Usually, the stack function simply adds a new context (`self`/`this`) to a context stack. 
                            // However, custom helpers will occasionally pass override contexts that need their own context stack.
                            // ##### Sections
                            // Each section, `{{#section}} content {{/section}}`, within a Mustache template generates a section 
                            // context in the resulting render code. The template itself is treated like a root section, with the 
                            // same execution logic as any others. Each section can have `0..n` nested sections within it.
                            // Here's an example of a template without any descendent sections.  
                            // Given the template: `"{{a.b.c.d.e.name}}" == "Phil"`  
                            // Would output the following render code:
                            //		___v1ew.push("\"");
                            //		___v1ew.push(can.view.txt(1, '', 0, this, function() {
                            // 			return can.Mustache.txt(__sc0pe(___c0nt3xt, this), null, 
                            //				can.Mustache.get("a.b.c.d.e.name", 
                            //					__sc0pe(___c0nt3xt, this))
                            //			);
                            //		}));
                            //		___v1ew.push("\" == \"Phil\"");
                            // The simple strings will get appended to the view. Any interpolated references (like `{{a.b.c.d.e.name}}`) 
                            // will be pushed onto the view via `can.view.txt` in order to support live binding.
                            // The function passed to `can.view.txt` will call `can.Mustache.txt`, which serializes the object data by doing 
                            // a context lookup with `can.Mustache.get`.
                            // `can.Mustache.txt`'s first argument is a copy of the context stack with the local context `this` added to it.
                            // This stack will grow larger as sections nest.
                            // The second argument is for the section type. This will be `"#"` for truthy sections, `"^"` for falsey, 
                            // or `null` if it is an interpolation instead of a section.
                            // The third argument is the interpolated value retrieved with `can.Mustache.get`, which will perform the 
                            // context lookup and return the approriate string or object.
                            // Any additional arguments, if they exist, are used for passing arguments to custom helpers.
                            // For nested sections, the last argument is an `options` object that contains the nested section's logic.
                            // Here's an example of a template with a single nested section.  
                            // Given the template: `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`  
                            // Would output the following render code:
                            //		___v1ew.push("\"");
                            // 		___v1ew.push(can.view.txt(0, '', 0, this, function() {
                            // 			return can.Mustache.txt(__sc0pe(___c0nt3xt, this), "#", 
                            //				can.Mustache.get("a", __sc0pe(___c0nt3xt, this)), 
                            //					[{
                            // 					_: function() {
                            // 						return ___v1ew.join("");
                            // 					}
                            // 				}, {
                            // 					fn: function(___c0nt3xt) {
                            // 						var ___v1ew = [];
                            // 						___v1ew.push(can.view.txt(1, '', 0, this, 
                            //								function() {
                            //                                  return can.Mustache.txt(
                            // 									__sc0pe(___c0nt3xt, this), 
                            // 									null, 
                            // 									can.Mustache.get("b.c.d.e.name", 
                            // 										__sc0pe(___c0nt3xt, this))
                            // 								);
                            // 							}
                            // 						));
                            // 						return ___v1ew.join("");
                            // 					}
                            // 				}]
                            //			)
                            // 		}));
                            //		___v1ew.push("\" == \"Phil\"");
                            // This is specified as a truthy section via the `"#"` argument. The last argument includes an array of helper methods used with `options`.
                            // These act similarly to custom helpers: `options.fn` will be called for truthy sections, `options.inverse` will be called for falsey sections.
                            // The `options._` function only exists as a dummy function to make generating the section nesting easier (a section may have a `fn`, `inverse`,
                            // or both, but there isn't any way to determine that at compilation time).
                            // Within the `fn` function is the section's render context, which in this case will render anything between the `{{#a}}` and `{{/a}}` tokens.
                            // This function has `___c0nt3xt` as an argument because custom helpers can pass their own override contexts. For any case where custom helpers
                            // aren't used, `___c0nt3xt` will be equivalent to the `__sc0pe(___c0nt3xt, this)` stack created by its parent section. The `inverse` function
                            // works similarly, except that it is added when `{{^a}}` and `{{else}}` are used. `var ___v1ew = []` is specified in `fn` and `inverse` to 
                            // ensure that live binding in nested sections works properly.
                            // All of these nested sections will combine to return a compiled string that functions similar to EJS in its uses of `can.view.txt`.
                            // #### Implementation
                            {
                                name: /^.*$/,
                                fn: function(content, cmd) {
                                    var mode = false,
                                        result = {
                                            content: "",
                                            startTxt: false,
                                            startOnlyTxt: false,
                                            end: false
                                        };

                                    // Trim the content so we don't have any trailing whitespace.
                                    content = can.trim(content);

                                    // Determine what the active mode is.
                                    // * `#` - Truthy section
                                    // * `^` - Falsey section
                                    // * `/` - Close the prior section
                                    // * `else` - Inverted section (only exists within a truthy/falsey section)
                                    if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
                                        mode = mode[0];
                                        switch (mode) {

                                            // Open a new section.
                                            case '#':

                                            case '^':
                                                if (cmd.specialAttribute) {
                                                    result.startOnlyTxt = true;
                                                    //result.push(cmd.insert + 'can.view.onlytxt(this,function(){ return ');
                                                } else {
                                                    result.startTxt = true;
                                                    // sections should never be escaped
                                                    result.escaped = 0;
                                                    //result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
                                                }
                                                break;
                                                // Close the prior section.

                                            case '/':
                                                result.end = true;
                                                result.content += 'return ___v1ew.join("");}}])';
                                                return result;
                                        }

                                        // Trim the mode off of the content.
                                        content = content.substring(1);
                                    }

                                    // `else` helpers are special and should be skipped since they don't 
                                    // have any logic aside from kicking off an `inverse` function.
                                    if (mode !== 'else') {
                                        var args = [],
                                            hashes = [],
                                            i = 0,
                                            m;

                                        // Start the content render block.
                                        result.content += 'can.Mustache.txt(\n' +
                                        (cmd.specialAttribute ? SPECIAL_CONTEXT_OBJ : CONTEXT_OBJ) +
                                            ',\n' + (mode ? '"' + mode + '"' : 'null') + ',';

                                        // Parse the helper arguments.
                                        // This needs uses this method instead of a split(/\s/) so that 
                                        // strings with spaces can be correctly parsed.
                                        (can.trim(content) + ' ')
                                            .replace(argumentsRegExp, function(whole, arg) {

                                                // Check for special helper arguments (string/number/boolean/hashes).
                                                if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
                                                    // Found a native type like string/number/boolean.
                                                    if (m[2]) {
                                                        args.push(m[0]);
                                                    }
                                                    // Found a hash object.
                                                    else {
                                                        // Addd to the hash object.

                                                        hashes.push(m[4] + ":" + (m[6] ? m[6] : makeLookupLiteral(m[5])));
                                                    }
                                                }
                                                // Otherwise output a normal interpolation reference.
                                                else {
                                                    args.push(makeLookupLiteral(arg));
                                                }
                                                i++;
                                            });

                                        result.content += args.join(",");
                                        if (hashes.length) {
                                            result.content += ",{" + HASH + ":{" + hashes.join(",") + "}}";
                                        }

                                    }

                                    // Create an option object for sections of code.
                                    if (mode && mode !== 'else') {
                                        result.content += ',[\n\n';
                                    }
                                    switch (mode) {
                                        // Truthy section
                                        case '^':
                                        case '#':
                                            result.content += ('{fn:function(' + ARG_NAMES + '){var ___v1ew = [];');
                                            break;
                                            // If/else section
                                            // Falsey section

                                        case 'else':
                                            result.content += 'return ___v1ew.join("");}},\n{inverse:function(' + ARG_NAMES + '){\nvar ___v1ew = [];';
                                            break;

                                            // Not a section, no mode
                                        default:
                                            result.content += (')');
                                            break;
                                    }

                                    if (!mode) {
                                        result.startTxt = true;
                                        result.end = true;
                                    }

                                    return result;
                                }
                            }
                        ]
                    })
            });

        // Add in default scanner helpers first.
        // We could probably do this differently if we didn't 'break' on every match.
        var helpers = can.view.Scanner.prototype.helpers;
        for (var i = 0; i < helpers.length; i++) {
            Mustache.prototype.scanner.helpers.unshift(helpers[i]);
        }


        Mustache.txt = function(scopeAndOptions, mode, name) {

            // here we are going to cache the lookup values so future calls are much faster
            var scope = scopeAndOptions.scope,
                options = scopeAndOptions.options,
                args = [],
                helperOptions = {
                    fn: function() {},
                    inverse: function() {}
                },
                hash,
                context = scope.attr("."),
                getHelper = true,
                helper;

            // convert lookup values to actual values in name, arguments, and hash
            for (var i = 3; i < arguments.length; i++) {
                var arg = arguments[i];
                if (mode && can.isArray(arg)) {
                    // merge into options
                    helperOptions = can.extend.apply(can, [helperOptions].concat(arg));
                } else if (arg && arg[HASH]) {
                    hash = arg[HASH];
                    // get values on hash
                    for (var prop in hash) {
                        if (isLookup(hash[prop])) {
                            hash[prop] = Mustache.get(hash[prop].get, scopeAndOptions, false, true);
                        }
                    }
                } else if (arg && isLookup(arg)) {
                    args.push(Mustache.get(arg.get, scopeAndOptions, false, true, true));
                } else {
                    args.push(arg);
                }
            }

            if (isLookup(name)) {
                var get = name.get;
                name = Mustache.get(name.get, scopeAndOptions, args.length, false);

                // Base whether or not we will get a helper on whether or not the original
                // name.get and Mustache.get resolve to the same thing. Saves us from running
                // into issues like {{text}} / {text: 'with'}
                getHelper = (get === name);
            }

            // overwrite fn and inverse to always convert to scopes
            helperOptions.fn = makeConvertToScopes(helperOptions.fn, scope, options);
            helperOptions.inverse = makeConvertToScopes(helperOptions.inverse, scope, options);

            // if mode is ^, swap fn and inverse
            if (mode === '^') {
                var tmp = helperOptions.fn;
                helperOptions.fn = helperOptions.inverse;
                helperOptions.inverse = tmp;
            }

            // Check for a registered helper or a helper-like function.
            if (helper = (getHelper && (typeof name === "string" && Mustache.getHelper(name, options)) || (can.isFunction(name) && !name.isComputed && {
                            fn: name
                        }))) {
                // Add additional data to be used by helper functions

                can.extend(helperOptions, {
                        context: context,
                        scope: scope,
                        contexts: scope,
                        hash: hash
                    });

                args.push(helperOptions);
                // Call the helper.
                return function() {
                    return helper.fn.apply(context, args) || '';
                };

            }

            return function() {
                //{{#foo.bar zed ted}}
                var value;
                if (can.isFunction(name) && name.isComputed) {
                    value = name();
                } else {
                    value = name;
                }
                // An array of arguments to check for truthyness when evaluating sections.
                var validArgs = args.length ? args : [value],
                    // Whether the arguments meet the condition of the section.
                    valid = true,
                    result = [],
                    i, argIsObserve, arg;
                // Validate the arguments based on the section mode.
                if (mode) {
                    for (i = 0; i < validArgs.length; i++) {
                        arg = validArgs[i];
                        argIsObserve = typeof arg !== 'undefined' && isObserveLike(arg);
                        // Array-like objects are falsey if their length = 0.
                        if (isArrayLike(arg)) {
                            // Use .attr to trigger binding on empty lists returned from function
                            if (mode === '#') {
                                valid = valid && !! (argIsObserve ? arg.attr('length') : arg.length);
                            } else if (mode === '^') {
                                valid = valid && !(argIsObserve ? arg.attr('length') : arg.length);
                            }
                        }
                        // Otherwise just check if it is truthy or not.
                        else {
                            valid = mode === '#' ? valid && !! arg : mode === '^' ? valid && !arg : valid;
                        }
                    }
                }

                // Otherwise interpolate like normal.
                if (valid) {

                    if (mode === "#") {
                        if (isArrayLike(value)) {
                            var isObserveList = isObserveLike(value);

                            // Add the reference to the list in the contexts.
                            for (i = 0; i < value.length; i++) {
                                result.push(helperOptions.fn(
                                        isObserveList ? value.attr('' + i) : value[i]));
                            }
                            return result.join('');
                        }
                        // Normal case.
                        else {
                            return helperOptions.fn(value || {}) || '';
                        }
                    } else if (mode === "^") {
                        return helperOptions.inverse(value || {}) || '';
                    } else {
                        return '' + (value != null ? value : '');
                    }
                }

                return '';
            };
        };


        Mustache.get = function(key, scopeAndOptions, isHelper, isArgument, isLookup) {

            // Cache a reference to the current context and options, we will use them a bunch.
            var context = scopeAndOptions.scope.attr('.'),
                options = scopeAndOptions.options || {};

            // If key is called as a helper,
            if (isHelper) {
                // try to find a registered helper.
                if (Mustache.getHelper(key, options)) {
                    return key;
                }
                // Support helper-like functions as anonymous helpers.
                // Check if there is a method directly in the "top" context.
                if (scopeAndOptions.scope && can.isFunction(context[key])) {
                    return context[key];
                }


            }

            // Get a compute (and some helper data) that represents key's value in the current scope
            var computeData = scopeAndOptions.scope.computeData(key, {
                    isArgument: isArgument,
                    args: [context, scopeAndOptions.scope]
                }),
                compute = computeData.compute;

            // Bind on the compute to cache its value. We will unbind in a timeout later.
            can.compute.temporarilyBind(compute);

            // computeData gives us an initial value
            var initialValue = computeData.initialValue,
                helperObj = Mustache.getHelper(key, options);



            // Use helper over the found value if the found value isn't in the current context
            if (!isLookup && (initialValue === undefined || computeData.scope !== scopeAndOptions.scope) && Mustache.getHelper(key, options)) {
                return key;
            }

            // If there are no dependencies, just return the value.
            if (!compute.hasDependencies) {
                return initialValue;
            } else {
                return compute;
            }
        };


        Mustache.resolve = function(value) {
            if (isObserveLike(value) && isArrayLike(value) && value.attr('length')) {
                return value;
            } else if (can.isFunction(value)) {
                return value();
            } else {
                return value;
            }
        };



        can.view.Options = can.view.Scope.extend({
                init: function(data, parent) {
                    if (!data.helpers && !data.partials && !data.tags) {
                        data = {
                            helpers: data
                        };
                    }
                    can.view.Scope.prototype.init.apply(this, arguments);
                }
            });

        // ## Helpers
        // Helpers are functions that can be called from within a template.
        // These helpers differ from the scanner helpers in that they execute
        // at runtime instead of during compilation.
        // Custom helpers can be added via `can.Mustache.registerHelper`,
        // but there are also some built-in helpers included by default.
        // Most of the built-in helpers are little more than aliases to actions 
        // that the base version of Mustache simply implies based on the 
        // passed in object.
        // Built-in helpers:
        // * `data` - `data` is a special helper that is implemented via scanning helpers. 
        //		It hooks up the active element to the active data object: `<div {{data "key"}} />`
        // * `if` - Renders a truthy section: `{{#if var}} render {{/if}}`
        // * `unless` - Renders a falsey section: `{{#unless var}} render {{/unless}}`
        // * `each` - Renders an array: `{{#each array}} render {{this}} {{/each}}`
        // * `with` - Opens a context section: `{{#with var}} render {{/with}}`
        Mustache._helpers = {};

        Mustache.registerHelper = function(name, fn) {
            this._helpers[name] = {
                name: name,
                fn: fn
            };
        };


        Mustache.getHelper = function(name, options) {
            var helper;
            if (options) {
                helper = options.attr("helpers." + name);
            }
            return helper ? {
                fn: helper
            } : this._helpers[name];
        };


        Mustache.render = function(partial, scope, options) {
            // TOOD: clean up the following
            // If there is a "partial" property and there is not
            // an already-cached partial, we use the value of the 
            // property to look up the partial

            // if this partial is not cached ...
            if (!can.view.cached[partial]) {
                // we don't want to bind to changes so clear and restore reading
                var reads = can.__clearReading();
                if (scope.attr('partial')) {
                    partial = scope.attr('partial');
                }
                can.__setReading(reads);
            }

            // Call into `can.view.render` passing the
            // partial and scope.
            return can.view.render(partial, scope, options);
        };


        Mustache.safeString = function(str) {
            return {
                toString: function() {
                    return str;
                }
            };
        };

        Mustache.renderPartial = function(partialName, scope, options) {
            var partial = options.attr("partials." + partialName);
            if (partial) {
                return partial.render ? partial.render(scope, options) :
                    partial(scope, options);
            } else {
                return can.Mustache.render(partialName, scope, options);
            }
        };

        // The built-in Mustache helpers.
        can.each({
                // Implements the `if` built-in helper.

                'if': function(expr, options) {
                    var value;
                    // if it's a function, wrap its value in a compute
                    // that will only change values from true to false
                    if (can.isFunction(expr)) {
                        value = can.compute.truthy(expr)();
                    } else {
                        value = !! Mustache.resolve(expr);
                    }

                    if (value) {
                        return options.fn(options.contexts || this);
                    } else {
                        return options.inverse(options.contexts || this);
                    }
                },
                // Implements the `unless` built-in helper.

                'unless': function(expr, options) {
                    return Mustache._helpers['if'].fn.apply(this, [can.isFunction(expr) ? can.compute(function() {
                                    return !expr();
                                }) : !expr, options]);
                },

                // Implements the `each` built-in helper.

                'each': function(expr, options) {
                    // Check if this is a list or a compute that resolves to a list, and setup
                    // the incremental live-binding 

                    // First, see what we are dealing with.  It's ok to read the compute
                    // because can.view.text is only temporarily binding to what is going on here.
                    // Calling can.view.lists prevents anything from listening on that compute.
                    var resolved = Mustache.resolve(expr),
                        result = [],
                        keys,
                        key,
                        i;

                    // When resolved === undefined, the property hasn't been defined yet
                    // Assume it is intended to be a list
                    if (can.view.lists && (resolved instanceof can.List || (expr && expr.isComputed && resolved === undefined))) {
                        return can.view.lists(expr, function(item, index) {
                            return options.fn(options.scope.add({
                                        "@index": index
                                    })
                                .add(item));
                        });
                    }
                    expr = resolved;

                    if ( !! expr && isArrayLike(expr)) {
                        for (i = 0; i < expr.length; i++) {
                            result.push(options.fn(options.scope.add({
                                            "@index": i
                                        })
                                    .add(expr[i])));
                        }
                        return result.join('');
                    } else if (isObserveLike(expr)) {
                        keys = can.Map.keys(expr);
                        // listen to keys changing so we can livebind lists of attributes.

                        for (i = 0; i < keys.length; i++) {
                            key = keys[i];
                            result.push(options.fn(options.scope.add({
                                            "@key": key
                                        })
                                    .add(expr[key])));
                        }
                        return result.join('');
                    } else if (expr instanceof Object) {
                        for (key in expr) {
                            result.push(options.fn(options.scope.add({
                                            "@key": key
                                        })
                                    .add(expr[key])));
                        }
                        return result.join('');

                    }
                },
                // Implements the `with` built-in helper.

                'with': function(expr, options) {
                    var ctx = expr;
                    expr = Mustache.resolve(expr);
                    if ( !! expr) {
                        return options.fn(ctx);
                    }
                },

                'log': function(expr, options) {
                    if (typeof console !== "undefined" && console.log) {
                        if (!options) {
                            console.log(expr.context);
                        } else {
                            console.log(expr, options.context);
                        }
                    }
                },

                "@index": function(offset, options) {
                    if (!options) {
                        options = offset;
                        offset = 0;
                    }
                    var index = options.scope.attr("@index");
                    return "" + ((can.isFunction(index) ? index() : index) + offset);
                }

            }, function(fn, name) {
                Mustache.registerHelper(name, fn);
            });

        // ## Registration
        // Registers Mustache with can.view.
        can.view.register({
                suffix: "mustache",

                contentType: "x-mustache-template",

                // Returns a `function` that renders the view.
                script: function(id, src) {
                    return "can.Mustache(function(" + ARG_NAMES + ") { " + new Mustache({
                            text: src,
                            name: id
                        })
                        .template.out + " })";
                },

                renderer: function(id, text) {
                    return Mustache({
                            text: text,
                            name: id
                        });
                }
            });

        can.mustache.registerHelper = can.proxy(can.Mustache.registerHelper, can.Mustache);
        can.mustache.safeString = can.Mustache.safeString;
        return can;
    })(__m3, __m18, __m16, __m19, __m15, __m22);

    window['can'] = __m5;
})();