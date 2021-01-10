/**
 * (Async) Loads an external text file.
 * @param url {string} The URL of the text file to load.
 * @returns {Promise<string>} The contents of this file
 */
export async function loadTextFile(url) {
    const response = await fetch(url);
    return response.text();
}