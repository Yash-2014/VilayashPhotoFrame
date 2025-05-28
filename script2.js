// Placeholder for frame data. Make sure these paths are correct and images exist.
// For the image to show *inside* the frame, these frame PNGs MUST have transparent cutouts.
const frameData = [
    { id: 'frame1', src: 'frames/frame1.png', name: 'Elegant Oval Gold', ratio: '9/16' },
    { id: 'frame2', src: 'frames/frame2.png', name: 'Floral Gold', ratio: '9/16' },
    { id: 'frame3', src: 'frames/frame3.png', name: 'Square Gold', ratio: '9/16' },
    { id: 'frame4', src: 'frames/frame4.png', name: 'Ornate Oval Gold', ratio: '9/16' },
    { id: 'frame5', src: 'frames/frame5.png', name: 'Elegant Oval Gold1', ratio: '9/16' },
    { id: 'frame6', src: 'frames/frame6.png', name: 'Floral Gold1', ratio: '9/16' },
    { id: 'frame7', src: 'frames/frame7.png', name: 'Square Gold1', ratio: '9/16' },
    { id: 'frame8', src: 'frames/frame8.png', name: 'Ornate Oval Gold1', ratio: '9/16' },
    { id: 'frame9', src: 'frames/frame9.png', name: 'Elegant Oval Gold2', ratio: '9/16' },
    { id: 'frame10', src: 'frames/frame10.png', name: 'Floral Gold2', ratio: '9/16' },
    { id: 'frame11', src: 'frames/frame11.png', name: 'Square Gold2', ratio: '9/16' },
    { id: 'frame12', src: 'frames/frame12.png', name: 'Ornate Oval Gold2', ratio: '9/16' },
    { id: 'frame13', src: 'frames/frame13.png', name: 'Elegant Oval Gold3', ratio: '9/16' },
    { id: 'frame14', src: 'frames/frame14.png', name: 'Floral Gold3', ratio: '9/16' },
    { id: 'frame15', src: 'frames/frame15.png', name: 'Square Gold3', ratio: '9/16' },
    { id: 'frame16', src: 'frames/frame16.png', name: 'Ornate Oval Gold3', ratio: '9/16' },
    { id: 'frame17', src: 'frames/frame17.png', name: 'Elegant Oval Gold4', ratio: '9/16' },
    { id: 'frame18', src: 'frames/frame18.png', name: 'Floral Gold4', ratio: '9/16' },
    { id: 'frame19', src: 'frames/frame19.png', name: 'Square Gold4', ratio: '9/16' },
    { id: 'frame20', src: 'frames/frame20.png', name: 'Ornate Oval Gold4', ratio: '9/16' },
    { id: 'frame21', src: 'frames/frame21.png', name: 'Elegant Oval Gold5', ratio: '9/16' },
    { id: 'frame22', src: 'frames/frame22.png', name: 'Floral Gold5', ratio: '9/16' },
    { id: 'frame23', src: 'frames/frame23.png', name: 'Square Gold5', ratio: '9/16' },
    { id: 'frame24', src: 'frames/frame24.png', name: 'Ornate Oval Gold5', ratio: '9/16' },
    { id: 'frame25', src: 'frames/frame25.png', name: 'Elegant Oval Gold6', ratio: '9/16' },
    { id: 'frame26', src: 'frames/frame26.png', name: 'Floral Gold6', ratio: '9/16' }
];

// Preload frame images to ensure they are available for canvas drawing
const loadedFrameImages = {};
function preloadFrames() {
    frameData.forEach(frame => {
        const img = new Image();
        img.src = frame.src;
        img.onload = () => {
            loadedFrameImages[frame.id] = img;
        };
        img.onerror = () => {
            console.error(`Failed to load frame for preload: ${frame.src}`);
        };
    });
}


// Canvas setup
const previewCanvas = document.getElementById('previewCanvas');
const ctx = previewCanvas.getContext('2d');
const frameOverlay = document.getElementById('frameOverlay');
const frameContainer = document.getElementById('frameContainer');
const initialPreviewOverlay = document.getElementById('initialPreviewOverlay');
const currentPreviewResolutionSpan = document.getElementById('currentPreviewResolution');

// Current state variables
let uploadedImage = null;
let selectedFrame = null; // Stores the frame data object
let currentRatio = { width: 1080, height: 1920 }; // Default to Portrait (9:16)
let fitCoverMode = 'contain';
let imageZoom = 100; // Percentage
let imagePanX = 0;   // Percentage, relative to image's current drawn size
let imagePanY = 0;   // Percentage, relative to image's current drawn size

// UI Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const controlButtons = document.querySelectorAll('.control-button');
const accordionPanels = document.querySelectorAll('.accordion-panel');
const frameGallery = document.getElementById('frameGallery');
const imageUploadInput = document.getElementById('imageUpload');
const uploadBtn = document.querySelector('.upload-btn');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const fitCoverSelect = document.getElementById('fitCover');
const imageZoomSlider = document.getElementById('imageZoom');
const zoomValueSpan = document.getElementById('zoomValue');
const imagePosXSlider = document.getElementById('imagePosX');
const posXValueSpan = document.getElementById('posXValue');
const imagePosYSlider = document.getElementById('imagePosY');
const posYValueSpan = document.getElementById('posYValue');
const downloadBtn = document.getElementById('downloadBtn');
const resetButtons = document.querySelectorAll('.reset-button');
const ratioPortraitBtn = document.getElementById('ratioPortrait');


// --- Helper Functions ---

/**
 * Applies the current ratio dimensions to the canvas and redraws.
 */
function applyCanvasDimensions() {
    previewCanvas.width = currentRatio.width;
    previewCanvas.height = currentRatio.height;
    frameContainer.style.aspectRatio = `${currentRatio.width} / ${currentRatio.height}`;
    currentPreviewResolutionSpan.textContent = `${currentRatio.width}x${currentRatio.height}`;
    redrawCanvas();
}

/**
 * Redraws the uploaded image onto the canvas, applying fit/cover, zoom, and pan.
 */
function redrawCanvas() {
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // Clear the entire canvas

    if (!uploadedImage) {
        // If no image is uploaded, show the resolution text overlay on the canvas.
        currentPreviewResolutionSpan.style.display = 'block';
        return;
    } else {
        currentPreviewResolutionSpan.style.display = 'none'; // Hide if an image is present
    }

    // Calculate source and destination dimensions
    let sourceWidth = uploadedImage.width;
    let sourceHeight = uploadedImage.height;
    let destWidth = previewCanvas.width;
    let destHeight = previewCanvas.height;

    let imageAspectRatio = sourceWidth / sourceHeight;
    let canvasAspectRatio = destWidth / destHeight;

    let drawWidth, drawHeight;

    // Determine base draw dimensions based on fit/cover mode
    if (fitCoverMode === 'contain') {
        // Image must fit entirely within the canvas, possibly leaving empty space
        if (imageAspectRatio > canvasAspectRatio) {
            drawWidth = destWidth;
            drawHeight = destWidth / imageAspectRatio;
        } else {
            drawHeight = destHeight;
            drawWidth = destHeight * imageAspectRatio;
        }
    } else { // 'cover'
        // Image must cover the entire canvas, possibly cropping parts of the image
        if (imageAspectRatio < canvasAspectRatio) {
            drawWidth = destWidth;
            drawHeight = destWidth / imageAspectRatio;
        } else {
            drawHeight = destHeight;
            drawWidth = destHeight * imageAspectRatio;
        }
    }

    // Apply zoom
    drawWidth *= (imageZoom / 100);
    drawHeight *= (imageZoom / 100);

    // Calculate initial centered position
    let destX = (destWidth - drawWidth) / 2;
    let destY = (destHeight - drawHeight) / 2;

    // Apply pan (percentage of the image's current drawn size, relative to original center)
    destX += (imagePanX / 100) * drawWidth * 0.5;
    destY += (imagePanY / 100) * drawHeight * 0.5;

    ctx.drawImage(uploadedImage, destX, destY, drawWidth, drawHeight);
}

/**
 * Enables or disables image related controls (upload, fit/cover, zoom, pan, download).
 * @param {boolean} enable - True to enable, false to disable.
 */
function enableImageControls(enable) {
    imageUploadInput.disabled = !enable;
    uploadBtn.disabled = !enable;
    // These only enable if an image IS uploaded, even if overall controls are enabled by frame selection
    fitCoverSelect.disabled = !enable || !uploadedImage;
    imageZoomSlider.disabled = !enable || !uploadedImage;
    imagePosXSlider.disabled = !enable || !uploadedImage;
    imagePosYSlider.disabled = !enable || !uploadedImage;
    downloadBtn.disabled = !enable || !uploadedImage;

    // Reset values visually if disabling
    if (!enable) {
        fileNameDisplay.textContent = 'No file chosen';
        imageZoomSlider.value = 100;
        zoomValueSpan.textContent = '100%';
        imagePosXSlider.value = 0;
        posXValueSpan.textContent = '0%';
        imagePosYSlider.value = 0;
        posYValueSpan.textContent = '0%';
    }
}

/**
 * Generates a new canvas with the uploaded image and selected frame composited.
 * This function handles the logic for the final download image.
 * @returns {Promise<HTMLCanvasElement>} A promise that resolves with the final composited canvas.
 */
function getDownloadCanvas() {
    return new Promise((resolve, reject) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = currentRatio.width;
        tempCanvas.height = currentRatio.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw background (optional, depends on desired output)
        // tempCtx.fillStyle = '#FFFFFF'; // Example: white background
        // tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // 1. Draw the uploaded image onto the temporary canvas
        if (uploadedImage) {
            let sourceWidth = uploadedImage.width;
            let sourceHeight = uploadedImage.height;
            let destWidth = tempCanvas.width;
            let destHeight = tempCanvas.height;

            let imageAspectRatio = sourceWidth / sourceHeight;
            let canvasAspectRatio = destWidth / destHeight;

            let drawWidth, drawHeight;

            if (fitCoverMode === 'contain') {
                if (imageAspectRatio > canvasAspectRatio) {
                    drawWidth = destWidth;
                    drawHeight = destWidth / imageAspectRatio;
                } else {
                    drawHeight = destHeight;
                    drawWidth = destHeight * imageAspectRatio;
                }
            } else { // 'cover'
                if (imageAspectRatio < canvasAspectRatio) {
                    drawWidth = destWidth;
                    drawHeight = destWidth / imageAspectRatio;
                } else {
                    drawHeight = destHeight;
                    drawWidth = destHeight * imageAspectRatio;
                }
            }

            drawWidth *= (imageZoom / 100);
            drawHeight *= (imageZoom / 100);

            let destX = (destWidth - drawWidth) / 2;
            let destY = (destHeight - drawHeight) / 2;

            destX += (imagePanX / 100) * drawWidth * 0.5;
            destY += (imagePanY / 100) * drawHeight * 0.5;

            tempCtx.drawImage(uploadedImage, destX, destY, drawWidth, drawHeight);
        }

        // 2. Draw the frame overlay image on top
        if (selectedFrame) {
            const frameImg = loadedFrameImages[selectedFrame.id];
            if (frameImg && frameImg.complete) {
                tempCtx.drawImage(frameImg, 0, 0, tempCanvas.width, tempCanvas.height);
                resolve(tempCanvas);
            } else if (selectedFrame.src) {
                // Fallback: If for some reason the frame image wasn't preloaded or is not complete,
                // try to load it specifically for this capture.
                console.warn(`Frame ${selectedFrame.id} not preloaded or complete. Loading for capture.`);
                const tempFrameImg = new Image();
                tempFrameImg.src = selectedFrame.src;
                tempFrameImg.onload = () => {
                    tempCtx.drawImage(tempFrameImg, 0, 0, tempCanvas.width, tempCanvas.height);
                    resolve(tempCanvas);
                };
                tempFrameImg.onerror = () => {
                    console.error(`Failed to load frame image for capture: ${selectedFrame.src}`);
                    reject(new Error("Failed to load frame image for download."));
                };
            } else {
                resolve(tempCanvas); // No valid frame source, resolve with just the image (or blank)
            }
        } else {
            resolve(tempCanvas); // No frame selected, resolve with just the image (or blank)
        }
    });
}


// --- Event Listeners ---

// Theme Toggle
themeToggleBtn.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    themeToggleBtn.textContent = document.body.dataset.theme === 'dark' ? '🌙' : '☀️';
});

// Accordion Controls: Handles showing/hiding panels and button active state
controlButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.dataset.target;
        const targetPanel = document.getElementById(targetId);

        // Deactivate all buttons and hide all panels first
        controlButtons.forEach(btn => btn.classList.remove('active'));
        accordionPanels.forEach(panel => panel.classList.remove('active'));

        // Activate clicked button and show its panel
        button.classList.add('active');
        targetPanel.classList.add('active');

        // Re-evaluate image control enablement based on current state (frame selected, image uploaded)
        if (selectedFrame) {
            enableImageControls(true); // Re-enables if a frame is selected
        }
    });
});

// Initialize Accordion (show 'PHOTO-FRAME' panel by default on load)
document.addEventListener('DOMContentLoaded', () => {
    // Preload all frame images
    preloadFrames();

    // Show 'PHOTO-FRAME' panel by default
    const initialButton = document.querySelector('.control-button[data-target="frame-controls"]');
    if (initialButton) {
        initialButton.click(); // Programmatically click to activate
    }
    // Set default theme
    document.body.dataset.theme = 'light';
    themeToggleBtn.textContent = '☀️';
    applyCanvasDimensions(); // Set initial canvas size based on default ratio
    enableImageControls(false); // Initially disable image controls until frame is selected
});


// Frame Gallery Generation and Selection
function populateFrameGallery() {
    frameGallery.innerHTML = ''; // Clear existing thumbnails
    frameData.forEach(frame => {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('frame-thumbnail');
        thumbnailDiv.dataset.frameId = frame.id;
        thumbnailDiv.dataset.frameSrc = frame.src;

        const img = document.createElement('img');
        img.src = frame.src;
        img.alt = frame.name;
        thumbnailDiv.appendChild(img);

        thumbnailDiv.addEventListener('click', () => {
            // Remove 'selected' class from previously selected thumbnail
            document.querySelectorAll('.frame-thumbnail').forEach(thumb => thumb.classList.remove('selected'));
            // Add 'selected' class to the clicked thumbnail
            thumbnailDiv.classList.add('selected');
            selectedFrame = frame; // Store the full selected frame data object

            frameOverlay.src = frame.src; // Set the frame image source
            frameOverlay.classList.add('active'); // Make the frame overlay visible

            // Activate preview mode: hide initial instruction overlay, show canvas & resolution text
            frameContainer.classList.add('active-preview-mode');

            // Enable upload and adjustment controls now that a frame is selected
            enableImageControls(true);
            redrawCanvas(); // Redraw canvas to show resolution if no image, or the image if present
        });
        frameGallery.appendChild(thumbnailDiv);
    });
}
populateFrameGallery(); // Call to populate the gallery on page load


// Image Upload
imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                // Once image is loaded, ensure image controls are enabled and redraw
                enableImageControls(true); // Re-enable based on image presence
                redrawCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // If file input cleared or no file selected
        fileNameDisplay.textContent = 'No file chosen';
        uploadedImage = null;
        redrawCanvas(); // Clear canvas
        enableImageControls(true); // Still enable other controls if frame is selected
    }
});

// Make the "Choose File" button trigger the hidden file input
uploadBtn.addEventListener('click', () => {
    if (!uploadBtn.disabled) {
        imageUploadInput.click();
    }
});


// Image Adjustment Controls
fitCoverSelect.addEventListener('change', (event) => {
    fitCoverMode = event.target.value;
    redrawCanvas();
});

imageZoomSlider.addEventListener('input', (event) => {
    imageZoom = parseInt(event.target.value);
    zoomValueSpan.textContent = `${imageZoom}%`;
    redrawCanvas();
});

imagePosXSlider.addEventListener('input', (event) => {
    imagePanX = parseInt(event.target.value);
    posXValueSpan.textContent = `${imagePanX}%`;
    redrawCanvas();
});

imagePosYSlider.addEventListener('input', (event) => {
    imagePanY = parseInt(event.target.value);
    posYValueSpan.textContent = `${imagePanY}%`;
    redrawCanvas();
});

// Reset Buttons
resetButtons.forEach(button => {
    button.addEventListener('click', () => {
        const resetTarget = button.dataset.resetTarget;
        switch (resetTarget) {
            case 'full':
                // Reset frame selection
                document.querySelectorAll('.frame-thumbnail').forEach(thumb => thumb.classList.remove('selected'));
                selectedFrame = null;
                frameOverlay.src = '';
                frameOverlay.classList.remove('active');
                frameContainer.classList.remove('active-preview-mode'); // Show initial overlay

                // Reset image and all adjustments
                uploadedImage = null;
                fileNameDisplay.textContent = 'No file chosen';
                fitCoverMode = 'contain';
                imageZoom = 100;
                imagePanX = 0;
                imagePanY = 0;
                
                // Update UI for all image controls
                fitCoverSelect.value = 'contain';
                imageZoomSlider.value = 100;
                zoomValueSpan.textContent = '100%';
                imagePosXSlider.value = 0;
                posXValueSpan.textContent = '0%';
                imagePosYSlider.value = 0;
                posYValueSpan.textContent = '0%';
                
                enableImageControls(false); // Disable all image controls until new frame is chosen
                redrawCanvas(); // Clear canvas
                applyCanvasDimensions(); // Re-apply default canvas dimensions (effectively clears it if no image)
                
                // Programmatically click the 'PHOTO-FRAME' button to ensure its panel is active
                const initialButton = document.querySelector('.control-button[data-target="frame-controls"]');
                if (initialButton) {
                    initialButton.click(); 
                }
                break;
            case 'image':
                // Reset only the uploaded image and its related adjustments, keep frame selected
                uploadedImage = null;
                fileNameDisplay.textContent = 'No file chosen';
                
                // Reset adjustments
                fitCoverMode = 'contain';
                imageZoom = 100;
                imagePanX = 0;
                imagePanY = 0;
                
                // Update UI for image controls
                fitCoverSelect.value = 'contain';
                imageZoomSlider.value = 100;
                zoomValueSpan.textContent = '100%';
                imagePosXSlider.value = 0;
                posXValueSpan.textContent = '0%';
                imagePosYSlider.value = 0;
                posYValueSpan.textContent = '0%';
                
                redrawCanvas(); // Clear image from canvas
                // Re-enable controls if frame is selected (as per `enableImageControls` logic)
                if (selectedFrame) {
                    enableImageControls(true); 
                }
                break;
            case 'image-adjustments':
                // Reset only adjustments, keep image and frame selected
                fitCoverMode = 'contain';
                imageZoom = 100;
                imagePanX = 0;
                imagePanY = 0;

                // Update UI for adjustment controls
                fitCoverSelect.value = 'contain';
                imageZoomSlider.value = 100;
                zoomValueSpan.textContent = '100%';
                imagePosXSlider.value = 0;
                posXValueSpan.textContent = '0%';
                imagePosYSlider.value = 0;
                posYValueSpan.textContent = '0%';
                redrawCanvas();
                break;
        }
    });
});


// Download PNG using Blob
downloadBtn.addEventListener('click', async () => {
    if (!downloadBtn.disabled) {
        try {
            // Get the composited canvas from our custom drawing function
            const finalCanvas = await getDownloadCanvas();

            // Convert canvas to Blob
            finalCanvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = 'VilayashPhotoFrame.png';
                    link.href = url;
                    document.body.appendChild(link); // Append to body to make click work in Firefox
                    link.click();
                    document.body.removeChild(link); // Clean up the DOM
                    URL.revokeObjectURL(url); // Clean up the object URL
                } else {
                    throw new Error("Failed to create Blob from canvas.");
                }
            }, 'image/png'); // Specify the MIME type as 'image/png'

        } catch (error) {
            console.error("Error generating image for download:", error);
            alert("Failed to generate image for download. Please ensure you have an image and a frame selected, and that frame images are accessible.");
        }
    }
});