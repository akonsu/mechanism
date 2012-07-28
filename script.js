/* -*- mode:javascript; coding:utf-8; -*- Time-stamp: <script.js - root> */

function add_mod(value, delta, count) {
    var n = (value + delta) % count;
    return n < 0 ? count + n : n;
}

(function (window) {
    var click;
    var dragging = false;
    var dx;
    var dy;
    var frame_num = 0;
    var frame_prev;
    var frames = [];
    var rotimation;
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

    function load_frame(index) {
        if (index < loadOrder.length) {
            var image = new Image();

            image.onload = function () {
                var count = frames.length;
                var path = this.src;

                // BEGIN--REMOVE FROM PRODUCTION CODE
                var ul = document.getElementById("downloadIndicator");
                var li = document.createElement("li");
                li.innerHTML = path.replace(/^https?:\/\/(?:[^\/]+\/)*/, "").replace(/\..*$/, "");
                ul.appendChild(li);
                // END--REMOVE FROM PRODUCTION CODE

                // insert path in order
                for (var i = 0; i < count && frames[i] < path; i++);
                frames.splice(i, 0, path);

                // make sure the current frame stays intact
                if (i <= frame_num && frame_num < count) {
                    frame_num++;
                }
                if (!rotimation.src) {
                    rotimation.src = path;
                }

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

            frame_prev = frame_num;
            x_prev = v.screenX;

            return false;
        }
    }

    function rotate_onmousemove(e) {
        if (dragging && frames.length > 0) {
            var v = e || window.event;
            var d = v.screenX - x_prev;

            if (Math.abs(d) > 0) {
                frame_num = add_mod(frame_prev, d ? d > 0 ? 1 : -1 : 0, frames.length);
                rotimation.src = frames[frame_num];
                frame_prev = frame_num;
                x_prev = v.screenX;
            }
            click = false;
            return false;
        }
    }

    function rotate_onmouseup() {
        if (dragging) {
            if (click) {
                rotimation.left_orig = rotimation.style.left;
                rotimation.top_orig = rotimation.style.top;
                rotimation.width_orig = rotimation.style.width;

                rotimation.style.width = "auto";

                rotimation.onmousedown = zoom_onmousedown;
                document.onmousemove = zoom_onmousemove;
                document.onmouseup = zoom_onmouseup;
            }
            dragging = false;
            return false;
        }
    }

    function zoom_onmousedown(e) {
        if (!dragging) {
            var v = e || window.event;

            click = true;
            dragging = true;

            dx = parseInt(this.style.left + 0) - v.clientX;
            dy = parseInt(this.style.top + 0) - v.clientY;

            return false;
        }
    }

    function zoom_onmousemove(e) {
        if (dragging) {
            var v = e || window.event;

            var container = rotimation.parentNode;
            var r0 = container.getBoundingClientRect();
            var r1 = rotimation.getBoundingClientRect();

            var W = r0.right - r0.left;
            var H = r0.bottom - r0.top;
            var w = r1.right - r1.left;
            var h = r1.bottom - r1.top;

            var x = Math.min(0, Math.max(W - w, dx + v.clientX));
            var y = Math.min(0, Math.max(H - h, dy + v.clientY));

            rotimation.style.left = x + "px";
            rotimation.style.top = y + "px";

            click = false;
            return false;
        }
    }

    function zoom_onmouseup() {
        if (dragging) {
            if (click) {
                rotimation.style.left = rotimation.left_orig;
                rotimation.style.top = rotimation.top_orig;
                rotimation.style.width = rotimation.width_orig;

                rotimation.onmousedown = rotate_onmousedown;
                document.onmousemove = rotate_onmousemove;
                document.onmouseup = rotate_onmouseup;
            }
            dragging = false;
            return false;
        }
    }

    window.onload = function () {
        rotimation = document.getElementById("rotimation");
        rotimation.onmousedown = rotate_onmousedown;
        document.onmousemove = rotate_onmousemove;
        document.onmouseup = rotate_onmouseup;
        load_frame(0);
    };
})(window);
