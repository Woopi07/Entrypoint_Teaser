"""Swaps the woopi character's head for the curly-hair + square-glasses look.
Usage: python3 restyle_char.py path/to/scene.html"""
import sys
p = sys.argv[1]; s = open(p).read()
old_start = "  mesh(new THREE.SphereGeometry(.34,28,20),skin,0,0,0,head);"
old_end = "  const smile=mesh(new THREE.TorusGeometry(.07,.016,6,16,Math.PI),dark,0,-.12,.31,head); smile.rotation.z=Math.PI;"
a = s.index(old_start); b = s.index(old_end) + len(old_end)
new = r'''  mesh(new THREE.SphereGeometry(.34,28,20),M(0xfff1e6),0,0,0,head).scale.set(1,1.04,.98);
  // curly hair: a cloud of black blobs over the top, back and sides, plus messy bangs
  const curl=M(0x141414,{roughness:.9}); let hs=17; const hr=()=>(hs=(hs*16807)%2147483647)/2147483647;
  for(let i=0;i<46;i++){ const th=hr()*Math.PI*2, ph=hr()*1.25; const r=.33+hr()*.05;
    const x=Math.sin(ph)*Math.cos(th)*r, y=.06+Math.cos(ph)*r*.95, z=Math.sin(ph)*Math.sin(th)*r;
    if(z>.18&&y<.2) continue; mesh(new THREE.SphereGeometry(.1+hr()*.05,14,10),curl,x*1.12,y,z*1.05-.02,head); }
  [[-.16,.24,.24,.11],[0,.28,.26,.12],[.15,.25,.24,.1],[-.27,.1,.18,.09],[.27,.1,.18,.09],[-.08,.2,.28,.07],[.1,.21,.28,.07],[-.33,-.06,.06,.08],[.33,-.06,.06,.08]]
    .forEach(([x,y,z,r])=>mesh(new THREE.SphereGeometry(r,14,10),curl,x,y,z,head));
  // eyes, brows, nose line, flat mouth
  [-.1,.1].forEach(x=>{ mesh(new THREE.CapsuleGeometry(.025,.035,4,8),dark,x,.0,.315,head); const br=mesh(new THREE.BoxGeometry(.08,.016,.02),dark,x,.1,.31,head); br.rotation.z=x<0?-.08:.08; });
  mesh(new THREE.BoxGeometry(.012,.07,.02),dark,0,-.07,.335,head);
  const smile=mesh(new THREE.BoxGeometry(.09,.014,.02),dark,0,-.17,.31,head);
  // blush marks: two little slanted lines on each cheek
  [-.19,.19].forEach(x=>[-.02,.02].forEach(dx=>{ const l=mesh(new THREE.BoxGeometry(.012,.045,.015),M(0xff8a7a),x+dx,-.08,.275,head); l.rotation.z=.4; }));
  // square glasses
  const fr=M(0x111111,{roughness:.4});
  [-.11,.11].forEach(x=>{ const sh=new THREE.Shape(); const w=.17,h=.12,r=.03; sh.moveTo(-w/2+r,-h/2); sh.lineTo(w/2-r,-h/2); sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r); sh.lineTo(w/2,h/2-r); sh.quadraticCurveTo(w/2,h/2,w/2-r,h/2); sh.lineTo(-w/2+r,h/2); sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r); sh.lineTo(-w/2,-h/2+r); sh.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const hole=new THREE.Path(); const iw=w-.04,ih=h-.04; hole.moveTo(-iw/2,-ih/2); hole.lineTo(iw/2,-ih/2); hole.lineTo(iw/2,ih/2); hole.lineTo(-iw/2,ih/2); hole.lineTo(-iw/2,-ih/2); sh.holes.push(hole);
    const g=mesh(new THREE.ExtrudeGeometry(sh,{depth:.02,bevelEnabled:false}),fr,x,.0,.33,head); g.castShadow=false; });
  mesh(new THREE.BoxGeometry(.05,.018,.02),fr,0,.03,.34,head);
  [-.2,.2].forEach(x=>{ const arm=mesh(new THREE.BoxGeometry(.015,.015,.28),fr,x,.02,.19,head); arm.rotation.y=x<0?-.25:.25; });'''
s = s[:a] + new + s[b:]
s = s.replace("const skin=M(0xffd6b5)", "const skin=M(0xfff1e6)")
open(p, 'w').write(s); print('restyled', p)
