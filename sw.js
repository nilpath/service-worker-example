
importScripts('serviceworker-cache-polyfill.js');

var API_CACHE = 'redditApi';
var APP_CACHE = 'app';

var app = [
  '/',
  '/style/main.css',
  '/js/main.js',
  '/offline.jpg'
];

function networkFallbackOnCache(request, cacheName) {
  return caches.match(request.clone()).then(function(response){
    return fetch(request.clone())
      .then(handleNetworkResponse)
      .catch(function(){
        return response;
      });
  });
  
  function handleNetworkResponse(networkResponse) {
    caches.open(cacheName).then(function(cache) {
      cache.put(request, networkResponse.clone());
    });
    
    return networkResponse.clone();
  }
}

function cacheFallbackOnNetworkFallbackOnOfflineImage(request, cacheName) {
  
  return caches.match(request.clone()).then(function(response) {
    var fetchPromise = fetch(request.clone())
      .then(handleNetworkResponse, fallbackOfflineImage);
    
    return response || fetchPromise;
  });
  
  function handleNetworkResponse(networkResponse) {
    caches.open(cacheName).then(function(cache) {
      cache.put(request, networkResponse.clone());
    });
    
    return networkResponse;
  }
  
  function fallbackOfflineImage() {
    var requestUrl = new URL(request.url);
    if (/\.(png|jpg|jpeg|gif)$/.test(requestUrl.pathname)) {
      return caches.match('/offline.jpg');
    }
    
    return Promise.reject('Can not fetch requested item :(');
  }
  
}

function onInstall(event) {
  event.waitUntil(
    caches.open(APP_CACHE).then(function(cache) {
      return cache.addAll(app);
    })
  );
}

function onActivate(event) {
  console.log('Activate: ', event);
}

function onFetch(event) {
  var requestUrl = new URL(event.request.url);
  var response;
  
  if(requestUrl.hostname === 'www.reddit.com') {
    response = networkFallbackOnCache(event.request, API_CACHE);
    
  } else if (requestUrl.pathname.split('.')[1] === 'gif') {
    response = cacheFallbackOnNetworkFallbackOnOfflineImage(event.request, API_CACHE);
  
  } else if(location.hostname === requestUrl.hostname) {
    response = cacheFallbackOnNetworkFallbackOnOfflineImage(event.request, APP_CACHE);

  }
  
  return event.respondWith(response);
}

self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate);
self.addEventListener('fetch', onFetch);


