/**
 * Clamps a value between a minimum and maximum.
 * @param {number} val The value to clamp
 * @param {number} min The minimum acceptable value
 * @param {number} max The maximum acceptable value
 */
export function clamp(val, min, max) {
    if (val < min) {
        return min;
    }

    if (val > max) {
        return max;
    }

    return val;
}

/**
 * (Async) Loads an external text file.
 * @param url {string} The URL of the text file to load.
 * @returns {Promise<string>} The contents of this file
 */
export async function getTextFile(url) {
    const response = await fetch(url);
    return response.text();
}

/**
 * (Async) Loads an external image file.
 * @param url {string} The URL of the image file to load.
 * @returns {Promise<HTMLImageElement>} The loaded image
 */
export function getImageFile(url) {
    return new Promise(((resolve, reject) => {
        let image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Could not load image from '${url}'`));
    }));
}
