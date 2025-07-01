// Emergency fix for invisible text issue
(function() {
  'use strict';
  
  // Fix all textareas and inputs immediately
  function fixInvisibleText() {
    const elements = document.querySelectorAll('textarea, input[type="text"], input[type="email"], input[type="password"], input[type="search"], pre, code');
    
    elements.forEach(el => {
      // Force text color
      el.style.color = '#111827';
      el.style.setProperty('color', '#111827', 'important');
      
      // For inputs and textareas, ensure background is white
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        el.style.backgroundColor = 'white';
        el.style.setProperty('background-color', 'white', 'important');
      }
      
      // Add a data attribute to track that we've fixed this element
      el.dataset.textFixed = 'true';
    });
  }
  
  // Run immediately
  fixInvisibleText();
  
  // Run when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixInvisibleText);
  }
  
  // Run on any dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        fixInvisibleText();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also fix on route changes (for SPAs)
  let lastUrl = location.href; 
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(fixInvisibleText, 100);
    }
  }).observe(document, {subtree: true, childList: true});
  
})();