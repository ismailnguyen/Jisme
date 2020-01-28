//This is the service worker with the Cache-first network

var CACHE = 'jisme-precache';
var precacheFiles = [
      '/',
  	'/index.html',
      '/css/fontawesome.min.css',
      '/css/bootstrap.min.css',
      '/fonts/fontawesome-webfont.eot',
      '/fonts/fontawesome-webfont.svg',
      '/fonts/fontawesome-webfont.ttf',
      '/fonts/fontawesome-webfont.woff',
      '/fonts/fontawesome-webfont.woff2',
      '/dist/build.js',
      '/js/bootstrap.min.js',
      '/js/jquery.min.js',
      '/js/sha256.min.js',
      '/js/sjcl.js'
    ];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', event => {
      console.log('The service worker is being installed.');
      
      // IMPORTANT: Clone the request. A request is a stream and
      // can only be consumed once. Since we are consuming this
      // once by cache and once by the browser for fetch, we need
      // to clone the response.
      var fetchRequest = event.request.clone();
      
      if (fetchRequest.cache === 'only-if-cached' && fetchRequest.mode !== 'same-origin') 
      {
            return;
      }
      
      event.waitUntil(precache()
                      .then(() => {
            console.log('[ServiceWorker] Skip waiting on install');
            return self.skipWaiting();
      }));
});

//allow sw to control of current page
self.addEventListener('activate', event => {
      console.log('[ServiceWorker] Claiming clients for current page');
      return self.clients.claim();
});

self.addEventListener('fetch', event => {
      console.log('The service worker is serving the asset.'+ event.request.url);
      
      // IMPORTANT: Clone the request. A request is a stream and
      // can only be consumed once. Since we are consuming this
      // once by cache and once by the browser for fetch, we need
      // to clone the response.
      var fetchRequest = event.request.clone();
      
      if (fetchRequest.method !== 'GET'
            && fetchRequest.cache === 'only-if-cached'
            && fetchRequest.mode !== 'same-origin')
      {
            return;
      }

      let notCachedPages = ['login', 'register'];
      if (notCachedPages.some(page => fetchRequest.url.indexOf(page) >= 0))
      {
            event
                  .respondWith(fromServer(fetchRequest)
                  .catch(fromCache(fetchRequest)));
      }
      else
      {
            event
                  .respondWith(fromCache(fetchRequest)
                  .catch(fromServer(fetchRequest)));
      }

      event.waitUntil(update(fetchRequest));
});

function precache() {
      return caches.open(CACHE)
                  .then(cache => cache.addAll(precacheFiles));
}

function fromCache(request) {
      //we pull files from the cache first thing so we can show them fast
      return caches.open(CACHE)
                  .then(cache => cache.match(request)
                                    .then(matching => matching || Promise.reject('no-match'))
                       );
}

function update(request) {
      // Method 'POST' is unsupported with caching in service worker
      if(request.method === 'POST')
            return request;

      //this is where we call the server to get the newest version of the 
      //file to use the next time we show view
      return caches.open(CACHE)
                        .then(cache => fetch(request.clone())
                              .then(response => {
                                    // IMPORTANT: Clone the response. A response is a stream
                                    // and because we want the browser to consume the response
                                    // as well as the cache consuming the response, we need
                                    // to clone it so we have two streams.
                                    var responseToCache = response.clone();

                                    cache.put(request, responseToCache)
      }));
}

function fromServer(request){
      //this is the fallback if it is not in the cahche to go to the server and get it
      return fetch(request.clone()).then(response => response.clone())
}
