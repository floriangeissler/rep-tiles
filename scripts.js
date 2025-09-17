// Wait for the initial HTML document to be completely loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
  // Central configuration for model paths and external script URLs.
  const config = {
    models: {
      single: { glb: './models/rep-tile_1.glb', poster: './models/rep-tile_1.png' },
      cube: { glb: './models/rep-tile_1_cube.glb', poster: './models/rep-tile_1_cube.png' },
    },
    viewerScript: 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js'
  };

  // Cache references to UI elements to avoid repeated DOM queries.
  const ui = {
    consentContainer: document.getElementById('consent-container'),
    loadScriptBtn: document.getElementById('load-script-btn'),
    placeholder: document.getElementById('model-placeholder'),
    modelViewer: document.getElementById('main-model-viewer'),
    thumbSingle: document.getElementById('thumb-single'),
    thumbCube: document.getElementById('thumb-cube'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    desktopControlsInfo: document.getElementById('desktop-controls-info'),
    mobileControlsInfo: document.getElementById('mobile-controls-info'),
  };

  /**
   * Handles switching between the 'single' and 'cube' rep-tile models.
   * @param {string} type - The type of model to display ('single' or 'cube').
   */
  const selectModel = (type) => {
    const isSingle = type === 'single';

    const selectedModel = isSingle ? config.models.single : config.models.cube;

    // Update the placeholder image source.
    ui.placeholder.src = selectedModel.poster;
    // Update thumbnail styles to indicate the active model.
    ui.thumbSingle.classList.toggle('selected', isSingle);
    ui.thumbCube.classList.toggle('selected', !isSingle);

    // Always update the model-viewer's source and poster.
    ui.modelViewer.src = selectedModel.glb;
    ui.modelViewer.poster = selectedModel.poster;
  }

  ui.thumbSingle.addEventListener('click', () => selectModel('single'));
  ui.thumbCube.addEventListener('click', () => selectModel('cube'));

  // Load the 3D model viewer script after the user gives consent.
  ui.loadScriptBtn.addEventListener('click', () => {
    // Hide the consent UI and add a class to the body for CSS hooks.
    ui.consentContainer.style.display = 'none';
    document.body.classList.add('model-active');

    // Create a new script element to dynamically load the <model-viewer> library.
    const script = document.createElement('script');
    script.type = 'module';
    script.src = config.viewerScript;

    // Once the model-viewer script is loaded, initialize the viewer.
    script.onload = () => {
      // Show the model-viewer element before fading it in.
      ui.modelViewer.style.display = 'block';

      // Fade out the placeholder and fade in the model viewer.
      ui.placeholder.style.opacity = '0';
      ui.modelViewer.style.opacity = '1';

      // After the 1s fade transition, hide the placeholder to prevent it from
      // intercepting pointer events meant for the model-viewer.
      setTimeout(() => { ui.placeholder.style.display = 'none'; }, 1000);

      // A simple check for mobile devices to adjust UI controls.
      const isMobileDevice = () => /Mobi|Android/i.test(navigator.userAgent);
      // Find the correct method for entering fullscreen, handling browser prefixes.
      const requestFullscreen = ui.modelViewer.requestFullscreen ||
        ui.modelViewer.webkitRequestFullscreen ||
        ui.modelViewer.msRequestFullscreen;

      // Show the fullscreen button only on non-mobile devices that support the API.
      if (!isMobileDevice() && requestFullscreen) {
        ui.fullscreenBtn.style.display = 'inline-block';
        ui.desktopControlsInfo.style.display = 'block';
        ui.fullscreenBtn.addEventListener('click', () => {
          requestFullscreen.call(ui.modelViewer);
        });

      } else {
        // On mobile devices, hide the fullscreen button and show mobile-specific controls info.
        ui.fullscreenBtn.style.display = 'none';
        ui.mobileControlsInfo.style.display = 'block';
      }
    };
    // Append the script to the body to start loading it.
    document.body.appendChild(script);
  });

  // Initialize the view with the default model.
  selectModel('single');

});