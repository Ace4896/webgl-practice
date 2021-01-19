# Keyboard Input Demo

This demo shows how to process inputs from the canvas. Use the arrow keys to move the square around the area.

## Implementation Notes

- The vertex shader was modified so that it takes in a pixel in the range `(-width, -height) -> (width, height)` (mostly to make the maths easier).
- The canvas needs to have a `tabindex` of 0 or more, otherwise it can't receive keyboard inputs.
- Only one key can be handled at a time (i.e. can't move the square diagonally). There's probably a way around this though (e.g. animation frames).
