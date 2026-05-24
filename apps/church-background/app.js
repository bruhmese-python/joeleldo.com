// --- Canvas Minimal Text Overlay Editor Logic ---

document.addEventListener('DOMContentLoaded', () => {

  // Elements Selection
  const textInput = document.getElementById('text-input');
  const btnDownload = document.getElementById('btn-download');
  const spinnerOverlay = document.getElementById('canvas-loading-spinner');

  // Set default dynamic text: "<today's date> | 10 AM to 12:30 PM"
  const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };
  textInput.value = `${formatDate()} | 10 AM to 12:30 PM`;

  // Canvas Setup
  const canvas = new fabric.Canvas('fabric-canvas', {
    preserveObjectStacking: true,
    backgroundColor: '#000000',
    selection: false // Focus entirely on the single text overlay
  });

  // Tracking variables
  let bgImageWidth = 1920;
  let bgImageHeight = 1080;
  let textObject = null;
  let loadingImage = new Image();

  // 1. Load Background Image First to Get Natural Resolution
  loadingImage.src = 'background.png';
  loadingImage.onload = function() {
    bgImageWidth = loadingImage.naturalWidth || loadingImage.width;
    bgImageHeight = loadingImage.naturalHeight || loadingImage.height;

    // Load background image in Fabric
    fabric.Image.fromURL('background.png', (fabricImg) => {
      canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas), {
        originX: 'left',
        originY: 'top',
        scaleX: 1,
        scaleY: 1
      });

      // Hide loading spinner
      spinnerOverlay.style.opacity = '0';
      setTimeout(() => {
        spinnerOverlay.style.display = 'none';
      }, 300);

      // Perform initial layout scaling
      resizeCanvas();

      // Create the singular overlay text box
      initTextOverlay();
    }, { crossOrigin: 'anonymous' });
  };

  loadingImage.onerror = function() {
    console.error('Failed to load background.png');
    spinnerOverlay.querySelector('p').textContent = 'Error loading background.png. Please check if the file is in the directory.';
    spinnerOverlay.querySelector('.spinner').style.borderTopColor = '#ef4444';
    
    bgImageWidth = 1920;
    bgImageHeight = 1080;
    resizeCanvas();
    initTextOverlay();
  };

  // 2. Responsive Viewport Scaling & Zoom
  function resizeCanvas() {
    const viewport = document.querySelector('.canvas-outer-wrapper');
    if (!viewport) return;

    // Calculate maximum available size with padding
    const maxW = viewport.clientWidth - 60;
    const maxH = viewport.clientHeight - 60;

    // Calculate aspect ratio scale factors
    const scaleX = maxW / bgImageWidth;
    const scaleY = maxH / bgImageHeight;
    const zoomFactor = Math.min(scaleX, scaleY, 1.0); // Fit screen, but don't scale past 100%

    // Set canvas dimensions
    canvas.setDimensions({
      width: Math.round(bgImageWidth * zoomFactor),
      height: Math.round(bgImageHeight * zoomFactor)
    });

    // Zoom the workspace view
    canvas.setZoom(zoomFactor);
    canvas.renderAll();
  }

  // Bind to window resize
  window.addEventListener('resize', resizeCanvas);

  // 3. Initialize Roboto Medium Text Overlay
  function initTextOverlay() {
    textObject = new fabric.Textbox(textInput.value, {
      left: bgImageWidth / 2,
      top: bgImageHeight / 2,
      width: bgImageWidth * 0.75, // Take 75% width
      originX: 'center',
      originY: 'center',
      
      // Styling properties
      fontFamily: 'Roboto',
      fontWeight: '500', // Roboto Medium
      fontSize: 84, // Clean size for large display overlay
      fill: '#ffffff', // Clean white contrast text
      textAlign: 'center',
      lineHeight: 1.2,
      
      // Select controls styling
      cornerColor: '#6366f1',
      cornerStrokeColor: '#ffffff',
      borderColor: '#6366f1',
      cornerStyle: 'circle',
      cornerSize: 12,
      transparentCorners: false,
      borderDashArray: [4, 4],
      padding: 12,
      
      lockScalingFlip: true,
      hasRotatingPoint: true
    });

    // Add to canvas and select
    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();

    // Bi-directional event listeners
    textObject.on('moving', () => canvas.renderAll());
    textObject.on('rotating', () => canvas.renderAll());
    textObject.on('scaling', () => canvas.renderAll());
    
    textObject.on('changed', () => {
      textInput.value = textObject.text;
    });

    canvas.on('selection:cleared', () => {
      // Force keep selection on the textbox overlay
      canvas.setActiveObject(textObject);
    });
  }

  // 4. Input Sync
  textInput.addEventListener('input', () => {
    if (!textObject) return;
    textObject.set('text', textInput.value);
    canvas.renderAll();
  });

  // 5. High Resolution Combined Export
  btnDownload.addEventListener('click', () => {
    if (!textObject) return;

    // Temporarily de-select the textbox border for a clean export
    canvas.discardActiveObject();
    canvas.renderAll();

    // Store visual size zoom parameters
    const originalZoom = canvas.getZoom();
    const originalWidth = canvas.getWidth();
    const originalHeight = canvas.getHeight();

    // 1. Temporarily restore full size
    canvas.setDimensions({
      width: bgImageWidth,
      height: bgImageHeight
    });
    canvas.setZoom(1.0);
    canvas.renderAll();

    try {
      // 2. Generate PNG Data
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0
      });

      // 3. Trigger client download
      const downloadLink = document.createElement('a');
      downloadLink.href = dataURL;
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadLink.download = `overlay-screen-${dateStr}.png`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Error generating canvas export:', err);
      alert('Failed to export. This can occur when opening the file directly via browser file paths (CORS policy). Please make sure you are running the local server.');
    }

    // 4. Restore the responsive zoomed viewport size
    canvas.setDimensions({
      width: originalWidth,
      height: originalHeight
    });
    canvas.setZoom(originalZoom);
    
    // Reselect the text box
    canvas.setActiveObject(textObject);
    canvas.renderAll();
  });
});
