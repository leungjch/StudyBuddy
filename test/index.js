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
    this.rects = [];
    this.renderedRects = [];
  }

  getDimensions() {
    let canvas = document.getElementById(this.canvas_id);
    return { width: canvas.offsetWidth, height: canvas.offsetHeight };
  }

  showRects(rects) {
    this.clear();
    let canvas = document.getElementById(this.canvas_id);
    let ctx = canvas.getContext("2d");
    console.log(rects);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (rect.value) {
        console.log(rect);
        let text = document.createElement("div");
        text.style.position = "absolute";
        text.style.zIndex = 8;
        text.innerHTML = rect.value;
        text.style.left = rect.x + canvas.getBoundingClientRect().left + "px";
        text.style.top = rect.y + canvas.getBoundingClientRect().top + "px";
        text.style.textAlign = "center";
        text.style.color = "transparent";

        text.style.fontSize = `${rect.height}px`;
        document.body.appendChild(text);
        this.renderedRects.push(text);
      }
      ctx.fillStyle = "rgba(129, 207, 224, 0.4)";

      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    this.rects = rects;
  }

  clear() {
    this.renderedRects.forEach((val) => {
      document.body.removeChild(val);
    });
    this.renderedRects = [];
    this.rects = [];
    this.selectedRect = new Rect(0, 0, 0, 0);
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
      // this.rects = [];
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

async function getAPI(data, canvas) {
  data = data.substr(22);
  let res = await fetch("http://localhost:8000/process", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageData: data }),
  });
  const content = await res.json();
  console.log("Request completed with: ", content);
  return content;
}

function main() {
  var cursorLayer = document.createElement("canvas");
  cursorLayer.id = "CursorLayer";
  cursorLayer.style.zIndex = 8;
  cursorLayer.style.position = "absolute";
  cursorLayer.style.pointerEvents = "none";
  cursorLayer.style.cursor = "text";
  // cursorLayer.style.backgroundColor = "red";
  document.body.appendChild(cursorLayer);

  var ghost = document.createElement("canvas");
  ghost.id = "ghost";
  ghost.style.position = "absolute";
  //   ghost.style.opacity = "0";
  document.body.appendChild(ghost);

  let video = document.querySelector("video");

  let canvas = new Canvas("CursorLayer", (r) => {
    console.log(r);
  });
  resize_canvas(video);
  document.addEventListener("mousedown", function (e) {
    // canvas.startSelection(e);
  });
  document.addEventListener("mouseup", function (e) {
    canvas.endSelection(e);
  });
  document.addEventListener("mousemove", function (e) {
    canvas.whileSelecting(e);
  });

  setInterval(async function () {
    let video = document.querySelector("video");
    let stream = video.captureStream();
    let imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
    let frame = await imageCapture.grabFrame();

    var offScreenCanvas = document.getElementById("ghost");
    var context = offScreenCanvas.getContext("bitmaprenderer");
    //   context.drawImage(frame, 0, 0, offScreenCanvas.width, offScreenCanvas.height);
    const [frameWidth, frameHeight] = [frame.width, frame.height];
    context.transferFromImageBitmap(frame);
    var dataURL = offScreenCanvas.toDataURL();
    console.log(dataURL);
    var selectedRects = [];
    let response = await getAPI(dataURL, canvas);
    response.lines.forEach((line) => {
      const boundaryBox = line.bounding_box;
      const { width, height } = canvas.getDimensions();
      console.log(width, height, frameWidth, frameHeight);
      const wScale = width / frameWidth;
      const hScale = height / frameHeight;
      selectedRects.push(
        new Rect(
          Math.round(boundaryBox.x * wScale),
          Math.round(boundaryBox.y * hScale),
          boundaryBox.width * wScale,
          boundaryBox.height * hScale,
          line.text
        )
      );
    });

    canvas.showRects(selectedRects);
    //   console.log(dataURL);
    //   var myData = context.getImageData(0, 0, frame.width, frame.height);

    //   console.log(myData, myData.data.size);
  }, 5000);
}

window.addEventListener("DOMContentLoaded", () => {
  main();
});

window.onresize = () => {
  let video = document.querySelector("video");
  resize_canvas(video);
};
