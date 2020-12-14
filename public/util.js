import * as THREE from './js/src/Three.js';
// Helper functions
const rgb = function(r, g, b) {
    return new THREE.Vector3(r, g, b);
}
const loader = function(path, texture) {
    return new Promise((resolve, reject) => {
        let loader = new THREE.FileLoader();
        if(typeof texture !== "undefined") {
            loader = new THREE.TextureLoader();
        }
        loader.load(path, (item) => resolve(item));
    })
}
const randomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// -- End Helper Functions

export { rgb, loader, randomInteger }