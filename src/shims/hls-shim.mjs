// Lightweight shim that provides a minimal Events export for build-time
// static analysis and proxies the default export to video.js at runtime.
import videojs from 'video.js';

// hls.js provides an Events enum with event name strings. Drei only uses
// Events.MEDIA_ATTACHED in the codebase. Provide that and an empty set
// for other potential keys.
export const Events = {
  MEDIA_ATTACHED: 'media-attached'
};

// Export video.js as the default so dynamic imports still work at runtime
export default videojs;
