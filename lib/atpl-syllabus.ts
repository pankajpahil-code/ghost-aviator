// Primary source: DGCA CAR Section 7, Series B, Part VI, Issue III,
// 16 June 2011, paragraphs 2.1.1–2.1.8. Opened 19 October 2026.
// This is syllabus scope, not a claim that every applicant must sit eight papers.
export const ATPL_SYLLABUS_URL = "https://www.dgca.gov.in/digigov-portal/Upload?attachId=J%2FZGd3DOlXdtF%2FreyJMhhg%3D%3D&flag=iframeAttachView";
export const ATPL_MANUAL_URL = "https://pariksha.dgca.gov.in/PDFViewer.jsp?pdf=95FB462516F636EF3FF3BAE7AA4DB33C";
export const ATPL_AREAS = [
  { id: "atpl-navigation", name: "Air Navigation", reference: "Appendix A", sources: ["air-navigation"], focus: "Navigation principles, charts, flight planning, mass and balance, and performance." },
  { id: "atpl-meteorology", name: "Aviation Meteorology", reference: "Appendix B", sources: ["meteorology"], focus: "Atmospheric processes, weather systems, aviation hazards, reports and forecasts." },
  { id: "atpl-radio-aids", name: "Radio Aids and Instruments (Avionics)", reference: "Appendix C", sources: ["radio-navigation", "instrumentation"], focus: "Radio navigation, surveillance, flight instruments and electronic navigation systems." },
  { id: "atpl-air-regulations", name: "Air Regulation", reference: "Appendix D", sources: ["air-regulations"], focus: "Air law, rules of the air, air traffic services and operational requirements." },
  { id: "atpl-technical", name: "Aircraft and Engines", reference: "Appendix E", sources: ["technical-general"], focus: "Aircraft systems, engines, principles of flight and associated technical knowledge." },
  { id: "atpl-technical-specific", name: "Technical Specific", reference: "Paragraph 2.1.6", sources: ["technical-specific"], focus: "The particular aircraft and its systems. Select material for your aircraft type." },
  { id: "atpl-performance", name: "Technical Performance", reference: "Paragraph 2.1.7", sources: ["technical-performance"], focus: "Aircraft performance and systems. The CAR specifies applicability for heavy aircraft above 5,700 kg MTOW or twin-engine aeroplanes." },
  { id: "atpl-radio-telephony", name: "Radio Telephony", reference: "Paragraph 2.1.8", sources: ["radio-telephony"], focus: "Procedures, phraseology, communication failure, and interpretation of aural and visual signals." },
] as const;

// Existing banks move to CPL by the Captain's explicit instruction, 19 Oct 2026.
export const ATPL_TO_CPL: Record<string, string> = Object.fromEntries(
  ATPL_AREAS.map(area => [area.id, area.sources[0]]),
);
export const ATPL_SUPPORTING_TO_CPL: Record<string, string> = {
  "human-performance": "human-performance", "flight-planning": "flight-planning",
};
