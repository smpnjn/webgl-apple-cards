import * as THREE from './js/src/Three.js';
import { rgb, loader, randomInteger } from './util.js';

const config = {
    individualItem: '.album-item', // class of individual item
    carouselWidth: 1000, // in px
    carouselId: '#album-rotator', // carousel selector
    carouselHolderId: '#album-rotator-holder', // carousel should be <div id="carouselId"><div id="carouselHolderId">{items}</div></div>
    colors: [
        // Define colors for each item. If more items than colors, then first color will be used as default
        // Format { low: rgb(), high: rgb() for each color }
        { low: rgb(0, 114, 255), high: rgb(48, 0, 255) },
        { low: rgb(236, 166, 15), high: rgb(233, 104, 0) },
        { low: rgb(43, 75, 235), high: rgb(213, 51, 248) },
        { low: rgb(175, 49, 49), high: rgb(123, 16, 16) }
    ]
}

// Async function for generating webGL waves
const createWave = async function(selector, colors) {      
    if(document.querySelectorAll(selector) !== null && document.querySelectorAll(selector).length > 0) {
        // Import all the fragment and vertex shaders
        const noise = await loader('/shaders/noise.glsl');
        const fragment = await loader('/shaders/fragment.glsl');
        const vertex = await loader('/shaders/vertex.glsl');
        let i = 0;
        // For each of the selector elements
        document.querySelectorAll(selector).forEach(function(item) {
            // Create a renderer
            const renderer = new THREE.WebGLRenderer({
                powerPreference: "high-performance",
                antialias: true, 
                alpha: true
            });

            // Get el width and height
            const elWidth = parseFloat(window.getComputedStyle(item).width);
            const elHeight = parseFloat(window.getComputedStyle(item).height);

            // Set sizes and set scene/camera
            renderer.setSize( elWidth, elHeight );
            document.body.appendChild( renderer.domElement )
            renderer.setPixelRatio( window.devicePixelRatio );

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera( 75, elWidth / elHeight, 0.1, 1000 );

            // Check on colors to use
            let high = colors[0].high; 
            let low = colors[0].low;
            if(typeof colors[i] !== "undefined") {
                high = colors[i].high;
                low = colors[i].low;
                ++i;
            }

            // And use the high color for the subtext.
            if(item.querySelector('.subtext') !== null) {
                item.querySelector('.subtext').style.background = `rgba(${high.x},${high.y},${high.z},0.75)`;
            }

            // Create a plane, and pass that through to our shaders
            let geometry = new THREE.PlaneGeometry(600, 600, 100, 100);
            let material = new THREE.ShaderMaterial({
                uniforms: {
                    u_lowColor: {type: 'v3', value: low },
                    u_highColor: {type: 'v3', value: high },
                    u_time: {type: 'f', value: 0},
                    u_height: {type: 'f', value: 1},
                    u_rand: {type: 'f', value: new THREE.Vector2(randomInteger(6, 10), randomInteger(8, 10)) }
                },
                fragmentShader: noise + fragment,
                vertexShader: noise + vertex,
            });

            // Create the mesh and position appropriately
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, -300);
            scene.add(mesh);

            // On hover effects for each item
            let enterTimer, exitTimer;
            item.addEventListener('mouseenter', function(e) {
                if(typeof exitTimer !== "undefined") {
                    clearTimeout(exitTimer);
                }
                enterTimer = setInterval(function() {
                    if(mesh.material.uniforms.u_height.value >= 0.5) {
                        mesh.material.uniforms.u_height.value -= 0.05;
                    } else {
                        clearTimeout(enterTimer);
                    }
                }, 10);
            });
            item.addEventListener('mouseleave', function(e) {
                if(typeof enterTimer !== "undefined") {
                    clearTimeout(enterTimer);
                }
                exitTimer = setInterval(function() {
                    if(mesh.material.uniforms.u_height.value < 1) {
                        mesh.material.uniforms.u_height.value += 0.05;
                    } else {
                        clearTimeout(exitTimer);
                    }
                }, 10);
            });

            // Render
            renderer.render( scene, camera );
            let t = 0;

            // Animate
            const animate = function () {
                requestAnimationFrame( animate );
                renderer.render( scene, camera );
                item.appendChild(renderer.domElement);
                mesh.material.uniforms.u_time.value = t;
                t = t + 0.02;
            };
            animate();
        });
    }
}

document.addEventListener("DOMContentLoaded", function(e) {
    createWave(config.individualItem, config.colors);

    // Get items
    const el = document.querySelector(config.individualItem);
    const elWidth = parseFloat(window.getComputedStyle(el).width) + parseFloat(window.getComputedStyle(el).marginLeft) + parseFloat(window.getComputedStyle(el).marginRight);
    
    // Track carousel
    let mousedown = false;
    let movement = false;
    let initialPosition = 0;
    let selectedItem;
    let currentDelta = 0;

    document.querySelectorAll(config.carouselId).forEach(function(item) { 
        item.style.width = `${config.carouselWidth}px`;
    });
    
    document.querySelectorAll(config.carouselId).forEach(function(item) {
        item.addEventListener('pointerdown', function(e) {
            mousedown = true;
            selectedItem = item;
            initialPosition = e.pageX;
            currentDelta = parseFloat(item.querySelector(config.carouselHolderId).style.transform.split('translateX(')[1]) || 0;
        }); 
    });
    
    const scrollCarousel = function(change, currentDelta, selectedItem) {
        let numberThatFit = Math.floor(config.carouselWidth / elWidth);
        let newDelta = currentDelta + change;
        let elLength = selectedItem.querySelectorAll(config.individualItem).length - numberThatFit;
        if(newDelta <= 0 && newDelta >= -elWidth * elLength) {
            selectedItem.querySelector(config.carouselHolderId).style.transform = `translateX(${newDelta}px)`;
        } else {
            if(newDelta <= -elWidth * elLength) {
                selectedItem.querySelector(config.carouselHolderId).style.transform = `translateX(${-elWidth * elLength}px)`;
            } else if(newDelta >= 0) {
                selectedItem.querySelector(config.carouselHolderId).style.transform = `translateX(0px)`;
            }
        }
    }

    document.body.addEventListener('pointermove', function(e) {
        if(mousedown == true && typeof selectedItem !== "undefined") {
            let change = -(initialPosition - e.pageX);
            scrollCarousel(change, currentDelta, document.body);
            document.querySelectorAll(`${config.carouselId} a`).forEach(function(item) {
                item.style.pointerEvents = 'none';
            });
            movement = true;
        }
    });
    
    ['pointerup', 'mouseleave'].forEach(function(item) {
        document.body.addEventListener(item, function(e) {
            selectedItem = undefined;
            movement = false;
            document.querySelectorAll(`${config.carouselId} a`).forEach(function(item) {
                item.style.pointerEvents = 'all';
            });
        });
    });

    document.querySelectorAll(config.carouselId).forEach(function(item) {
        let trigger = 0;
        item.addEventListener('wheel', function(e) {
            if(trigger !== 1) {
                ++trigger;
            } else {
                let change = e.deltaX * -3;
                let currentDelta = parseFloat(item.querySelector(config.carouselHolderId).style.transform.split('translateX(')[1]) || 0;
                scrollCarousel(change, currentDelta, item);
                trigger = 0;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        });
    });
});