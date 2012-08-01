/* -*- mode:javascript; coding:utf-8; -*- Time-stamp: <script.js - root> */

//
// fix window.requestAnimationFrame
//
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (window.webkitRequestAnimationFrame
                                    || window.mozRequestAnimationFrame
                                    || window.oRequestAnimationFrame
                                    || window.msRequestAnimationFrame
                                    || function (callback) { window.setTimeout(callback, 1000 / 60) });
}

function add_mod(value, delta, count) {
    var n = (value + delta) % count;
    return n < 0 ? count + n : n;
}

function delay(f) {
    var _arguments = Array.prototype.slice.call(arguments, 1);
    return function () { f.apply(window, _arguments) };
}

(function (window) {
    var click;
    var container;
    var dragging = false;
    var dx;
    var dy;
    var forwards;
    var frame_num = 0;
    var frames = [];
    var rotating;
    var x_prev;

    var loadOrder = [
        "shoeImages/A.png",
        "shoeImages/I.png",
        "shoeImages/E.png",
        "shoeImages/M.png",
        "shoeImages/C.png",
        "shoeImages/K.png",
        "shoeImages/G.png",
        "shoeImages/O.png",
        "shoeImages/F.png",
        "shoeImages/N.png",
        "shoeImages/B.png",
        "shoeImages/J.png",
        "shoeImages/P.png",
        "shoeImages/H.png",
        "shoeImages/D.png",
        "shoeImages/L.png"
    ];

    function animate(prev_time) {
        if (rotating){
            var UPDATE_INTERVAL = 1000 / 20; // rotation speed in milliseconds per frame
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
    }

    function rotate_onmousedown(e) {
        if (!dragging) {
            var v = e || window.event;

            click = true;
            dragging = true;
            rotating = false;
            x_prev = v.screenX;
        }
        return false;
    }

    function rotate_onmousemove(e) {
        if (dragging && frames.length > 0) {
            var v = e || window.event;

            click = false;
            forwards = x_prev < v.screenX
            rotating = true;
            x_prev = v.screenX;
        }
        return false;
    }

    function rotate_onmouseup() {
        if (dragging) {
            if (click) {
                var frame = frames[frame_num];

                frame.style.width = "auto";
                frame.style.height = "auto";

                var r = frame.getBoundingClientRect();

                frame.client_width = r.right - r.left;
                frame.client_height = r.bottom - r.top;

                var x = (container.client_width - frame.client_width) / 2;
                var y = (container.client_height - frame.client_height) / 2;

                frame.style.left = x + "px";
                frame.style.top = y + "px";

                container.onmousedown = zoom_onmousedown;
                document.onmousemove = zoom_onmousemove;
                document.onmouseup = zoom_onmouseup;
            }
            dragging = false;
            rotating = false;
        }
        return false;
    }

    function zoom_onmousedown(e) {
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
        if (dragging) {
            var v = e || window.event;
            var frame = frames[frame_num];
            var x = Math.min(0, Math.max(container.client_width - frame.client_width, dx + v.clientX));
            var y = Math.min(0, Math.max(container.client_height - frame.client_height, dy + v.clientY));

            frame.style.left = x + "px";
            frame.style.top = y + "px";
            click = false;
        }
        return false;
    }

    function zoom_onmouseup() {
        if (dragging) {
            if (click) {
                var frame = frames[frame_num];

                frame.style.left = "";
                frame.style.top = "";
                frame.style.width = "";
                frame.style.height = "";

                container.onmousedown = rotate_onmousedown;
                document.onmousemove = rotate_onmousemove;
                document.onmouseup = rotate_onmouseup;
            }
            dragging = false;
        }
        return false;
    }

    window.onload = function () {
        container = document.getElementById("container");

        var r = container.getBoundingClientRect();

        container.client_width = r.right - r.left;
        container.client_height = r.bottom - r.top;

        container.onmousedown = rotate_onmousedown;
        document.onmousemove = rotate_onmousemove;
        document.onmouseup = rotate_onmouseup;

        // remove existing elements
        while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
        }
        load_frame(0);

        // start rotation
        forwards = Math.random() < 0.5;
        rotating = true;
        animate(+new Date());
    };
})(window);
