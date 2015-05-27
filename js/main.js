
if('serviceWorker' in window.navigator) {  
  window.navigator.serviceWorker.register('/sw.js')
    .then(onSWRegisterSuccess)
    .catch(onSWRegisterError);
}

function onSWRegisterSuccess(reg) {
  window.swRegistration = reg;
  console.log('Registered Service Worker: ', reg);
}

function onSWRegisterError(err) {
  console.log('Registration error: ', err);
}

(function(){
  
  function fetchPosts() {
    return fetch('http://www.reddit.com/r/perfectloops/top.json?sort=top&t=week')
      .then(function(response){
        return response.clone().json();
      })
      .then(function(json) {
        console.log(json);
        return json.data.children;
      });
  }
  
  function extractUrls(posts) {
    return posts.filter(function(post){
      return !post.data.over_18;
    })
    .map(function(post) {
      return post.data.url;
    })
    .filter(function(url) {
      return !!/gifv?$/.exec(url);
    })
    .map(function(url) {
      return url.replace(/v$/, '');
    });
  } 
  
  function updateDOM(urls) {
    var gifs = document.getElementById('gifs');
    
    urls.forEach(function(url){
      var img = document.createElement('img');
      img.setAttribute('src', url);
      gifs.appendChild(img);
    });
  } 
  
  fetchPosts()
    .then(extractUrls)
    .then(updateDOM)
    .catch(console.error.bind(console));
  
})();
