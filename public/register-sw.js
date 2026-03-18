if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function() {
    console.warn('Service worker registration failed.');
  });
}
