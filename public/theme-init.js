// Pre-paint bootstrap: runs synchronously in <head> before the React bundle.
//
// Lives in /public so a strict CSP (no 'unsafe-inline' in script-src) can
// still authorize it via 'self'.
//
// Two jobs:
//   1. Restore the user's theme preference before first paint (no FOUC).
//   2. Activate the deferred Material Symbols stylesheet once it has loaded
//      (replaces the inline onload="this.media='all'" handler, which CSP
//      blocks under script-src 'self' without 'unsafe-hashes').
(function () {
    // 1. Theme restore
    try {
        var t = localStorage.getItem('immizy-theme');
        if (!t) {
            t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(t);
    } catch (e) {
        // localStorage can throw in private-mode Safari / blocked storage —
        // fall back to the default 'light' class already on <html>.
    }

    // 2. Activate deferred icon stylesheet
    var iconLink = document.querySelector('link[data-defer-icons]');
    if (iconLink) {
        var activate = function () { iconLink.media = 'all'; };
        // If the stylesheet already finished loading (cached), switch immediately;
        // otherwise switch on its load event.
        if (iconLink.sheet) activate();
        else iconLink.addEventListener('load', activate);
    }
})();
