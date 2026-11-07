// Builds out/beyond_technical_skills.pptx: the research video as an editable deck.
// One slide per video scene; the voice-over for each scene goes in its speaker notes.
// Usage: node build_deck.js <timeline.json>   (timeline.json from build_timeline.py)
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");
const { applyTheme } = require("./apply_theme.js");

const OUT = path.join(__dirname, "..", "..", "out", "beyond_technical_skills.pptx");
const timeline = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const NOTES = {};
for (const l of timeline.lines) (NOTES[l.scene] = NOTES[l.scene] || []).push(l.text);

const THEME = {
  name: "Beyond Technical Skills",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "13203F", lt1: "FFFFFF", dk2: "0B2A6F", lt2: "EEF2FB",
    accent1: "1F4FB8", accent2: "0F9D9A", accent3: "F2B705", accent4: "D94848",
    accent5: "1F9D55", accent6: "5B6787", hlink: "1F4FB8", folHlink: "0B2A6F",
  },
};
const HEX = THEME.colors; // for hex-only options (shadows, chart colors, grid lines)
const LINE = "DCE3F2";     // card outline (hex-only on line options is fine; kept neutral)

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Beyond Technical Skills";
pres.author = "Adversario, Campo, Dumigpe, Larioque, Orbase, Silencio";
pres.subject = "Technology-integrated accounting education and multidimensional competencies of newly passed CPAs from PLV";
const C = pres.SchemeColor;

// ---------------------------------------------------------------- layouts
pres.defineSlideMaster({
  title: "Dark title",
  background: { color: C.text2 },
  objects: [],
  slideNumber: { x: 12.3, y: 6.95, w: 0.6, h: 0.3, color: C.background2, fontSize: 10, align: "right" },
});
pres.defineSlideMaster({
  title: "Dark statement",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.35, w: 11.73, h: 1.5, fontSize: 54, bold: true, color: C.background1, align: "center", valign: "middle" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 1.5, y: 3.95, w: 10.33, h: 1.1, fontSize: 20, color: C.background2, align: "center", valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "Content",
  background: { color: C.background1 },
  objects: [
    { text: { text: "Pamantasan ng Lungsod ng Valenzuela · BS Accountancy", options: { x: 0.6, y: 6.98, w: 7, h: 0.3, fontSize: 10, color: C.accent6, margin: 0, isTextBox: true } } },
    { placeholder: { options: { name: "kicker", type: "body", x: 0.6, y: 0.45, w: 12.1, h: 0.35, fontSize: 12, bold: true, color: C.accent1, charSpacing: 3, margin: 0, valign: "middle" }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.82, w: 12.1, h: 0.85, fontSize: 32, bold: true, color: C.text2, margin: 0, valign: "middle", align: "left" }, text: "" } },
  ],
  slideNumber: { x: 12.3, y: 6.95, w: 0.6, h: 0.3, color: C.accent6, fontSize: 10, align: "right" },
});

// ---------------------------------------------------------------- helpers
async function iconPng(Icon, hex, px = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color: "#" + hex, size: px }));
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
const shadow = () => ({ type: "outer", color: "13203F", opacity: 0.12, blur: 8, offset: 2, angle: 90 });
let objN = 0;
const nm = (s) => `${s}-${++objN}`;
function card(slide, x, y, w, h, o = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, objectName: nm(o.name || "Card"),
    fill: { color: o.fill || C.background1 },
    line: { color: o.line || LINE, width: o.lineW || 1, dashType: o.dash || "solid" },
    shadow: o.noShadow ? undefined : shadow(),
  });
}
async function iconCircle(slide, Icon, x, y, d, bg, fgHex, name) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { color: bg }, objectName: nm(name || "Icon circle") });
  const p = d * 0.26;
  slide.addImage({ data: await iconPng(Icon, fgHex), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: name || "icon", objectName: nm("Icon") });
}
const T = (slide, text, o) => slide.addText(text, { isTextBox: true, margin: 0, fontSize: 14, color: C.text1, valign: "top", objectName: nm(o.name || "Text"), ...o });
const cite = (slide, text, x = 0.6, y = 6.6, w = 12.1) => T(slide, text, { x, y, w, h: 0.3, fontSize: 10, italic: true, color: C.accent6, name: "Source" });
function content(section, kicker, title, scene) {
  const s = pres.addSlide({ masterName: "Content", sectionTitle: section });
  s.addText(kicker.toUpperCase(), { placeholder: "kicker" });
  s.addText(title, { placeholder: "title" });
  if (scene && NOTES[scene]) s.addNotes(NOTES[scene].join("\n\n"));
  return s;
}
function arrow(slide, x, y, w = 0.45, h = 0.45) {
  slide.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h, fill: { color: C.accent3 }, line: { color: C.accent3 }, objectName: nm("Arrow") });
}

(async () => {
  // ================================================================ INTRODUCTION
  pres.addSection({ title: "Introduction" });
  {
    const s = pres.addSlide({ masterName: "Dark title", sectionTitle: "Introduction" });
    s.addShape(pres.shapes.OVAL, { x: 6.12, y: 0.75, w: 1.1, h: 1.1, fill: { color: C.text2 }, line: { color: C.accent3, width: 3 }, objectName: "PLV seal" });
    T(s, "PLV", { x: 6.12, y: 0.75, w: 1.1, h: 1.1, align: "center", valign: "middle", bold: true, fontSize: 20, color: C.background1, name: "Seal text" });
    T(s, [{ text: "Beyond ", options: { color: C.background1 } }, { text: "Technical", options: { color: C.accent3 } }, { text: " Skills", options: { color: C.background1 } }],
      { x: 0.8, y: 2.1, w: 11.73, h: 1.2, fontSize: 60, bold: true, fontFace: THEME.headFontFace, align: "center", valign: "middle", name: "Title" });
    T(s, "Perceived Effects of Technology-Integrated Accounting Education on the Development of Multidimensional Competencies among Newly Passed Certified Public Accountants from Pamantasan ng Lungsod ng Valenzuela",
      { x: 1.6, y: 3.45, w: 10.13, h: 1.2, fontSize: 18, color: C.background2, align: "center", name: "Full title" });
    T(s, "Adversario, A. F. U.  ·  Campo, G. J. G.  ·  Dumigpe, R. M.  ·  Larioque, A. P. R.  ·  Orbase, J. R. M.  ·  Silencio, M. J.",
      { x: 0.8, y: 5.1, w: 11.73, h: 0.4, fontSize: 14, color: C.accent3, align: "center", name: "Authors" });
    T(s, "BS Accountancy · Pamantasan ng Lungsod ng Valenzuela", { x: 0.8, y: 5.6, w: 11.73, h: 0.35, fontSize: 12, color: C.background2, align: "center", name: "Affiliation" });
    s.addNotes((NOTES.title || []).join("\n\n"));
  }
  {
    const s = content("Introduction", "Why this study", "Accounting now runs on AI, automation, and blockchain", "hook");
    const items = [[fa.FaRobot, "Artificial intelligence"], [fa.FaGears, "Automation"], [fa.FaLink, "Blockchain"]];
    for (let i = 0; i < 3; i++) {
      const x = 1.55 + i * 3.6;
      card(s, x, 2.0, 3.1, 2.0);
      await iconCircle(s, items[i][0], x + 1.05, 2.2, 1.0, C.background2, HEX.accent1, items[i][1]);
      T(s, items[i][1], { x, y: 3.3, w: 3.1, h: 0.5, align: "center", bold: true, fontSize: 18, name: "Label" });
    }
    card(s, 1.55, 4.55, 4.6, 1.35, { fill: C.background2, noShadow: true });
    T(s, [{ text: "Record keeper", options: { bold: true, fontSize: 22, strike: "sngStrike", color: C.accent6, breakLine: true } }, { text: "Traditional bookkeeping", options: { fontSize: 14, color: C.accent6 } }],
      { x: 1.85, y: 4.75, w: 4.0, h: 1.0, name: "Old role" });
    arrow(s, 6.4, 4.95, 0.6, 0.55);
    card(s, 7.2, 4.55, 4.6, 1.35, { line: HEX.accent1, lineW: 2 });
    T(s, [{ text: "Analyst & advisor", options: { bold: true, fontSize: 22, color: C.text2, breakLine: true } }, { text: "Decision-making partner", options: { fontSize: 14, color: C.accent6 } }],
      { x: 7.5, y: 4.75, w: 4.0, h: 1.0, name: "New role" });
    cite(s, "Chukwuani & Egiyi, 2020 · Ali et al., 2026 · Coman et al., 2022");
  }
  {
    const s = content("Introduction", "The problem", "Graduates' skills lag behind what employers need", "gap");
    card(s, 0.6, 1.95, 7.3, 2.75);
    T(s, "Skills employers need", { x: 0.95, y: 2.15, w: 6.6, h: 0.35, bold: true, fontSize: 15, name: "Bar label" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.95, y: 2.55, w: 6.6, h: 0.42, rectRadius: 0.08, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "Need bar" });
    T(s, "Skills graduates bring", { x: 0.95, y: 3.15, w: 6.6, h: 0.35, bold: true, fontSize: 15, name: "Bar label" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.95, y: 3.55, w: 4.1, h: 0.42, rectRadius: 0.08, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "Have bar" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.1, y: 3.47, w: 2.45, h: 0.58, rectRadius: 0.08, fill: { color: C.background1 }, line: { color: C.accent4, width: 1.5, dashType: "dash" }, objectName: "Gap box" });
    T(s, "COMPETENCY GAP", { x: 5.1, y: 3.47, w: 2.45, h: 0.58, align: "center", valign: "middle", bold: true, fontSize: 12, color: C.accent4, charSpacing: 1, name: "Gap label" });
    T(s, "Tiron-Tudor et al., 2025", { x: 0.95, y: 4.2, w: 6.6, h: 0.3, italic: true, fontSize: 10, color: C.accent6, name: "Source" });
    const issues = [[fa.FaBookOpen, "Theory-heavy instruction", "Saayir et al., 2025"], [fa.FaComputerMouse, "Limited hands-on exposure", "Ingalls et al., 2025"]];
    for (let i = 0; i < 2; i++) {
      const y = 1.95 + i * 1.45;
      card(s, 8.3, y, 4.43, 1.3);
      await iconCircle(s, issues[i][0], 8.5, y + 0.25, 0.8, C.background2, HEX.accent1, issues[i][1]);
      T(s, [{ text: issues[i][1], options: { bold: true, fontSize: 16, breakLine: true } }, { text: issues[i][2], options: { italic: true, fontSize: 12, color: C.accent6 } }],
        { x: 9.5, y: y + 0.3, w: 3.1, h: 0.8, name: "Issue" });
    }
    card(s, 0.6, 5.1, 12.13, 1.1, { line: HEX.accent3, lineW: 2 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.95, y: 5.42, w: 2.0, h: 0.45, rectRadius: 0.08, fill: { color: C.accent3 }, line: { color: C.accent3 }, objectName: "Gap tag" });
    T(s, "RESEARCH GAP", { x: 0.95, y: 5.42, w: 2.0, h: 0.45, align: "center", valign: "middle", bold: true, fontSize: 12, color: C.text2, charSpacing: 2, name: "Tag" });
    T(s, "How does technology in the curriculum actually build competencies?", { x: 3.2, y: 5.3, w: 9.3, h: 0.7, valign: "middle", bold: true, fontSize: 20, color: C.text2, name: "Gap question" });
  }
  {
    const s = content("Introduction", "Theoretical framework", "Three theories anchor the study", "theory");
    const th = [[fa.FaArrowsRotate, "Experiential Learning Theory", "DAVID A. KOLB", "We learn best by doing, in learning spaces shaped by tools and simulations."],
      [fa.FaGlobe, "Connectivism", "GEORGE SIEMENS", "Knowledge grows through digital networks and platforms."],
      [fa.FaEye, "Social Cognitive Theory", "ALBERT BANDURA", "We learn by observing and modeling others, building self-efficacy."]];
    for (let i = 0; i < 3; i++) {
      const x = 0.6 + i * 4.18;
      card(s, x, 2.0, 3.85, 4.3);
      await iconCircle(s, th[i][0], x + 1.4, 2.3, 1.05, C.background2, HEX.accent1, th[i][1]);
      T(s, th[i][1], { x: x + 0.3, y: 3.55, w: 3.25, h: 0.8, align: "center", valign: "middle", bold: true, fontSize: 20, color: C.text2, fontFace: THEME.headFontFace, name: "Theory" });
      T(s, th[i][2], { x: x + 0.3, y: 4.4, w: 3.25, h: 0.3, align: "center", bold: true, fontSize: 12, color: C.accent1, charSpacing: 2, name: "Author" });
      T(s, th[i][3], { x: x + 0.4, y: 4.85, w: 3.05, h: 1.2, align: "center", fontSize: 15, color: C.accent6, name: "Idea" });
    }
  }
  {
    const s = content("Introduction", "Conceptual framework", "Input–Process–Output model", "ipo");
    const boxes = [["INPUT", C.accent1, ["Demographic profile of the respondents", "Multidimensional core competencies (IES, IFAC)"]],
      ["PROCESS", C.accent2, ["How technology-integrated accounting education influences competency development"]],
      ["OUTPUT", C.text2, ["Evidence-based strategies", "Policy recommendations", "Institutionalized technology integration"]]];
    for (let i = 0; i < 3; i++) {
      const x = 0.6 + i * 4.3;
      card(s, x, 2.3, 3.55, 3.3);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.3, w: 3.55, h: 0.7, rectRadius: 0.12, fill: { color: boxes[i][1] }, line: { color: boxes[i][1] }, objectName: "Header" });
      T(s, boxes[i][0], { x, y: 2.3, w: 3.55, h: 0.7, align: "center", valign: "middle", bold: true, fontSize: 18, color: C.background1, charSpacing: 4, name: "Header text" });
      T(s, boxes[i][2].map((b, j) => ({ text: b, options: { bullet: true, breakLine: j < boxes[i][2].length - 1 } })),
        { x: x + 0.25, y: 3.25, w: 3.05, h: 2.2, fontSize: 16, paraSpaceAfter: 8, name: "Items" });
      if (i < 2) arrow(s, x + 3.66, 3.7, 0.55, 0.5);
    }
  }
  {
    const s = content("Introduction", "What we measured · International Education Standards", "Five core competencies", "comp");
    const cx = 6.67, cy = 4.35;
    const pos = [[5.17, 1.95], [9.35, 3.05], [8.4, 5.6], [1.95, 5.6], [0.95, 3.05]];
    for (const [x, y] of pos) s.addShape(pres.shapes.LINE, { x: Math.min(cx, x + 1.5), y: Math.min(cy, y + 0.45), w: Math.abs(x + 1.5 - cx), h: Math.abs(y + 0.45 - cy), flipH: (x + 1.5 < cx) !== (y + 0.45 < cy) ? true : false, line: { color: C.accent3, width: 1.5, dashType: "dash" }, objectName: nm("Spoke") });
    s.addShape(pres.shapes.OVAL, { x: cx - 1.2, y: cy - 1.2, w: 2.4, h: 2.4, fill: { color: C.text2 }, line: { color: C.background2, width: 6 }, objectName: "Core" });
    T(s, [{ text: "Technology-integrated accounting education", options: { bold: true, fontSize: 15, breakLine: true } }, { text: "as rated by newly passed CPAs", options: { fontSize: 11 } }],
      { x: cx - 1.0, y: cy - 0.8, w: 2.0, h: 1.6, align: "center", valign: "middle", color: C.background1, name: "Core text" });
    const comps = [[fa.FaBrain, "Intellectual"], [fa.FaCalculator, "Technical & functional"], [fa.FaCompass, "Personal"], [fa.FaComments, "Interpersonal & communication"], [fa.FaBuilding, "Organizational & business management"]];
    for (let i = 0; i < 5; i++) {
      const [x, y] = pos[i];
      card(s, x, y, 3.0, 0.9);
      await iconCircle(s, comps[i][0], x + 0.15, y + 0.15, 0.6, C.background2, HEX.accent1, comps[i][1]);
      T(s, comps[i][1], { x: x + 0.9, y, w: 2.0, h: 0.9, valign: "middle", bold: true, fontSize: 14, name: "Competency" });
    }
  }
  {
    const s = content("Introduction", "Research question & hypothesis", "Is there a significant relationship?", "hypo");
    card(s, 1.0, 2.1, 4.1, 1.3);
    T(s, "Technology-integrated accounting education", { x: 1.2, y: 2.1, w: 3.7, h: 1.3, align: "center", valign: "middle", bold: true, fontSize: 18, name: "Variable" });
    card(s, 8.23, 2.1, 4.1, 1.3);
    T(s, "Multidimensional competencies", { x: 8.43, y: 2.1, w: 3.7, h: 1.3, align: "center", valign: "middle", bold: true, fontSize: 18, name: "Variable" });
    s.addShape(pres.shapes.LINE, { x: 5.2, y: 2.75, w: 2.93, h: 0, line: { color: C.accent1, width: 2.5, dashType: "dash" }, objectName: "Link" });
    s.addShape(pres.shapes.OVAL, { x: 6.22, y: 2.3, w: 0.9, h: 0.9, fill: { color: C.accent3 }, line: { color: C.accent3 }, objectName: "Question" });
    T(s, "?", { x: 6.22, y: 2.3, w: 0.9, h: 0.9, align: "center", valign: "middle", bold: true, fontSize: 30, color: C.text2, name: "Question mark" });
    card(s, 1.0, 4.05, 11.33, 1.9);
    T(s, "H₀", { x: 1.3, y: 4.05, w: 1.4, h: 1.9, valign: "middle", bold: true, fontSize: 54, color: C.accent1, fontFace: THEME.headFontFace, name: "H0" });
    T(s, [{ text: "There is " }, { text: "no significant relationship", options: { bold: true } }, { text: " between technology-integrated accounting education and the development of multidimensional competencies among newly passed CPAs from PLV." }],
      { x: 2.9, y: 4.05, w: 7.0, h: 1.9, valign: "middle", fontSize: 18, name: "Hypothesis" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.2, y: 4.6, w: 1.85, h: 0.8, rectRadius: 0.08, fill: { color: C.background1 }, line: { color: C.accent2, width: 2.5 }, rotate: 6, objectName: "Stamp" });
    T(s, "TO BE TESTED", { x: 10.2, y: 4.6, w: 1.85, h: 0.8, align: "center", valign: "middle", bold: true, fontSize: 13, color: C.accent2, charSpacing: 1, rotate: 6, name: "Stamp text" });
  }

  // ================================================================ METHODS
  pres.addSection({ title: "Methods" });
  {
    const s = content("Methods", "Methods · Research design", "Mixed methods, nested design", "design");
    const steps = [[fa.FaClipboardList, "PHASE 1 · QUAN", C.accent1, "Survey", "Correlational design measuring exposure and perceived competencies"],
      [fa.FaMicrophone, "PHASE 2 · QUAL", C.accent2, "Interviews", "Explain the patterns behind the numbers"],
      [fa.FaShapes, "INTEGRATION", C.text2, "Triangulation", "Statistically grounded and contextually meaningful"]];
    for (let i = 0; i < 3; i++) {
      const x = 0.6 + i * 4.3;
      card(s, x, 2.1, 3.55, 3.9);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.7, y: 2.4, w: 2.15, h: 0.42, rectRadius: 0.2, fill: { color: steps[i][2] }, line: { color: steps[i][2] }, objectName: "Phase tag" });
      T(s, steps[i][1], { x: x + 0.7, y: 2.4, w: 2.15, h: 0.42, align: "center", valign: "middle", bold: true, fontSize: 11, color: C.background1, charSpacing: 2, name: "Phase" });
      await iconCircle(s, steps[i][0], x + 1.3, 3.05, 0.95, C.background2, HEX.accent1, steps[i][3]);
      T(s, steps[i][3], { x, y: 4.15, w: 3.55, h: 0.55, align: "center", bold: true, fontSize: 22, color: C.text2, fontFace: THEME.headFontFace, name: "Step" });
      T(s, steps[i][4], { x: x + 0.35, y: 4.8, w: 2.85, h: 1.0, align: "center", fontSize: 15, color: C.accent6, name: "Description" });
      if (i < 2) arrow(s, x + 3.66, 3.8, 0.55, 0.5);
    }
  }
  {
    const s = content("Methods", "Methods · Respondents", "112 newly passed CPAs, a minimum sample of 88", "sample");
    // 14 x 8 dot grid; 88 highlighted (deterministic pick)
    let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const idx = [...Array(112).keys()]; for (let i = 111; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const pick = new Set(idx.slice(0, 88));
    for (let i = 0; i < 112; i++) {
      const col = i % 14, row = Math.floor(i / 14);
      s.addShape(pres.shapes.OVAL, { x: 0.75 + col * 0.42, y: 2.15 + row * 0.5, w: 0.3, h: 0.3, fill: { color: pick.has(i) ? C.accent3 : C.background2 }, line: { color: pick.has(i) ? C.accent3 : LINE }, objectName: nm("Respondent") });
    }
    T(s, [{ text: "● ", options: { color: C.accent3 } }, { text: "sample (n = 88)    ", options: { color: C.accent6 } }, { text: "● ", options: { color: "C9D3EA" } }, { text: "rest of the population", options: { color: C.accent6 } }],
      { x: 0.75, y: 6.2, w: 6, h: 0.3, fontSize: 12, name: "Legend" });
    T(s, [{ text: "112", options: { bold: true, fontSize: 54, color: C.text2, fontFace: THEME.headFontFace } }, { text: "  newly passed CPAs", options: { bold: true, fontSize: 18, color: C.accent6 } }],
      { x: 7.3, y: 1.95, w: 5.4, h: 0.85, valign: "middle", name: "Population" });
    T(s, "Population, from the PLV registrar", { x: 7.3, y: 2.8, w: 5.4, h: 0.3, fontSize: 13, color: C.accent6, name: "Note" });
    T(s, [{ text: "88", options: { bold: true, fontSize: 54, color: "B88A00", fontFace: THEME.headFontFace } }, { text: "  minimum sample", options: { bold: true, fontSize: 18, color: C.accent6 } }],
      { x: 7.3, y: 3.2, w: 5.4, h: 0.85, valign: "middle", name: "Sample" });
    T(s, "Slovin's formula · 5% margin of error", { x: 7.3, y: 4.05, w: 5.4, h: 0.3, fontSize: 13, color: C.accent6, name: "Note" });
    card(s, 7.3, 4.6, 5.43, 1.75);
    const crit = ["Passed the CPALE, 2023–2025", "BS Accountancy graduate of PLV", "Employed in an accounting-related field"];
    for (let i = 0; i < 3; i++) {
      await iconCircle(s, fa.FaCheck, 7.55, 4.78 + i * 0.5, 0.34, C.accent5, "FFFFFF", "Criterion met");
      T(s, crit[i], { x: 8.05, y: 4.78 + i * 0.5, w: 4.5, h: 0.34, valign: "middle", bold: true, fontSize: 15, name: "Criterion" });
    }
  }
  {
    const s = content("Methods", "Methods · Instruments", "A validated survey, then in-depth interviews", "survey");
    card(s, 0.6, 2.0, 6.6, 3.9);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.0, w: 6.6, h: 0.18, fill: { color: "673AB7" }, line: { color: "673AB7" }, objectName: "Form header" });
    T(s, "GOOGLE FORMS · VALIDATED & PILOT-TESTED", { x: 0.95, y: 2.4, w: 6, h: 0.3, bold: true, fontSize: 11, color: C.accent6, charSpacing: 2, name: "Form label" });
    T(s, "“Technology-integrated accounting education improved my ability to solve accounting-related problems.”", { x: 0.95, y: 2.8, w: 5.9, h: 1.1, bold: true, fontSize: 17, name: "Survey item" });
    const lk = [["4", "Strongly Agree"], ["3", "Agree"], ["2", "Disagree"], ["1", "Strongly Disagree"]];
    for (let i = 0; i < 4; i++) {
      const x = 0.95 + i * 1.5, on = i === 0;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.1, w: 1.35, h: 1.4, rectRadius: 0.1, fill: { color: on ? "F1EAFC" : C.background1 }, line: { color: on ? "673AB7" : LINE, width: on ? 2 : 1 }, objectName: nm("Likert") });
      T(s, [{ text: lk[i][0], options: { bold: true, fontSize: 26, color: on ? "673AB7" : C.text1, breakLine: true } }, { text: lk[i][1], options: { fontSize: 11, color: C.accent6 } }],
        { x, y: 4.2, w: 1.35, h: 1.2, align: "center", valign: "middle", name: "Likert label" });
    }
    const ppl = [fa.FaUserTie, fa.FaUser, fa.FaUserGraduate, fa.FaUserTie, fa.FaUser, fa.FaUserGraduate, fa.FaUserTie, fa.FaUser];
    for (let i = 0; i < 8; i++) await iconCircle(s, ppl[i], 7.75 + (i % 4) * 1.25, 2.05 + Math.floor(i / 4) * 1.15, 0.95, i % 2 ? C.background2 : "E3F4F3", i % 2 ? HEX.accent1 : HEX.accent2, "Informant");
    card(s, 7.6, 4.5, 5.13, 1.4);
    T(s, [{ text: "8 informants", options: { bold: true, fontSize: 22, color: C.text2, breakLine: true } }, { text: "Semi-structured online interviews · at least one from each area of practice", options: { fontSize: 14, color: C.accent6 } }],
      { x: 7.9, y: 4.6, w: 4.6, h: 1.2, valign: "middle", name: "Interviews" });
  }
  {
    const s = content("Methods", "Methods · Data analysis", "Describe, relate, and interpret the data", "analysis");
    const tools = [[fa.FaChartColumn, "Descriptive statistics", "Frequency, percentage, weighted mean, standard deviation"],
      [fa.FaChartLine, "Pearson correlation", "Strength and direction of the relationship"],
      [fa.FaFolderOpen, "Thematic analysis", "Familiarize, code, build and refine themes"]];
    for (let i = 0; i < 3; i++) {
      const x = 0.6 + i * 4.18;
      card(s, x, 2.0, 3.85, 3.4);
      await iconCircle(s, tools[i][0], x + 1.4, 2.3, 1.05, C.background2, HEX.accent1, tools[i][1]);
      T(s, tools[i][1], { x: x + 0.3, y: 3.55, w: 3.25, h: 0.5, align: "center", bold: true, fontSize: 20, color: C.text2, fontFace: THEME.headFontFace, name: "Tool" });
      T(s, tools[i][2], { x: x + 0.4, y: 4.15, w: 3.05, h: 1.0, align: "center", fontSize: 15, color: C.accent6, name: "Description" });
    }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.9, y: 5.75, w: 5.53, h: 0.6, rectRadius: 0.3, fill: { color: C.text2 }, line: { color: C.text2 }, objectName: "Triangulation pill" });
    T(s, "Integrated through triangulation", { x: 3.9, y: 5.75, w: 5.53, h: 0.6, align: "center", valign: "middle", bold: true, fontSize: 16, color: C.background1, name: "Triangulation" });
  }
  {
    const s = content("Methods", "Ethical considerations", "Participants were protected at every step", "ethics");
    await iconCircle(s, fa.FaShieldHalved, 0.9, 2.4, 3.0, C.background2, HEX.accent1, "Shield");
    const chips = ["Voluntary participation", "Informed consent", "Right to withdraw", "Anonymity", "Restricted access", "Data Privacy Act of 2012"];
    for (let i = 0; i < 6; i++) {
      const x = 4.6 + (i % 2) * 4.1, y = 2.25 + Math.floor(i / 2) * 1.15, key = i === 5;
      card(s, x, y, 3.8, 0.85, { line: key ? HEX.accent2 : LINE, lineW: key ? 2 : 1 });
      T(s, chips[i], { x: x + 0.3, y, w: 3.2, h: 0.85, valign: "middle", bold: true, fontSize: 17, color: key ? C.accent2 : C.text1, name: "Safeguard" });
    }
  }

  // ================================================================ RESULTS
  pres.addSection({ title: "Results" });
  {
    const s = content("Results", "Results · Respondents' profile", "88 newly passed CPAs, nearly all employed", "profile");
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 2.0, w: 3.6, h: 4.3, rectRadius: 0.12, fill: { color: C.text2 }, line: { color: C.text2 }, shadow: shadow(), objectName: "Respondents" });
    T(s, "88", { x: 0.6, y: 2.4, w: 3.6, h: 1.9, align: "center", valign: "middle", bold: true, fontSize: 110, color: C.accent3, fontFace: THEME.headFontFace, name: "Respondents" });
    T(s, "newly passed CPAs answered the survey", { x: 0.9, y: 4.5, w: 3.0, h: 1.0, align: "center", bold: true, fontSize: 17, color: C.background1, name: "Respondents label" });
    const stats = [["97.73%", "currently employed"], ["54.55%", "private / corporate accounting"], ["78.41%", "graduated from 2022 to 2024"], ["63.63%", "2 years of experience or less"]];
    for (let i = 0; i < 4; i++) {
      const x = 4.55 + (i % 2) * 4.15, y = 2.0 + Math.floor(i / 2) * 2.2;
      card(s, x, y, 3.95, 2.0);
      T(s, stats[i][0], { x: x + 0.3, y: y + 0.2, w: 3.4, h: 0.85, bold: true, fontSize: 40, color: C.text2, fontFace: THEME.headFontFace, name: "Stat" });
      T(s, stats[i][1], { x: x + 0.3, y: y + 1.05, w: 3.4, h: 0.4, bold: true, fontSize: 15, name: "Stat label" });
      if (i === 0) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: y + 1.55, w: 3.35, h: 0.16, rectRadius: 0.08, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "Meter track" });
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: y + 1.55, w: 3.35 * 0.9773, h: 0.16, rectRadius: 0.08, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "Meter" });
      }
      if (i === 1) {
        let bx = x + 0.3; const parts = [[0.5455, C.accent1], [0.4205, C.accent2], [0.034, C.accent3]];
        for (const [f, col] of parts) { s.addShape(pres.shapes.RECTANGLE, { x: bx, y: y + 1.5, w: 3.35 * f, h: 0.16, fill: { color: col }, line: { color: col }, objectName: nm("Practice area") }); bx += 3.35 * f; }
        T(s, "Private 54.55% · Public 42.05% · Government 3.41%", { x: x + 0.3, y: y + 1.7, w: 3.5, h: 0.25, fontSize: 10, color: C.accent6, name: "Breakdown" });
      }
    }
    cite(s, "Table 1 · Demographic profile of the respondents (n = 88)");
  }
  {
    const s = content("Results", "Results · Competency development", "All five competencies scored high", "skills");
    const cats = ["Intellectual", "Technical & functional", "Personal", "Organizational & business mgmt.", "Interpersonal & communication"];
    const vals = [3.31, 3.26, 3.26, 3.26, 3.09];
    s.addChart(pres.charts.BAR, [{ name: "Overall mean", labels: cats.slice().reverse(), values: vals.slice().reverse() }], {
      x: 0.6, y: 1.9, w: 7.8, h: 4.5, barDir: "bar", objectName: "Competency means chart",
      chartColors: [HEX.accent2, HEX.accent1, HEX.accent1, HEX.accent1, HEX.accent1], barGapWidthPct: 55,
      showTitle: true, title: "Overall mean per competency (1–4 scale)", titleFontSize: 13, titleColor: HEX.dk1, titleFontFace: "+mn-lt",
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 13, dataLabelFontBold: true, dataLabelColor: HEX.dk2, dataLabelFontFace: "+mn-lt",
      valAxisMinVal: 1, valAxisMaxVal: 4, valAxisMajorUnit: 1, valAxisLabelColor: HEX.accent6, valAxisLabelFontSize: 11, valAxisLabelFontFace: "+mn-lt",
      catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt",
      valGridLine: { color: "E3E8F4", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false,
    });
    card(s, 8.75, 2.0, 3.98, 1.95, { line: HEX.accent3, lineW: 2 });
    T(s, [{ text: "Highest-rated item", options: { bold: true, fontSize: 12, color: "B88A00", charSpacing: 1, breakLine: true } }, { text: "Locating accounting information from various digital resources", options: { bold: true, fontSize: 15, breakLine: true } }, { text: "3.35 · Very High Extent", options: { bold: true, fontSize: 15, color: C.accent1 } }],
      { x: 9.05, y: 2.15, w: 3.45, h: 1.7, name: "Highest item" });
    card(s, 8.75, 4.2, 3.98, 1.95);
    T(s, [{ text: "Interpretation", options: { bold: true, fontSize: 12, color: C.accent1, charSpacing: 1, breakLine: true } }, { text: "Intellectual, technical, personal and organizational skills: Very High Extent", options: { fontSize: 14, breakLine: true } }, { text: "Interpersonal skills: High Extent (lowest)", options: { fontSize: 14, color: C.accent2, bold: true } }],
      { x: 9.05, y: 4.35, w: 3.45, h: 1.7, name: "Interpretation" });
    cite(s, "Tables 2.1–2.5 · 4-point scale (1 = Strongly Disagree, 4 = Strongly Agree)");
  }
  {
    const s = content("Results", "Results · Exposure to technology", "Exposure was positive, but hands-on tools lag behind", "exposure");
    card(s, 0.6, 2.0, 3.6, 4.3);
    T(s, "3.00", { x: 0.6, y: 2.5, w: 3.6, h: 1.5, align: "center", valign: "middle", bold: true, fontSize: 72, color: C.text2, fontFace: THEME.headFontFace, name: "Overall mean" });
    T(s, "Positive perception", { x: 0.6, y: 4.0, w: 3.6, h: 0.45, align: "center", bold: true, fontSize: 18, color: C.accent5, name: "Interpretation" });
    T(s, "Overall mean, 4-point scale", { x: 0.6, y: 4.5, w: 3.6, h: 0.35, align: "center", fontSize: 13, color: C.accent6, name: "Note" });
    const cats = ["Different digital tools for accounting", "Online learning & organizational platforms", "Collaborative tools", "Accounting software, in a practical manner"];
    const vals = [3.06, 3.06, 2.94, 2.93];
    s.addChart(pres.charts.BAR, [{ name: "Mean", labels: cats.slice().reverse(), values: vals.slice().reverse() }], {
      x: 4.5, y: 1.9, w: 8.23, h: 3.9, barDir: "bar", objectName: "Exposure chart",
      chartColors: ["E58A3A", "E58A3A", HEX.accent1, HEX.accent1], barGapWidthPct: 55,
      showTitle: true, title: "Exposure to technology-integrated accounting education (1–4 scale)", titleFontSize: 13, titleColor: HEX.dk1, titleFontFace: "+mn-lt",
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 13, dataLabelFontBold: true, dataLabelColor: HEX.dk2, dataLabelFontFace: "+mn-lt",
      valAxisMinVal: 1, valAxisMaxVal: 4, valAxisMajorUnit: 1, valAxisLabelColor: HEX.accent6, valAxisLabelFontSize: 11, valAxisLabelFontFace: "+mn-lt",
      catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt",
      valGridLine: { color: "E3E8F4", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false,
    });
    T(s, [{ text: "Needs strengthening: ", options: { bold: true, color: "C0641A" } }, { text: "collaborative tools (2.94) and practical accounting software (2.93) scored lowest." }],
      { x: 4.5, y: 5.9, w: 8.23, h: 0.45, fontSize: 14, name: "Takeaway" });
    cite(s, "Table 3.1");
  }
  {
    const s = content("Results", "Results · Test of relationship", "Strong, significant relationship: r = .67", "corr");
    // illustrative scatter matching r = .67 (not the respondents' raw data)
    let seed = 21; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const g = () => { let a = 0; for (let i = 0; i < 6; i++) a += r(); return a - 3; };
    const xs = [], ys = [];
    for (let i = 0; i < 88; i++) { const zx = g() * 0.7, zy = 0.67 * zx + Math.sqrt(1 - 0.67 * 0.67) * g() * 0.7; xs.push(+(3.0 + zx * 0.45).toFixed(2)); ys.push(+(3.24 + zy * 0.4).toFixed(2)); }
    s.addChart(pres.charts.SCATTER, [{ name: "Exposure", values: xs }, { name: "Competencies", values: ys }], {
      x: 0.6, y: 1.9, w: 6.4, h: 4.6, objectName: "Correlation scatter",
      lineSize: 0, lineDataSymbol: "circle", lineDataSymbolSize: 7, chartColors: [HEX.accent1],
      showTitle: true, title: "Illustration of r = .67 (not respondent data)", titleFontSize: 12, titleColor: HEX.accent6, titleFontFace: "+mn-lt",
      valAxisTitle: "Multidimensional competencies", showValAxisTitle: true, valAxisTitleFontSize: 11, valAxisTitleColor: HEX.accent6, valAxisTitleFontFace: "+mn-lt",
      catAxisTitle: "Technology-integrated accounting education", showCatAxisTitle: true, catAxisTitleFontSize: 11, catAxisTitleColor: HEX.accent6, catAxisTitleFontFace: "+mn-lt",
      valAxisMinVal: 2, valAxisMaxVal: 4, catAxisMinVal: 1.8, catAxisMaxVal: 4.2,
      valAxisLabelColor: HEX.accent6, catAxisLabelColor: HEX.accent6, valAxisLabelFontSize: 10, catAxisLabelFontSize: 10, valAxisLabelFontFace: "+mn-lt", catAxisLabelFontFace: "+mn-lt",
      valGridLine: { color: "E3E8F4", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false,
    });
    const st = [["r = .67", "strong, positive"], ["p < .001", "significant"], ["r² = .44", "44% shared variance"]];
    for (let i = 0; i < 3; i++) {
      const x = 7.35 + i * 1.83;
      card(s, x, 1.95, 1.7, 1.35);
      T(s, [{ text: st[i][0], options: { bold: true, fontSize: 22, color: C.text2, fontFace: THEME.headFontFace, breakLine: true } }, { text: st[i][1], options: { fontSize: 11, color: C.accent6 } }],
        { x, y: 1.95, w: 1.7, h: 1.35, align: "center", valign: "middle", name: "Statistic" });
    }
    card(s, 7.35, 3.55, 5.38, 1.75);
    T(s, "H₀", { x: 7.6, y: 3.55, w: 1.0, h: 1.75, valign: "middle", bold: true, fontSize: 40, color: C.accent1, fontFace: THEME.headFontFace, name: "H0" });
    T(s, "No significant relationship between technology-integrated accounting education and multidimensional competencies.", { x: 8.6, y: 3.65, w: 2.6, h: 1.55, valign: "middle", fontSize: 13, name: "Hypothesis" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 11.2, y: 4.1, w: 1.4, h: 0.62, rectRadius: 0.06, fill: { color: C.background1 }, line: { color: C.accent4, width: 2.5 }, rotate: -8, objectName: "Rejected stamp" });
    T(s, "REJECTED", { x: 11.2, y: 4.1, w: 1.4, h: 0.62, align: "center", valign: "middle", bold: true, fontSize: 14, color: C.accent4, charSpacing: 1, rotate: -8, name: "Rejected" });
    card(s, 7.35, 5.55, 5.38, 0.8, { fill: C.background2, noShadow: true });
    await iconCircle(s, fa.FaScaleBalanced, 7.55, 5.65, 0.6, C.background1, HEX.accent6, "Association");
    T(s, "An association, not proof of cause", { x: 8.35, y: 5.55, w: 4.2, h: 0.8, valign: "middle", bold: true, fontSize: 15, color: C.accent6, name: "Caution" });
    cite(s, "Table 3.2 · Pearson product-moment correlation, n = 88");
  }
  {
    const s = content("Results", "Results · Interviews", "Technology made studying faster and more independent", "voices");
    const qs = [["It also has made information accessible at the palm of your hands, making it easier to search for topics that you may not yet have understood.", "PARTICIPANT 3"],
      ["As a student, I mainly used technology to access learning materials, watch online lectures, answer practice questions… It helped me study independently and manage my time more efficiently.", "PARTICIPANT 6"]];
    for (let i = 0; i < 2; i++) {
      const x = 0.6 + i * 6.2;
      card(s, x, 1.95, 5.93, 3.0);
      s.addImage({ data: await iconPng(fa.FaQuoteLeft, HEX.accent3), x: x + 0.3, y: 2.15, w: 0.55, h: 0.55, altText: "Quote", objectName: nm("Quote mark") });
      T(s, qs[i][0], { x: x + 0.3, y: 2.8, w: 5.33, h: 1.6, italic: true, fontSize: 16, name: "Quote" });
      T(s, qs[i][1], { x: x + 0.3, y: 4.45, w: 5.33, h: 0.3, bold: true, fontSize: 12, color: C.accent1, charSpacing: 2, name: "Speaker" });
    }
    T(s, "KEY THEMES", { x: 0.6, y: 5.2, w: 4, h: 0.3, bold: true, fontSize: 12, color: C.accent1, charSpacing: 3, name: "Themes label" });
    const themes = [["Technology-assisted independent learning & efficiency", 4.1], ["Applicability of foundational knowledge", 3.3], ["Internship as a reinforcement", 2.55], ["Technology-driven task readiness", 2.75], ["Technology-supported collaboration", 2.85]];
    let x = 0.6, y = 5.6;
    for (const [t, w] of themes) {
      if (x + w > 12.75) { x = 0.6; y += 0.6; }
      const hi = t.startsWith("Internship");
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.45, rectRadius: 0.22, fill: { color: hi ? "FFF6DA" : C.background2 }, line: { color: hi ? HEX.accent3 : LINE, width: hi ? 1.5 : 1 }, objectName: nm("Theme") });
      T(s, t, { x, y, w, h: 0.45, align: "center", valign: "middle", bold: true, fontSize: 12, name: "Theme text" });
      x += w + 0.2;
    }
  }

  // ================================================================ RECOMMENDATIONS
  pres.addSection({ title: "Recommendations" });
  {
    const s = content("Recommendations", "Recommendations", "Building technology-ready accountants", "recs");
    const cols = [[fa.FaGraduationCap, "Accounting students", C.accent1, ["Explore digital tools beyond the classroom", "Join internships, workshops, and online courses", "Regularly assess and improve your skills"]],
      [fa.FaChalkboardUser, "Educators", C.accent2, ["Spreadsheet exercises, simulations, and case-based activities", "Training on available technologies", "Practical assessments, not only written exams"]],
      [fa.FaBuildingColumns, "PLV administrators", C.text2, ["Accounting software and functional computer labs", "Faculty development", "Curriculum reviews with alumni and industry"]]];
    for (let i = 0; i < 3; i++) {
      const x = 0.6 + i * 4.18;
      card(s, x, 1.95, 3.85, 4.45);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.95, w: 3.85, h: 0.85, rectRadius: 0.12, fill: { color: cols[i][2] }, line: { color: cols[i][2] }, objectName: "Audience header" });
      await iconCircle(s, cols[i][0], x + 0.2, 2.05, 0.65, C.background1, i === 1 ? HEX.accent2 : i === 0 ? HEX.accent1 : HEX.dk2, cols[i][1]);
      T(s, cols[i][1], { x: x + 1.0, y: 1.95, w: 2.75, h: 0.85, valign: "middle", bold: true, fontSize: 18, color: C.background1, name: "Audience" });
      T(s, cols[i][3].map((b, j) => ({ text: b, options: { bullet: true, breakLine: j < 2 } })), { x: x + 0.25, y: 3.05, w: 3.35, h: 3.1, fontSize: 16, paraSpaceAfter: 10, name: "Recommendations" });
    }
  }
  {
    const s = pres.addSlide({ masterName: "Dark statement", sectionTitle: "Recommendations" });
    s.addText([{ text: "Beyond ", options: { color: C.background1 } }, { text: "Technical", options: { color: C.accent3 } }, { text: " Skills", options: { color: C.background1 } }], { placeholder: "title" });
    s.addText("The accountant of the future needs more than technical skills.", { placeholder: "body" });
    T(s, "Adversario  ·  Campo  ·  Dumigpe  ·  Larioque  ·  Orbase  ·  Silencio", { x: 0.8, y: 5.2, w: 11.73, h: 0.4, align: "center", fontSize: 14, color: C.accent3, name: "Authors" });
    T(s, "BS Accountancy · Pamantasan ng Lungsod ng Valenzuela", { x: 0.8, y: 5.7, w: 11.73, h: 0.35, align: "center", fontSize: 12, color: C.background2, name: "Affiliation" });
    s.addNotes((NOTES.outro || []).join("\n\n"));
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);

  // native linear trendline on the scatter (pptxgenjs has no option for it)
  const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(OUT));
  for (const f of Object.keys(zip.files).filter((f) => /^ppt\/charts\/chart\d+\.xml$/.test(f))) {
    let xml = await zip.file(f).async("string");
    if (!xml.includes("<c:scatterChart>")) continue;
    const tl = '<c:trendline><c:spPr><a:ln w="38100" cap="rnd"><a:solidFill><a:srgbClr val="F2B705"/></a:solidFill></a:ln></c:spPr><c:trendlineType val="linear"/><c:dispRSqr val="0"/><c:dispEq val="0"/></c:trendline>';
    xml = xml.replace("<c:xVal>", tl + "<c:xVal>");
    zip.file(f, xml);
  }
  // repack file entries only: folder entries stop some cloud services from opening the deck
  const clean = new JSZip();
  for (const [n, e] of Object.entries(zip.files)) if (!e.dir) clean.file(n, await e.async("nodebuffer"), { createFolders: false });
  fs.writeFileSync(OUT, await clean.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("wrote", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
