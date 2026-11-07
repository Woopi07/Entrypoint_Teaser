// Adds a slide transition and entrance animations to one slide's XML (as written by pptxgenjs).
//
// Shapes are grouped into "beats": a shape drawn inside the previous container (a card and the
// icon and text on it), or a run of same-named shapes (a grid of dots), appears together.
// Beats build automatically one after another when the slide opens. Placeholders (slide titles)
// and navigation buttons ("Nav ..." shapes) are never animated, so links are always clickable.

const WIPE = /^(Need bar|Have bar|Meter|Practice area|Arrow|Spoke|Link)$/;
const ZOOM = /^(Respondents|Stat|Statistic|Overall mean|Rejected stamp|Stamp|Feedback badge|Question|Core|PLV seal)$/;
const BATCH = /^(Respondent|Spoke|Practice area|Theme|Theme text)$/;
const STEP = 300; // ms between beats
const DUR = 450;  // ms per effect

function shapesOf(xml) {
  const out = [];
  const re = /<p:(sp|pic|graphicFrame)>([\s\S]*?)<\/p:\1>/g;
  let m;
  while ((m = re.exec(xml))) {
    const body = m[2];
    const c = body.match(/<p:cNvPr id="(\d+)" name="([^"]*)"/);
    const g = body.match(/<a:off x="(-?\d+)" y="(-?\d+)"\s*\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/);
    if (!c || !g) continue;
    const [x, y, w, h] = g.slice(1).map(Number);
    out.push({
      kind: m[1], id: c[1], name: c[2], base: c[2].replace(/-\d+$/, ""),
      placeholder: /<p:ph\b/.test(body), x, y, w, h,
    });
  }
  return out;
}

const inside = (s, r) => {
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  return cx > r.x && cx < r.x + r.w && cy > r.y && cy < r.y + r.h && s.w * s.h < r.w * r.h;
};

function beatsOf(shapes) {
  const beats = [];
  for (const s of shapes) {
    if (s.placeholder || /^Nav/.test(s.base)) continue;
    const b = beats[beats.length - 1];
    const prev = b && b.items[b.items.length - 1];
    if (b && (inside(s, b.items[0]) || (prev.base === s.base && BATCH.test(s.base)))) b.items.push(s);
    else beats.push({ items: [s] });
  }
  return beats;
}

function effect(shape, kind, delay, ids, nodeType) {
  const sp = `<p:tgtEl><p:spTgt spid="${shape.id}"/></p:tgtEl>`;
  const show = `<p:set><p:cBhvr><p:cTn id="${ids.next()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>${sp}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`;
  let preset, body;
  if (kind === "wipe") {
    preset = 'presetID="22" presetClass="entr" presetSubtype="8"';
    body = show + `<p:animEffect transition="in" filter="wipe(left)"><p:cBhvr><p:cTn id="${ids.next()}" dur="${DUR + 150}"/>${sp}</p:cBhvr></p:animEffect>`;
  } else if (kind === "zoom") {
    preset = 'presetID="53" presetClass="entr" presetSubtype="16"';
    const grow = (attr) => `<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="${ids.next()}" dur="${DUR}" fill="hold"/>${sp}<p:attrNameLst><p:attrName>${attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0"><p:val><p:fltVal val="0"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="#${attr}"/></p:val></p:tav></p:tavLst></p:anim>`;
    body = show + grow("ppt_w") + grow("ppt_h") + `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${ids.next()}" dur="${DUR}"/>${sp}</p:cBhvr></p:animEffect>`;
  } else {
    preset = 'presetID="10" presetClass="entr" presetSubtype="0"';
    body = show + `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${ids.next()}" dur="${DUR}"/>${sp}</p:cBhvr></p:animEffect>`;
  }
  const id = ids.next();
  return `<p:par><p:cTn id="${id}" ${preset} fill="hold" grpId="0" nodeType="${nodeType}"><p:stCondLst><p:cond delay="${delay}"/></p:stCondLst><p:childTnLst>${body}</p:childTnLst></p:cTn></p:par>`;
}

function animateSlide(xml, { sectionStart = false } = {}) {
  if (xml.includes("<p:timing>")) return xml; // already animated
  const transition = sectionStart
    ? '<p:transition spd="slow"><p:push dir="u"/></p:transition>'
    : '<p:transition spd="med"><p:fade/></p:transition>';
  const beats = beatsOf(shapesOf(xml));
  let timing = "";
  if (beats.length) {
    let n = 2;
    const ids = { next: () => ++n };
    // effects need ids after the root (1), main sequence (2) and the auto-start group (3)
    n = 3;
    let first = true;
    const groups = beats.map((b, k) => {
      const kind = WIPE.test(b.items[0].base) ? "wipe" : ZOOM.test(b.items[0].base) ? "zoom" : "fade";
      const gid = ids.next();
      const effects = b.items.map((s) => {
        const e = effect(s, kind, 0, ids, first ? "afterEffect" : "withEffect");
        first = false;
        return e;
      }).join("");
      return `<p:par><p:cTn id="${gid}" fill="hold"><p:stCondLst><p:cond delay="${k * STEP}"/></p:stCondLst><p:childTnLst>${effects}</p:childTnLst></p:cTn></p:par>`;
    }).join("");
    const bld = beats.flatMap((b) => b.items).map((s) =>
      s.kind === "sp" ? `<p:bldP spid="${s.id}" grpId="0" animBg="1"/>`
      : s.kind === "graphicFrame" ? `<p:bldGraphic spid="${s.id}" grpId="0"><p:bldAsOne/></p:bldGraphic>` : "").join("");
    timing = `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>`
      + `<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>`
      + `<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>${groups}</p:childTnLst></p:cTn></p:par>`
      + `</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>`
      + `<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>`
      + `</p:childTnLst></p:cTn></p:par></p:tnLst>${bld ? `<p:bldLst>${bld}</p:bldLst>` : ""}</p:timing>`;
  }
  const anchor = "<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>";
  if (!xml.includes(anchor)) throw new Error("slide has no clrMapOvr to anchor the transition after");
  return xml.replace(anchor, anchor + transition + timing);
}

// pptxgenjs puts a link on every text run as well as on the shape, which underlines the text and
// recolors it. The shape-level link (in p:cNvPr) already makes the whole box clickable, so drop the run-level ones.
function stripRunLinks(xml) {
  return xml.replace(/<a:rPr\b[^>]*>[\s\S]*?<\/a:rPr>/g, (rpr) =>
    rpr.replace(/<a:hlinkClick\b[^>]*?\/>|<a:hlinkClick\b[^>]*?>[\s\S]*?<\/a:hlinkClick>/g, ""));
}

module.exports = { animateSlide, beatsOf, shapesOf, stripRunLinks };
