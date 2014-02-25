/* -*- mode:javascript; coding:utf-8; -*- Time-stamp: <script.js - akonsu> */

//
// fix window.requestAnimationFrame
//



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
    var container;
    var container_cursor;
    var cursor_box;
    var cursor_drag;
    var cursor_over;
    var cursor_reduce;
    var cursor_zoom_drag;
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
    var UPDATE_INTERVAL_DRAG = 1000 / 20; // rotation speed after clicking the image


    // Inline cursor styles: 
    var cursorDrag=' url("cursorImages/cuDrag1.cur"), auto';
    var cursorReduce=' url("cursorImages/cuReduce1.cur"), auto';
    var cursorOver=' url("cursorImages/cuOver1.cur"), auto';
    var cursorZoomDrag=' url("cursorImages/cuZoomDrag1.cur"), auto';

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

    function event_bind(element, name, handler) {
        if (element.addEventListener) {
            element.addEventListener(name, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + name, handler);
        }
    }

    function event_unbind(element, name, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(name, handler, false);
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

    function custom_cursor(cursor_id, cursor_src,display){
        cursor_box = document.getElementById("cursorBox");
        var cursor = new Image();
        // var cursor_over = new Image();
        // var cursor_reduce = new Image();
        // var cursor_zoom_drag = new Image();

        cursor.onload = function(){ 
            this.id=cursor_id;
            this.style.display=display;
            cursor_box.appendChild(this);}
        // cursor_over.onload = 
        // cursor_reduce.onload = 
        // cursor_zoom_drag.onload = 
        cursor.src=cursor_src;
        return document.getElementById(cursor_id);
    }

    function load_frame(index) {
        if (index < loadOrder.length) {
            var image = new Image();

            image.onload = function () {
                var count = frames.length;
                var path = this.src;

                // BEGIN--REMOVE FROM PRODUCTION CODE
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
                container.appendChild(this);

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
        if (dragging && frames.length > 0) {
            var v = e || window.event;

            var DELTA = 3; // minimal number of pixels that the mouse (a finger) has to move
            var d = x_prev - v.screenX;

            if (Math.abs(d) > DELTA) {
                if (click) {



                container_cursor.style.cursor=cursorDrag; //???

                // css_class_add(document.body, "cursor-drag");
                // css_class_remove(container, "cursor-over");
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
        if (dragging) {
            if (click) {
                var frame = frames[frame_num];
                var r_orig = get_bounding_rect(frame);
                console.log("r_orig=",r_orig);

                frame.style.width = "auto";
                frame.style.height = "auto";

                var r = get_bounding_rect(frame);
                console.log("r",r);

                frame.client_width = r.width;
                frame.client_height = r.height;

                var dw = container.client_width - r.width;//container width minus big pic. width=left coord. of big pic.
                var dh = container.client_height - r.height;
                console.log("dw=", dw, "container.client_width=",container.client_width, "r.width=",r.width, 
                    "dh=",dh, "container.client_height=",container.client_height, "r.height=",r.height);

                var dx = (x_offset - parseInt(frame.style.left + 0) - r_orig.width / 2); //old distance from cursor to center
                var dy = (y_offset - parseInt(frame.style.top + 0) - r_orig.height / 2);

                var cx = dw / 2 - dx * r.width / r_orig.width;//left coord. of big pic.-cursor coord. in big pic.
                var cy = dh / 2 - dy * r.height / r_orig.height;

                var x = Math.min(0, Math.max(dw, cx));
                var y = Math.min(0, Math.max(dh, cy));

                frame.style.left = x + "px";
                frame.style.top = y + "px";

                container_cursor.onmousedown = zoom_onmousedown;
                document.onmousemove = zoom_onmousemove; 
                document.onmouseup = zoom_onmouseup;

                event_unbind(container_cursor, "touchstart", rotate_ontouchstart);
                event_unbind(container_cursor, "touchmove", rotate_ontouchmove);
                event_unbind(container_cursor, "touchend", rotate_ontouchend);

                event_bind(container_cursor, "touchstart", zoom_ontouchstart);
                event_bind(container_cursor, "touchmove", zoom_ontouchmove);
                event_bind(container_cursor, "touchend", zoom_ontouchend);

                container_cursor.style.cursor=cursorReduce; //???
                //container_cursor.style.cursor='crosshair';

                 // css_class_add(container, "cursor-reduce");
                 // css_class_remove(container, "cursor-over");
            } else {
                container_cursor.style.cursor=cursorOver; //???
                 // css_class_add(container, "cursor-over");
                 // css_class_remove(document.body, "cursor-drag");
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
        console.log("zoom_onmousedown entered");
        mouseover_counter=0;
        
        if (!dragging) {
        console.log("zoom_onmousedown !dragging entered");

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
        console.log("zoom_onmousemove entered");

        mouseover_counter=mouseover_counter+1; //new addition
        var mouseover_counter_rem=mouseover_counter%5; //new addition

        if (dragging & mouseover_counter_rem===0) { //new addition

        console.log("zoom_onmousemove dragging entered mouseover_counter=", mouseover_counter, "mouseover_counter_rem=", 
            mouseover_counter_rem);

            var v = e || window.event;
            var frame = frames[frame_num];
            var x = Math.min(0, Math.max(container.client_width - frame.client_width, dx + v.clientX));
            var y = Math.min(0, Math.max(container.client_height - frame.client_height, dy + v.clientY));

            frame.style.left = x + "px";
            frame.style.top = y + "px";

            if (click) {
                container_cursor.style.cursor=cursorZoomDrag; //???
                //  css_class_add(document.body, "cursor-zoom-drag");
                //  css_class_remove(container, "cursor-reduce");
                click = false;
            }
            return false;
        }
    }

    function zoom_onmouseup() {
        console.log("zoom_onmouseup entered");

        if (dragging) {
        console.log("zoom_onmouseup dragging entered");

            if (click) {
        console.log("zoom_onmouseup click entered");

                var frame = frames[frame_num];

                frame.style.left = "";
                frame.style.top = "";
                frame.style.width = "";
                frame.style.height = "";

                container_cursor.onmousedown = rotate_onmousedown;
                document.onmousemove = rotate_onmousemove;
                document.onmouseup = rotate_onmouseup;

                event_unbind(container_cursor, "touchstart", zoom_ontouchstart);
                event_unbind(container_cursor, "touchmove", zoom_ontouchmove);
                event_unbind(container_cursor, "touchend", zoom_ontouchend);

                event_bind(container_cursor, "touchstart", rotate_ontouchstart);
                event_bind(container_cursor, "touchmove", rotate_ontouchmove);
                event_bind(container_cursor, "touchend", rotate_ontouchend);

                //container_cursor.style.cursor='help';
                container_cursor.style.cursor=cursorOver; //???
                //'url("cursorImages/cursorImagesTest/cuOver1.cur"), auto'

                // css_class_add(container, "cursor-over");
                // css_class_remove(container, "cursor-reduce");
            }
            else {
                container_cursor.style.cursor=cursorReduce; //???

                //'url("cursorImages/cursorImagesTest/cuReduce1.cur"), auto'

                // css_class_add(container, "cursor-reduce");
                // css_class_remove(document.body, "cursor-zoom-drag");
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
        container = document.getElementById("mechAnimationContainer");
        container_cursor = document.getElementById("mechBoundingBox"); // cursor is attached to the parent div of the picture

        var r = get_bounding_rect(container);

        container.client_width = r.width;
        container.client_height = r.height;
        console.log("r.width=",r.width,"r.height",r.height);

        container_cursor.onmousedown = rotate_onmousedown;
        document.onmousemove = rotate_onmousemove;
        document.onmouseup = rotate_onmouseup;

        // event_bind(container_cursor,"mousedown",rotate_onmousedown);
        // //event_bind(container_cursor,"mousemove",rotate_onmousemove);
        // event_bind(document,"mouseup",rotate_onmouseup);

        event_bind(container_cursor, "touchstart", rotate_ontouchstart);
        event_bind(container_cursor, "touchmove", rotate_ontouchmove);
        event_bind(container_cursor, "touchend", rotate_ontouchend);

        // remove existing elements
        while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
        }

        var cursors={
            "cursor_drag": {"element_id": "cursor-drag", "element_src": "cursorImages/cuDrag.ico", "initial_style": "none"},
            "cursor_over": {"element_id": "cursor-over", "element_src": "cursorImages/cuOver.ico", "initial_style": ""},
            "cursor_reduce": {"element_id": "cursor-reduce", "element_src": "cursorImages/cuReduce.ico", "initial_style": "none"},
            "cursor_zoom_drag": {"element_id": "cursor-zoom_drag", "element_src": "cursorImages/cuZoomDrag.ico", "initial_style": "none"}
        };

        // var cursor_names=["cursor_drag","cursor_over","cursor_reduce","cursor_zoom_drag"];
        // var cursor_ids=["cursor-drag","cursor-over","cursor-reduce","cursor-zoom-drag"];
        // var cursor_srcs=["cursorImages/cuDrag.ico","cursorImages/cuOver.ico","cursorImages/cuReduce.ico","cursorImages/cuZoomDrag.ico"]
        // var cursor_styles=["none"," ","none","none"]

        for (var name in cursors) {
        custom_cursor(cursors[name].element_id,cursors[name].element_src,cursors[name].initial_style);           
        };

        // cursor_drag=document.getElementById("cursor-drag")
        // cursor_over=document.getElementById("cursor-over")
        // cursor_reduce=document.getElementById
        // cursor_zoom_drag=document.getElementById

        load_frame(0);

        // var cursor_over=document.getElementById("cursor-over");
        // console.log("cursor_over=", cursor_over);
        // cursor_over.style.display="";
        //container_cursor.style.cursor=cursorOver; //???
        //'url("cursorImages/cursorImagesTest/cuOver1.cur"), auto'

        //css_class_add(container, "cursor-over");

try {
    document.execCommand('BackgroundImageCache', false, true);
} 
catch (e) {}

        // start animation loop
        animate(+new Date());
    };
})(window);