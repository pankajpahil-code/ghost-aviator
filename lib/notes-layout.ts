/** Shared by the in-page reader and the PDF export. Authoring widths must not
 * become minimum widths when a standalone chapter is embedded in a flex item. */
export const NOTES_FIT_CSS = `
/* The app and exported PDF supply their own faint brand watermark. */
.ga-notes .ga-watermark-l1 { display:none !important; }
.ga-notes { box-sizing:border-box !important; width:100% !important; min-width:0 !important;
  max-width:100% !important; height:auto !important; max-height:none !important; overflow:visible !important; }
.ga-notes * { box-sizing:border-box; min-width:0; }
.ga-notes img, .ga-notes svg, .ga-notes canvas { max-width:100% !important; height:auto; }
.ga-notes p, .ga-notes li, .ga-notes h2, .ga-notes h3 { overflow-wrap:anywhere; }
.ga-notes pre { white-space:pre-wrap; overflow-wrap:anywhere; }
.ga-notes .ga-table-scroll { max-width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
.ga-notes table { max-width:100%; }
@media screen and (max-width:760px) {
  .ga-notes { padding:16px 12px !important; font-size:16px; }
  .ga-notes .page, .ga-notes .sheet, .ga-notes .container, .ga-notes .chapter,
  .ga-notes .content, .ga-notes .book, .ga-notes .wrap {
    width:auto !important; min-width:0 !important; max-width:100% !important;
    height:auto !important; min-height:0 !important; max-height:none !important; overflow:visible !important;
    padding-left:8px !important; padding-right:8px !important;
  }
  .ga-notes .two-col, .ga-notes .two-cols, .ga-notes .two-column, .ga-notes .two-columns,
  .ga-notes .cols-2, .ga-notes .grid-2, .ga-notes .grid-3, .ga-notes .cards,
  .ga-notes .grid2, .ga-notes .grid3 { grid-template-columns:minmax(0,1fr) !important; columns:1 !important; }
  .ga-notes .ga-table-scroll table { width:max-content; min-width:100%; max-width:none; }
}
`;
