// working on webpage
// TODO: make it work on extension

setInterval(async function () {
    let video = document.querySelector("video");
    let stream = video.captureStream();
    let imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
    let frame = await imageCapture.grabFrame();
  
    var offScreenCanvas = document.getElementById("ghost");
  
    var context = offScreenCanvas.getContext("bitmaprenderer");
    //   context.drawImage(frame, 0, 0, offScreenCanvas.width, offScreenCanvas.height);
    context.transferFromImageBitmap(frame);
    var dataURL = offScreenCanvas.toDataURL();
    //   console.log(dataURL);
    //   var myData = context.getImageData(0, 0, frame.width, frame.height);
  
    //   console.log(myData, myData.data.size);
  }, 3000);
  
  class Rect {
    constructor(x, y, width, height, value = null) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.value = value;
    }
  }
  
  class Canvas {
    constructor(canvas_id, onSelected) {
      this.canvas_id = canvas_id;
      this.selecting = false;
      this.start_coord = { x: 0, y: 0 };
      this.onSelected = onSelected;
  
      this.selectedRect = new Rect(0, 0, 0, 0);
      this.wordBounds = [];
    }
  
    showRects(rects) {
      let canvas = document.getElementById(this.canvas_id);
      let ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < rects.length; i++) {
        let rect = rects[i];
        if (rect.value) {
          let text = document.createElement("div");
          text.style.position = "absolute";
          text.style.zIndex = 8;
          text.innerHTML = rect.value;
          text.style.left = canvas.getBoundingClientRect().left + rect.x + "px";
          text.style.top = canvas.getBoundingClientRect().top + rect.y + "px";
          text.style.textAlign = "center";
          text.style.color = "transparent";
  
          text.style.fontSize = `${rect.height}px`;
          document.body.appendChild(text);
        }
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }
    }
  
    startSelection(event) {
      this.selecting = true;
      let canvas = document.getElementById(this.canvas_id);
      this.start_coord.x = event.clientX - canvas.getBoundingClientRect().left;
      this.start_coord.y = event.clientY - canvas.getBoundingClientRect().top;
    }
  
    whileSelecting(event) {
      if (!this.selecting) return;
      let canvas = document.getElementById(this.canvas_id);
      let ctx = canvas.getContext("2d");
      canvas.style.pointerEvents = "auto";
  
      let width = event.clientX - canvas.getBoundingClientRect().left - this.start_coord.x;
      let height = event.clientY - canvas.getBoundingClientRect().top - this.start_coord.y;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(129, 207, 224, 0.4)";
      ctx.fillRect(this.start_coord.x, this.start_coord.y, width, height);
    }
  
    endSelection(event) {
      this.selecting = false;
      let canvas = document.getElementById(this.canvas_id);
      canvas.style.pointerEvents = "none";
  
      let ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      let width = event.clientX - canvas.getBoundingClientRect().left - this.start_coord.x;
      let height = event.clientY - canvas.getBoundingClientRect().top - this.start_coord.y;
  
      // Error margin (for clicks)
      if ((-5 < width && width < 5) || (-5 < height && height < 5)) {
        this.selectedRect = new Rect(0, 0, 0, 0);
        return;
      }
  
      this.selectedRect = new Rect(this.start_coord.x, this.start_coord.y, width, height);
      this.onSelected(this.selectedRect);
    }
  }
  
  function resize_canvas(element) {
    var cv = document.getElementById("CursorLayer");
    cv.width = element.offsetWidth;
    cv.height = element.offsetHeight;
    cv.style.top = `${element.offsetTop}px`;
    cv.style.left = `${element.offsetLeft}px`;
  }
  
  function main() {
    var cursorLayer = document.createElement("canvas");
    cursorLayer.id = "CursorLayer";
    cursorLayer.style.zIndex = 8;
    cursorLayer.style.position = "absolute";
    cursorLayer.style.pointerEvents = "none";
    cursorLayer.style.cursor = "text";
    document.body.appendChild(cursorLayer);
  
    var ghost = document.createElement("canvas");
    ghost.id = "ghost";
    ghost.style.position = "absolute";
    //   ghost.style.opacity = "0";
    document.body.appendChild(ghost);
  
    let video = document.querySelector("video");
    resize_canvas(video);
  
    let canvas = new Canvas("CursorLayer", (r) => {
      console.log(r);
    });
    document.addEventListener("mousedown", function (e) {
      canvas.startSelection(e);
    });
    document.addEventListener("mouseup", function (e) {
      canvas.endSelection(e);
  
      canvas.showRects([
        new Rect(125, 90, 125, 17, "Presenting Code"),
        new Rect(145, 110, 80, 17, "Jens Weller"),
        new Rect(135, 125, 100, 17, "Meeting C++"),
        new Rect(140, 145, 100, 17, "@meetingcpp"),
      ]);
    });
    document.addEventListener("mousemove", function (e) {
      canvas.whileSelecting(e);
    });
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    main();
  });
  
  window.onresize = () => {
    let video = document.querySelector("video");
    resize_canvas(video);
  };