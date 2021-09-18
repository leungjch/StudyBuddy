

function getFrame() {
    stream = document.querySelector("video").captureStream()
    let imageCapture = new ImageCapture(stream.getVideoTracks()[0])
    imageCapture.grabFrame((frame)=> {
        console.log(frame) // Frame is an ImageBitmap
    })
}