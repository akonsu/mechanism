/* -*- mode:javascript; coding:utf-8; -*- Time-stamp: <script.js - akonsu> */

//
// fix window.requestAnimationFrame
//

//change test

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                                    window.mozRequestAnimationFrame ||
                                    window.oRequestAnimationFrame ||
                                    window.msRequestAnimationFrame ||
                                    function (callback) { window.setTimeout(callback, 1000 / 60) });
}

//
// fix array filter
//
if (!Array.prototype.filter) {
    Array.prototype.filter = function(f, thisp) {
        'use strict';

        var t = Object(this);
        var r = [];

        for (var i = 0, c = t.length >>> 0; i < c; i++) {
            if (i in t) {
                var v = t[i]; // in case f mutates this

                if (f.call(thisp, v, i, t)) {
                    r.push(v);
                }
            }
        }
        return r;
    };
}

(function (window) {
    var auto_rotate = true;
    var click;
    var mechAniCalContainer;
    var mechAniCalCursorContainer;
    var dragging = false;
    var dx;
    var dy;
    var forwards;
    var frame_num = 0;
    var frames = [];
    var mouseover_counter;
    var rotating = false;
    var x_offset;
    var y_offset;
    var x_prev;

    var UPDATE_INTERVAL = 1000 / 5; // initial rotation speed in milliseconds per frame
    var UPDATE_INTERVAL_DRAG = 1000 / 20; // rotation speed after clicking the image in milliseconds per frame


    // Inline cursor styles: 
    var cursorDrag=' url("cursorImages/cuDrag.cur"), auto';
    var cursorReduce=' url("cursorImages/cuReduce.cur"), auto';
    var cursorOver=' url("cursorImages/cuOver.cur"), auto';
    var cursorZoomDrag=' url("cursorImages/cuZoomDrag.cur"), auto';

    var loadOrder = [
        "shoeImages/A.jpg",
        "shoeImages/I.jpg",
        "shoeImages/E.jpg",
        "shoeImages/M.jpg",
        "shoeImages/C.jpg",
        "shoeImages/K.jpg",
        "shoeImages/G.jpg",
        "shoeImages/O.jpg",
        "shoeImages/F.jpg",
        "shoeImages/N.jpg",
        "shoeImages/B.jpg",
        "shoeImages/J.jpg",
        "shoeImages/P.jpg",
        "shoeImages/H.jpg",
        "shoeImages/D.jpg",
        "shoeImages/L.jpg"
    ];

    function add_mod(value, delta, count) {
        var n = (value + delta) % count;
        return n < 0 ? count + n : n;
    }

    function animate(prev_time) {
        if (rotating){

            var time = +new Date();          // same as new Date().getTime()

            if (time > prev_time + UPDATE_INTERVAL) {
                frames[frame_num].style.display = "none";
                frame_num = add_mod(frame_num, forwards ? 1 : -1, frames.length);
                frames[frame_num].style.display = "";
                prev_time = time;
                rotating = !dragging;
            }
        }
        window.requestAnimationFrame(delay(animate, prev_time));
    }

    function css_class_exists(element, name) {
        return !!element.className.match("(?:\\s|^)" + name + "(?:\\s|$)");
    }

    function css_class_add(element, name) {
        if (!css_class_exists(element, name)) {
            element.className += " " + name;
        }
    }

    function css_class_remove(element, name) {
        if (css_class_exists(element, name)) {
            element.className = (element.className
                                 .split(" ")
                                 .filter(function (x) { return x.length > 0 && x != name })
                                 .join(" "));
        }
    }

    function delay(f) {
        var _arguments = Array.prototype.slice.call(arguments, 1);
        return function () { f.apply(window, _arguments) };
    }

    function event_bind(element, name, handler,capture) {
        //capture=true for capture phase listener, capture= false for bubble phase listener
        if (element.addEventListener) {
            element.addEventListener(name, handler, capture);
        } else if (element.attachEvent) {
            element.attachEvent("on" + name, handler);
        }
    }

    function event_unbind(element, name, handler,capture) {
        //capture=true for capture phase listener, capture= false for bubble phase listener
        if (element.removeEventListener) {
            element.removeEventListener(name, handler, capture);
        } else if (element.detachEvent) {
            element.detachEvent("on" + name, handler);
        }
    }

    function get_bounding_rect(e) {
        var r = e.getBoundingClientRect();

        if (typeof r.height == 'undefined'){
            r.height = r.bottom - r.top;
        }
        if (typeof r.width == 'undefined'){
            r.width = r.right - r.left;
        }
        return r;
    }

    function load_frame(index) {
        if (index < loadOrder.length) {
            var image = new Image();

            image.onload = function () {
                var count = frames.length;
                var path = this.src;

                // BEGIN--REMOVE FROM PRODUCTION CODE -- download indicator
                try {
                    var ul = document.getElementById("downloadIndicator");
                    var li = document.createElement("li");
                    li.innerHTML = path.replace(/^https?:\/\/(?:[^\/]+\/)*/, "").replace(/\..*$/, "");
                    ul.appendChild(li);
                }
                catch (_) {
                    // ignore
                }
                // END--REMOVE FROM PRODUCTION CODE

                // insert path in order
                for (var i = 0; i < count && frames[i].src < path; i++);
                frames.splice(i, 0, this);

                // make sure the current frame stays intact
                if (i <= frame_num && frame_num < count) {
                    frame_num++;
                }

                // insert element
                this.style.display = this === frames[frame_num] ? "" : "none";
                mechAniCalContainer.appendChild(this);

                // load next frame
                load_frame(index + 1);
            };
            image.src = loadOrder[index];
        }
        else if (auto_rotate) {
            // start rotation
            forwards = Math.random() < 0.5;
            rotating = true;
        }
    }

    function rotate_onmousedown(e) {
        event_bind(document,"mousemove",rotate_onmousemove,false);
        event_bind(document, "touchmove",rotate_ontouchmove,false);
        // event_bind(mechAniCalCursorContainer,"mousemove",rotate_onmousemove,false);
        // event_bind(mechAniCalCursorContainer, "touchmove",rotate_ontouchmove,false);
        if (!dragging) {
            var v = e || window.event;

            auto_rotate = false;
            click = true;
            dragging = true;
            rotating = false;
            UPDATE_INTERVAL = UPDATE_INTERVAL_DRAG; // Increase rotation speed for dragging

            x_offset = v.offsetX;
            y_offset = v.offsetY;
            x_prev = v.screenX;
        }
        return false;
    }

    function rotate_onmousemove(e) {
        if (e.preventDefault) e.preventDefault();

        if (dragging && frames.length > 0) {
            var v = e || window.event;

            var DELTA = 3; // minimal number of pixels that the mouse (finger) has to move
            var d = x_prev - v.screenX;

            if (Math.abs(d) > DELTA) {
                if (click) {

                    mechAniCalCursorContainer.style.cursor=cursorDrag; 
                    document.body.style.cursor=cursorDrag; 
                    click = false;
                }
                forwards = d < 0
                rotating = true;
                x_prev = v.screenX;
            }
        }
        return false;
    }

    function rotate_onmouseup() {
        event_unbind(document,"mousemove",rotate_onmousemove,false);
        event_unbind(document,"touchmove",rotate_ontouchmove,false);
        // event_unbind(mechAniCalCursorContainer,"mousemove",rotate_onmousemove,false);
        // event_unbind(mechAniCalCursorContainer,"touchmove",rotate_ontouchmove,false);

        if (dragging) {
            if (click) {
                var frame = frames[frame_num];
                var r_orig = get_bounding_rect(frame);

                frame.style.width = "auto";
                frame.style.height = "auto";

                var r = get_bounding_rect(frame);

                frame.client_width = r.width;
                frame.client_height = r.height;

                var dw = mechAniCalContainer.client_width - r.width;//mechAniCalContainer width minus big pic. width=left coord. of big pic.
                var dh = mechAniCalContainer.client_height - r.height;

                var dx = (x_offset - parseInt(frame.style.left + 0) - r_orig.width / 2); //old distance from cursor to center
                var dy = (y_offset - parseInt(frame.style.top + 0) - r_orig.height / 2);

                var cx = dw / 2 - dx * r.width / r_orig.width;//left coord. of big pic.-cursor coord. in big pic.
                var cy = dh / 2 - dy * r.height / r_orig.height;

                var x = Math.min(0, Math.max(dw, cx));
                var y = Math.min(0, Math.max(dh, cy));

                frame.style.left = x + "px";
                frame.style.top = y + "px";

                event_unbind(mechAniCalCursorContainer, "mousedown", rotate_onmousedown,false);
                event_unbind(document, "mouseup", rotate_onmouseup,false);

                event_bind(mechAniCalCursorContainer, "mousedown", zoom_onmousedown,false);
                event_bind(document, "mouseup", zoom_onmouseup,false);

                event_unbind(mechAniCalCursorContainer, "touchstart", rotate_ontouchstart,false);
                event_unbind(document, "touchend", rotate_ontouchend,false);

                event_bind(mechAniCalCursorContainer, "touchstart", zoom_ontouchstart,false);
                event_bind(document, "touchend", zoom_ontouchend,false);

                mechAniCalCursorContainer.style.cursor=cursorReduce; 
            } else {
                mechAniCalCursorContainer.style.cursor=cursorOver; 
                document.body.style.cursor='';
            }
            dragging = false;
            rotating = false;
        }
        return false;
    }

    function rotate_ontouchstart(e) {
        e.preventDefault();
        rotate_onmousedown(e.touches[0]);
    }

    function rotate_ontouchmove(e) {
        e.preventDefault();
        rotate_onmousemove(e.touches[0]);
    }

    function rotate_ontouchend(e) {
        e.preventDefault();
        rotate_onmouseup(e.touches[0]);
    }

    function zoom_onmousedown(e) {
        mouseover_counter=0;
        event_bind(document,"mousemove",zoom_onmousemove,false);
        event_bind(document,"touchmove",zoom_ontouchmove,false);
        // event_bind(mechAniCalCursorContainer,"mousemove",zoom_onmousemove,false);
        // event_bind(mechAniCalCursorContainer,"touchmove",zoom_ontouchmove,false);
 
        if (!dragging) {

            var v = e || window.event;
            var frame = frames[frame_num];

            click = true;
            dragging = true;
            dx = parseInt(frame.style.left + 0) - v.clientX;
            dy = parseInt(frame.style.top + 0) - v.clientY;
        }
        return false;
    }

    function zoom_onmousemove(e) {
        if (e.preventDefault) e.preventDefault();
        mouseover_counter=mouseover_counter+1; //counts mousemove events
        var mouseover_counter_rem=mouseover_counter%5; 

        if (dragging & mouseover_counter_rem===0) { //following code executes on every fifth mousmove event

            var v = e || window.event;
            var frame = frames[frame_num];
            var x = Math.min(0, Math.max(mechAniCalContainer.client_width - frame.client_width, dx + v.clientX));
            var y = Math.min(0, Math.max(mechAniCalContainer.client_height - frame.client_height, dy + v.clientY));

            frame.style.left = x + "px";
            frame.style.top = y + "px";

            if (click) {
                mechAniCalCursorContainer.style.cursor=cursorZoomDrag; 
                document.body.style.cursor=cursorZoomDrag; 
                click = false;
            }
            return false;
        }
    }

    function zoom_onmouseup() {
        event_unbind(document,"mousemove",zoom_onmousemove,false);
        event_unbind(document,"touchmove",zoom_ontouchmove,false);
        // event_unbind(mechAniCalCursorContainer,"mousemove",zoom_onmousemove,false);
        // event_unbind(mechAniCalCursorContainer,"touchmove",zoom_ontouchmove,false);

        if (dragging) {

            if (click) {

                var frame = frames[frame_num];

                frame.style.width = "";
                frame.style.height = "";
                frame.style.left = "";
                frame.style.top = "";

                event_unbind(mechAniCalCursorContainer, "mousedown", zoom_onmousedown,false);
                event_unbind(document, "mouseup", zoom_onmouseup,false);

                event_bind(mechAniCalCursorContainer, "mousedown", rotate_onmousedown,false);
                event_bind(document, "mouseup", rotate_onmouseup,false);

                event_unbind(mechAniCalCursorContainer, "touchstart", zoom_ontouchstart,false);
                event_unbind(document, "touchend", zoom_ontouchend,false);

                event_bind(mechAniCalCursorContainer, "touchstart", rotate_ontouchstart,false);
                event_bind(document, "touchend", rotate_ontouchend,false);

                mechAniCalCursorContainer.style.cursor=cursorOver; 

        //mechAniCalContainer.style.cursor=cursorOver; //new addition
        // frame.style.cursor=cursorOver; //new addition
        // mechAniCalContainer.img.style.cursor=cursorOver; //new addition
        // document.getElementById("mechAncileryImages").style.cursor=cursorOver;//new addition
        // document.body.style.cursor=cursorOver;//new addition

            }
            else {
                mechAniCalCursorContainer.style.cursor=cursorReduce; 
                document.body.style.cursor=''; 
            }
            dragging = false;
        }
        return false;
    }

    function zoom_ontouchstart(e) {
        e.preventDefault();
        zoom_onmousedown(e.touches[0]);
    }

    function zoom_ontouchmove(e) {
        e.preventDefault();
        zoom_onmousemove(e.touches[0]);
    }

    function zoom_ontouchend(e) {
        e.preventDefault();
        zoom_onmouseup(e.touches[0]);
    }

    window.onload = function () {

        mechAniCalContainer = document.getElementById("mechAnimationContainer");
        mechAniCalCursorContainer = document.getElementById("mechBoundingBox"); // cursor is attached to the parent div of the picture

        var r = get_bounding_rect(mechAniCalContainer);

        mechAniCalContainer.client_width = r.width;
        mechAniCalContainer.client_height = r.height;

        event_bind(mechAniCalCursorContainer, "mousedown", rotate_onmousedown,false);
        event_bind(document, "mouseup", rotate_onmouseup,false);

        event_bind(mechAniCalCursorContainer, "touchstart", rotate_ontouchstart,false);
        event_bind(document, "touchend", rotate_ontouchend,false);

        // remove existing elements
        while (mechAniCalContainer.hasChildNodes()) {
            mechAniCalContainer.removeChild(mechAniCalContainer.firstChild);
        }

        cursor_box = document.getElementById("cursorBox");

        load_frame(0);

        mechAniCalCursorContainer.style.cursor=cursorOver;
        //??document.body.style.cursor=cursorOver; 
try {
    document.execCommand('BackgroundImageCache', false, true);
} 
catch (e) {}

        // start animation loop
        window.requestAnimationFrame(delay(animate, +new Date()));        
        //animate(+new Date());
    };

})(window);