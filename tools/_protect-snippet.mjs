// Shared content-protection snippet injected into every notes.html (which is
// served inside an iframe, so the parent app's protection doesn't reach it).
// Deters: text selection, copy/cut, right-click, drag-save, print, and the
// common devtools/save keyboard shortcuts.
export const PROTECT_SNIPPET = `
<style id="ga-protect-css">
  * { -webkit-user-select:none!important; -moz-user-select:none!important; -ms-user-select:none!important; user-select:none!important; -webkit-touch-callout:none!important; }
  img, svg { -webkit-user-drag:none!important; user-drag:none!important; }
  @media print { html, body { display:none !important; } }
</style>
<script id="ga-protect-js">
(function(){
  var blk = function(e){ e.preventDefault(); e.stopPropagation(); return false; };
  ['contextmenu','copy','cut','dragstart','selectstart'].forEach(function(t){ document.addEventListener(t, blk, true); });
  document.addEventListener('keydown', function(e){
    var k = (e.key||'').toLowerCase();
    if (e.key === 'F12') { return blk(e); }
    if (e.ctrlKey || e.metaKey) {
      if (['s','u','p','c','x','a'].indexOf(k) > -1) return blk(e);
      if (e.shiftKey && ['i','j','c'].indexOf(k) > -1) return blk(e);
    }
  }, true);
})();
</script>
`;

export function injectProtection(html) {
  if (html.includes('id="ga-protect-css"')) return html; // already protected
  return html.includes('</body>')
    ? html.replace('</body>', PROTECT_SNIPPET + '\n</body>')
    : html + PROTECT_SNIPPET;
}
