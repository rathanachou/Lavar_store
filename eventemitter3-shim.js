// Shim for eventemitter3. The package ships CJS-only with an empty
// "exports" field, which Rollup can't resolve as a default ESM import.
// We inline a minimal EventEmitter implementation that matches the
// API surface recharts uses (new EventEmitter(), .on(), .emit()).

const prefix = false;

function Events() {}

function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== "function") {
    throw new TypeError("The listener must be a function");
  }
  var listener = new EE(fn, context || emitter, once);
  var evt = prefix ? prefix + event : event;
  if (!emitter._events[evt]) emitter._events[evt] = listener;
  else if (!emitter._events[evt].fn)
    emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];
  return emitter;
}

function clearEvent(emitter, event) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[event];
}

function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

EventEmitter.prototype.eventNames = function () {
  return [];
};

EventEmitter.prototype.listeners = function (event) {
  var evt = prefix ? prefix + event : event;
  var handlers = this._events[evt];
  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];
  var ret = [];
  for (var i = 0; i < handlers.length; i++) ret.push(handlers[i].fn);
  return ret;
};

EventEmitter.prototype.listenerCount = function (event) {
  var evt = prefix ? prefix + event : event;
  var listeners = this._events[evt];
  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

EventEmitter.prototype.emit = function (event) {
  var evt = prefix ? prefix + event : event;
  if (!this._events[evt]) return false;
  var listeners = this._events[evt];
  if (listeners.fn) {
    listeners.fn.apply(listeners.context, Array.prototype.slice.call(arguments, 1));
    return true;
  }
  for (var i = 0; i < listeners.length; i++) {
    listeners[i].fn.apply(listeners[i].context, Array.prototype.slice.call(arguments, 1));
  }
  return true;
};

EventEmitter.prototype.on = function (event, fn, context) {
  return addListener(this, event, fn, context, false);
};

EventEmitter.prototype.once = function (event, fn, context) {
  return addListener(this, event, fn, context, true);
};

EventEmitter.prototype.removeListener = function (event, fn, context, once) {
  var evt = prefix ? prefix + event : event;
  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }
  var listeners = this._events[evt];
  if (listeners.fn === fn && (!once || listeners.once)) {
    clearEvent(this, evt);
    return this;
  }
  return this;
};

EventEmitter.prototype.removeAllListeners = function (event) {
  if (event) {
    clearEvent(this, event);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }
  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

export default EventEmitter;
export { EventEmitter };
