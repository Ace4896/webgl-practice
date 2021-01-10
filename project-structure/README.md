# WebGL 2 Project Structure

This folder contains a basic project structure to quickly get started with using WebGL 2. I've tried to use as many modern features as possible to make things easier.

- `3rdparty`: Contains various 3rd-party libraries.
  - `gl-matrix-min.js`: The [`glMatrix`](http://glmatrix.net/) library.
- `modules`: Contains various ES6 modules.
  - `misc-utils.js`: Anything re-usable that doesn't fit anywhere else.
  - `webgl-utils.js`: Anything related to setting up and using WebGL 2.
- `shaders`: Contains any shaders I'll be using.
- `main.js`: The main script to actually run the program.

## Usage

Loading the file locally will not work (a CORS error will occur) - a server is required.

Since this is only for development, Python's `http.server` can be used to serve the website:

```bash
python3 -m http.server
```

## Notes

- Use full relative path names when trying to access external files (i.e. include the `.` where necessary). I noticed that it doesn't load in WebStorm's previewer if the `.` prefix is missing.
