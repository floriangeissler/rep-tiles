document.addEventListener('DOMContentLoaded', () => {
  const config = {
    models: {
      single: { glb: './models/rep-tile_1.glb', poster: './models/rep-tile_1.png' },
      cube: { glb: './models/rep-tile_1_cube.glb', poster: './models/rep-tile_1_cube.png' },
    },
    viewerScript: 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js'
  };

  // Cache DOM elements for performance
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

  // Switch between single tile and cube models
  const selectModel = (type) => {
    const isSingle = type === 'single';
    const selectedModel = isSingle ? config.models.single : config.models.cube;

    ui.placeholder.src = selectedModel.poster;
    ui.thumbSingle.classList.toggle('selected', isSingle);
    ui.thumbCube.classList.toggle('selected', !isSingle);
    ui.modelViewer.src = selectedModel.glb;
    ui.modelViewer.poster = selectedModel.poster;
  }

  ui.thumbSingle.addEventListener('click', () => selectModel('single'));
  ui.thumbCube.addEventListener('click', () => selectModel('cube'));

  // Handle user consent and load 3D viewer
  ui.loadScriptBtn.addEventListener('click', () => {
    // Add loading state
    document.body.classList.add('loading');
    ui.loadScriptBtn.textContent = 'Loading...';
    ui.loadScriptBtn.disabled = true;
    
    ui.consentContainer.style.display = 'none';
    document.body.classList.add('model-active');

    // Prevent page scrolling during model viewer initialization
    const preventTouchScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const viewerContainer = document.getElementById('viewer-container');
    viewerContainer.addEventListener('touchstart', preventTouchScroll, { passive: false });
    viewerContainer.addEventListener('touchmove', preventTouchScroll, { passive: false });

    // Dynamically load model-viewer library
    const script = document.createElement('script');
    script.type = 'module';
    script.src = config.viewerScript;

    script.onerror = () => {
      console.error('Failed to load model-viewer script');
      viewerContainer.removeEventListener('touchstart', preventTouchScroll);
      viewerContainer.removeEventListener('touchmove', preventTouchScroll);
      ui.placeholder.style.opacity = '1';
    };

    script.onload = () => {
      ui.modelViewer.style.display = 'block';

      // Wait for custom element registration and model loading
      customElements.whenDefined('model-viewer').then(() => {
        ui.modelViewer.addEventListener('load', () => {
          setTimeout(() => {
            // Re-enable page scrolling
            viewerContainer.removeEventListener('touchstart', preventTouchScroll);
            viewerContainer.removeEventListener('touchmove', preventTouchScroll);

            // Remove loading state
            document.body.classList.remove('loading');

            // Transition from placeholder to 3D model
            ui.placeholder.style.opacity = '0';
            ui.modelViewer.style.opacity = '1';
            setTimeout(() => { ui.placeholder.style.display = 'none'; }, 1000);
          }, 100);
        });

        // Fallback if load event doesn't fire
        setTimeout(() => {
          if (ui.modelViewer.style.opacity !== '1') {
            viewerContainer.removeEventListener('touchstart', preventTouchScroll);
            viewerContainer.removeEventListener('touchmove', preventTouchScroll);
            ui.placeholder.style.opacity = '0';
            ui.modelViewer.style.opacity = '1';
            setTimeout(() => { ui.placeholder.style.display = 'none'; }, 1000);
          }
        }, 2000);
      });

      // Configure UI based on device capabilities
      const isMobileDevice = () => /Mobi|Android/i.test(navigator.userAgent);
      const requestFullscreen = ui.modelViewer.requestFullscreen ||
        ui.modelViewer.webkitRequestFullscreen ||
        ui.modelViewer.msRequestFullscreen;

      if (!isMobileDevice() && requestFullscreen) {
        ui.fullscreenBtn.style.display = 'inline-block';
        ui.desktopControlsInfo.style.display = 'block';
        ui.fullscreenBtn.addEventListener('click', () => {
          requestFullscreen.call(ui.modelViewer);
        });
      } else {
        ui.fullscreenBtn.style.display = 'none';
        ui.mobileControlsInfo.style.display = 'block';
      }
    };

    document.body.appendChild(script);
  });

  selectModel('single');
});