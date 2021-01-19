# Animation Demo

This demo shows how to animate objects on the screen. Here, a square rebounds between the left and right screen edges.

## Implementation Notes

Implementing this requires JavaScript code, not WebGL code. The idea is that we ask the browser to re-draw the scene each time the model updates. Some places suggest `setInterval` / `setTimeout`, but this ties the model update speed to how fast the browser calls the "redraw" function, which is not good!

The real solution is to use `requestAnimationFrame`, which takes in a function that has a timestamp parameter:

```js
function drawScene(timestamp) {
  // .. draw scene using timestamp ..
}

window.requestAnimationFrame(drawScene);

// Use this if there's more than one parameter
window.requestAnimationFrame((time) => drawScene(time, otherParams));
```

For as long as we update the model using the elapsed time, the update speed won't matter as much, even if it appears laggy when the browser can't keep up.
