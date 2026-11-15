import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

const WW=1080,HH=1920;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
const lerp=(a,b,p)=>a+(b-a)*p;
function rng(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
const V=(x,y,z)=>new THREE.Vector3(x,y,z);

const glc=document.createElement('canvas');glc.width=WW;glc.height=HH;
const renderer=new THREE.WebGLRenderer({canvas:glc,antialias:true,preserveDrawingBuffer:true});
renderer.setSize(WW,HH,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,WW/HH,0.05,400);scene.add(camera);
const composer=new EffectComposer(renderer);composer.setSize(WW,HH);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),0.55,0.45,0.72);composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------- toon kit ---------- */
const grad=(()=>{const d=new Uint8Array([70,70,70,255,150,150,150,255,215,215,215,255,255,255,255,255]);const t=new THREE.DataTexture(d,4,1);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t})();
const toon=(c,o={})=>new THREE.MeshToonMaterial({color:c,gradientMap:grad,...o});
const inkM=new THREE.MeshBasicMaterial({color:0x2a1840,side:THREE.BackSide});
function ink(mesh,th=.035){const o=new THREE.Mesh(mesh.geometry,inkM);o.scale.setScalar(1+th);mesh.add(o);return mesh}
function inkAbs(mesh,w=.02){ // outline by normal push for non-uniform shapes
 const m=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{w:{value:w}},vertexShader:`uniform float w;void main(){vec3 p=position+normal*w;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`void main(){gl_FragColor=vec4(.165,.094,.25,1.);}`});
 const o=new THREE.Mesh(mesh.geometry,m);mesh.add(o);return mesh}
const glowM=c=>new THREE.MeshBasicMaterial({color:c});
const PERM=new Uint8Array(512);{const p=[...Array(256).keys()];const r=rng(3);for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}for(let i=0;i<512;i++)PERM[i]=p[i&255]}
const fd=t=>t*t*t*(t*(t*6-15)+10),nl=(t,a,b)=>a+t*(b-a);
function gr(h,x,y,z){h&=15;const u=h<8?x:y,v=h<4?y:(h==12||h==14?x:z);return((h&1)?-u:u)+((h&2)?-v:v)}
function noise(x,y,z){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=fd(x),v=fd(y),w=fd(z),P=PERM;
 const A=P[X]+Y,AA=P[A]+Z,AB=P[A+1]+Z,B=P[X+1]+Y,BA=P[B]+Z,BB=P[B+1]+Z;
 return nl(w,nl(v,nl(u,gr(P[AA],x,y,z),gr(P[BA],x-1,y,z)),nl(u,gr(P[AB],x,y-1,z),gr(P[BB],x-1,y-1,z))),nl(v,nl(u,gr(P[AA+1],x,y,z-1),gr(P[BA+1],x-1,y,z-1)),nl(u,gr(P[AB+1],x,y-1,z-1),gr(P[BB+1],x-1,y-1,z-1))))}

/* ================= SKY ================= */
const skyU={top:{value:new THREE.Color()},mid:{value:new THREE.Color()},bot:{value:new THREE.Color()}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(180,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:skyU,
 vertexShader:`varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform vec3 top,mid,bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.?mix(mid,top,pow(clamp(h*1.6,0.,1.),.8)):mix(mid,bot,clamp(-h*3.,0.,1.));gl_FragColor=vec4(c,1.);}`}));
scene.add(sky);
const starG=new THREE.BufferGeometry();{const r=rng(8),a=[];for(let i=0;i<900;i++){const t=r()*6.283,p=Math.acos(r()*.9);a.push(Math.sin(p)*Math.cos(t)*170,Math.cos(p)*170,Math.sin(p)*Math.sin(t)*170)}starG.setAttribute('position',new THREE.Float32BufferAttribute(a,3))}
const stars=new THREE.Points(starG,new THREE.PointsMaterial({color:0xfff6d8,size:2.2,sizeAttenuation:false,transparent:true}));scene.add(stars);
function setSky(a,b,c,st=0){skyU.top.value.setHex(a);skyU.mid.value.setHex(b);skyU.bot.value.setHex(c);stars.material.opacity=st;sky.visible=stars.visible=true}
function lerpSky(A,B,p,st){const t=new THREE.Color(A[0]).lerp(new THREE.Color(B[0]),p),m=new THREE.Color(A[1]).lerp(new THREE.Color(B[1]),p),b=new THREE.Color(A[2]).lerp(new THREE.Color(B[2]),p);skyU.top.value.copy(t);skyU.mid.value.copy(m);skyU.bot.value.copy(b);stars.material.opacity=st;sky.visible=stars.visible=true}
const DUSK=[0x6b46c9,0xff9ec4,0xffc7a0],NIGHT=[0x120c3a,0x3a2c7a,0x4b3a8c],DREAM=[0x3b1f78,0xb07ad8,0xf3a6d6],HERO=[0x2a1a6e,0xc77ddc,0xffb6a0];

/* ================= MIND WORLD ================= */
const world=new THREE.Group();scene.add(world);
const hemi=new THREE.HemisphereLight(0xffd9f0,0x3a2a6a,1.1);world.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0e0,1.6);sun.position.set(-6,12,8);world.add(sun);
const pinkL=new THREE.PointLight(0xff7ac0,6,18,1.4);pinkL.position.set(-4,3,-4);world.add(pinkL);
const tealL=new THREE.PointLight(0x43d9f5,6,18,1.4);tealL.position.set(4,3,-6);world.add(tealL);
const ground=new THREE.Mesh(new THREE.CircleGeometry(60,64),toon(0x4b2f86));ground.rotation.x=-Math.PI/2;world.add(ground);
function foldHill(x,z,r,h,c,seed){const g=new THREE.SphereGeometry(1,96,64);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const vx=p.getX(i),vy=p.getY(i),vz=p.getZ(i);const n=noise(vx*2.6+seed,vy*2.6,vz*2.6+seed);const groove=Math.pow(1-Math.min(1,Math.abs(n)*4),2);const k=1-.09*groove;p.setXYZ(i,vx*k,vy*k,vz*k)}
 g.computeVertexNormals();const m=new THREE.Mesh(g,toon(c));m.scale.set(r,h,r);m.position.set(x,0,z);inkAbs(m,.012);world.add(m);return m}
const HILLS=[[0,-7,4.2,3.0,0xf4a6c8],[-6.5,-10,3.4,2.4,0xb79cf0],[5.5,-4,2.6,1.7,0xffc6a5],[-4,-2.5,2.2,1.4,0xffa9d0],[2,-14,4,2.8,0xc9a6ff],[-10,-16,4.5,3.2,0xf4a6c8],[9,-15,3.5,2.2,0xb79cf0]];
HILLS.forEach((h,i)=>foldHill(...h,i*3.1));
// neuron trees
const TREES=[];const bulbOn=new THREE.Color(0xffe27a),bulbOn2=new THREE.Color(0x7af7ff),bulbOff=new THREE.Color(0x3b2f63);
{const r=rng(31);const spots=[[0,3.0,-7],[-1.8,2.6,-6.2],[1.9,2.5,-6.4],[-6.5,2.4,-10],[5.5,1.7,-4],[-4,1.4,-2.5],[2,2.8,-14],[-10,3.1,-16],[9,2.2,-15],[3.4,2.0,-12.4],[-8,2.2,-9.2],[-1,2.7,-12.8]];
 spots.forEach(([x,y,z],k)=>{const T=new THREE.Group();T.position.set(x,y-.15,z);const h=1.2+r()*.9;
  const tr=new THREE.CatmullRomCurve3([V(0,0,0),V((r()-.5)*.3,h*.5,(r()-.5)*.3),V(0,h,0)]);const trunk=new THREE.Mesh(new THREE.TubeGeometry(tr,16,.09,10),toon(0x3fb7c9));inkAbs(trunk,.02);T.add(trunk);
  const bulbs=[];for(let b=0;b<6;b++){const a=b/6*6.283+r(),el=.5+r()*.6,L=.5+r()*.45;const tip=V(Math.cos(a)*L,h+el*.6,Math.sin(a)*L);
   const br=new THREE.CatmullRomCurve3([V(0,h,0),V(Math.cos(a)*L*.5,h+el*.45,Math.sin(a)*L*.5),tip]);const bm=new THREE.Mesh(new THREE.TubeGeometry(br,10,.045,8),toon(0x3fb7c9));inkAbs(bm,.015);T.add(bm);
   const bulb=new THREE.Mesh(new THREE.SphereGeometry(.12,16,12),new THREE.MeshBasicMaterial({color:0xffe27a}));bulb.position.copy(tip);T.add(bulb);bulbs.push({m:bulb,c:(k+b)%3?bulbOn:bulbOn2,ph:r()*6})}
  const top=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),toon(0x3fb7c9));top.position.y=h;T.add(top);
  world.add(T);TREES.push({T,bulbs,x})})}
// glowing paths + pulses
const PATHS=[];{const pairs=[[0,1],[0,2],[1,5],[2,4],[0,6],[3,1],[6,9],[3,10],[6,11],[8,9]];
 pairs.forEach(([a,b])=>{const A=TREES[a].T.position,B=TREES[b].T.position;const mid=A.clone().lerp(B,.5);mid.y+=1.2;const c=new THREE.QuadraticBezierCurve3(A.clone().add(V(0,.2,0)),mid,B.clone().add(V(0,.2,0)));
  const m=new THREE.Mesh(new THREE.TubeGeometry(c,30,.035,6),new THREE.MeshBasicMaterial({color:0x7af7ff,transparent:true,opacity:.75}));world.add(m);
  const ps=[0,1,2].map(()=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.08,10,8),new THREE.MeshBasicMaterial({color:0xfff2a8}));world.add(s);return s});PATHS.push({c,m,ps})})}
// clouds
const CLOUDS=[];function cloud(x,y,z,s){const g=new THREE.Group();const r=rng(Math.floor(x*13+z*7+100));for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.5+r()*.45,24,16),toon(0xffffff,{emissive:0x8a78c8,emissiveIntensity:.55}));m.position.set((i-3)*.55+r()*.2,r()*.35+(i%2)*.15,r()*.4);ink(m,.04);g.add(m)}g.position.set(x,y,z);g.scale.setScalar(s);world.add(g);CLOUDS.push(g);return g}
[[-7,7,-13,1.4],[3,9,-20,1.8],[-3,9,-24,2],[-11,5,-6,1.2],[10,10,-24,2.2],[-14,8,-18,1.8]].forEach(c=>cloud(...c));
// lanterns
const LANT=[];{const r=rng(77);for(let i=0;i<34;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.07+r()*.06,10,8),new THREE.MeshBasicMaterial({color:r()<.5?0xffd36e:0xff9be0}));m.userData={b:V((r()-.5)*24,1+r()*6,-r()*22+2),ph:r()*6};world.add(m);LANT.push(m)}}
// seahorse memory tower (hippocampus = "seahorse")
const tower=new THREE.Group();tower.position.set(6.8,0,-9.5);world.add(tower);const TW={windows:[]};
{const pts=[V(.35,.25,0),V(.62,.42,0),V(.55,.75,0),V(.22,.7,0),V(.05,1.0,0),V(-.08,1.6,0),V(.1,2.3,0),V(.42,3.0,0),V(.42,3.8,0),V(.12,4.4,0),V(-.12,4.85,0),V(-.02,5.3,0),V(.25,5.5,0)];
 const cv=new THREE.CatmullRomCurve3(pts);const prof=u=>u<.25?.1+u*.6:u<.72?.25+Math.sin((u-.25)/.47*Math.PI)*.5:u<.86?.36:.36+Math.sin((u-.86)/.14*Math.PI)*.16;
 const goldT=toon(0xffb547),ringT=toon(0xe8892e);for(let i=0;i<=90;i++){const u=i/90,p=cv.getPoint(u),s=new THREE.Mesh(new THREE.SphereGeometry(prof(u),20,14),goldT);s.position.copy(p);tower.add(s)}
 for(let i=0;i<14;i++){const u=.3+i*.035,p=cv.getPoint(u),t=cv.getTangent(u);const rg=new THREE.Mesh(new THREE.TorusGeometry(prof(u)*1.0,.035,8,28),ringT);rg.position.copy(p);rg.lookAt(p.clone().add(t));tower.add(rg)}
 const hp=cv.getPoint(.97);const sn=new THREE.Mesh(new THREE.CylinderGeometry(.08,.15,1.0,14),goldT);sn.position.set(hp.x+.62,hp.y-.12,0);sn.rotation.z=Math.PI/2+.25;inkAbs(sn,.02);tower.add(sn);
 const tip=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),goldT);tip.position.set(hp.x+1.1,hp.y-.24,0);tower.add(tip);
 for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.07,.32,8),ringT);c.position.set(hp.x-.2+i*.08,hp.y+.38+Math.sin(i)*.04,(i-2)*.07);c.rotation.z=.3-i*.12;tower.add(c)}
 for(let i=0;i<9;i++){const u=.36+i*.045,p=cv.getPoint(u),t=cv.getTangent(u);const n=V(-t.y,t.x,0);const sp=new THREE.Mesh(new THREE.ConeGeometry(.08,.26,8),ringT);sp.position.copy(p).add(n.clone().multiplyScalar(prof(u)*.95));sp.quaternion.setFromUnitVectors(V(0,1,0),n);tower.add(sp)}
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),toon(0xffffff));eye.position.set(hp.x+.1,hp.y+.05,.3);ink(eye,.08);tower.add(eye);const pu=new THREE.Mesh(new THREE.SphereGeometry(.085,12,8),toon(0x2a1840));pu.position.set(hp.x+.16,hp.y+.05,.42);tower.add(pu);
 const finS=new THREE.Shape();finS.moveTo(0,0);for(let i=0;i<=8;i++){const a=Math.PI*.5+i/8*Math.PI*.7;finS.lineTo(Math.cos(a)*.75,Math.sin(a)*.75*.9)}finS.lineTo(0,0);
 const fin=new THREE.Mesh(new THREE.ShapeGeometry(finS),toon(0xff9d5c,{side:THREE.DoubleSide,transparent:true,opacity:.9}));fin.position.copy(cv.getPoint(.55)).add(V(-.35,0,0));fin.rotation.z=.4;tower.add(fin);
 for(let i=0;i<8;i++){const u=.4+i*.04,p=cv.getPoint(u);const w=new THREE.Mesh(new THREE.BoxGeometry(.18,.24,.05),new THREE.MeshBasicMaterial({color:0xfff0a0}));w.position.copy(p).add(V(.05,0,prof(u)*.97));tower.add(w);TW.windows.push(w)}
 const door=new THREE.Mesh(new THREE.CircleGeometry(.26,24),new THREE.MeshBasicMaterial({color:0xfff6c8}));door.position.copy(cv.getPoint(.5)).add(V(.1,0,prof(.5)+.03));tower.add(door);TW.door=door;
 tower.scale.setScalar(1.05);}
// flying pages
const PAGES=[];{const r=rng(55);const pt=document.createElement('canvas');pt.width=64;pt.height=80;const x=pt.getContext('2d');x.fillStyle='#fffaf0';x.fillRect(0,0,64,80);x.fillStyle='#b9a6e8';for(let i=0;i<6;i++)x.fillRect(8,10+i*11,48-(i%3)*10,4);const tex=new THREE.CanvasTexture(pt);tex.colorSpace=THREE.SRGBColorSpace;
 for(let i=0;i<40;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.32,.4),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true}));m.userData={src:V(-2+r()*6,1+r()*4,-2-r()*8),ph:r(),sp:r()};world.add(m);PAGES.push(m)}}
const sparkG=new THREE.BufferGeometry();sparkG.setAttribute('position',new THREE.BufferAttribute(new Float32Array(40*12*3),3));
const sparks=new THREE.Points(sparkG,new THREE.PointsMaterial({color:0xffe9a8,size:7,sizeAttenuation:false,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sparks.frustumCulled=false;world.add(sparks);
// dream props
const dreamG=new THREE.Group();scene.add(dreamG);const DRM={clocks:[],frames:[]};
function iconTex(kind){const c=document.createElement('canvas');c.width=256;c.height=200;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,200);g.addColorStop(0,'#ffd6ec');g.addColorStop(1,'#c7b2ff');x.fillStyle=g;x.fillRect(0,0,256,200);
 x.strokeStyle='#3a2470';x.lineWidth=7;x.lineCap='round';x.lineJoin='round';x.fillStyle='#fffaf0';
 if(kind==='cup'){x.beginPath();x.moveTo(88,80);x.lineTo(98,150);x.lineTo(156,150);x.lineTo(166,80);x.closePath();x.fill();x.stroke();x.beginPath();x.arc(170,112,18,-1.4,1.4);x.stroke();x.beginPath();x.moveTo(112,66);x.quadraticCurveTo(122,50,112,36);x.moveTo(138,66);x.quadraticCurveTo(148,50,138,36);x.stroke()}
 if(kind==='win'){x.fillStyle='#2b2a6e';x.fillRect(78,40,100,120);x.strokeRect(78,40,100,120);x.beginPath();x.moveTo(128,40);x.lineTo(128,160);x.moveTo(78,100);x.lineTo(178,100);x.stroke();x.fillStyle='#fff3b0';x.beginPath();x.arc(152,66,10,0,7);x.fill()}
 if(kind==='book'){x.beginPath();x.moveTo(128,62);x.quadraticCurveTo(100,50,66,60);x.lineTo(66,146);x.quadraticCurveTo(100,136,128,148);x.quadraticCurveTo(156,136,190,146);x.lineTo(190,60);x.quadraticCurveTo(156,50,128,62);x.closePath();x.fill();x.stroke();x.beginPath();x.moveTo(128,62);x.lineTo(128,148);x.stroke()}
 if(kind==='cat'){x.beginPath();x.arc(128,110,40,0,7);x.fill();x.stroke();x.beginPath();x.moveTo(96,84);x.lineTo(100,52);x.lineTo(118,74);x.moveTo(160,84);x.lineTo(156,52);x.lineTo(138,74);x.stroke();x.fillStyle='#3a2470';x.beginPath();x.arc(114,106,5,0,7);x.arc(142,106,5,0,7);x.fill()}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
{const r=rng(12);
 for(let k=0;k<5;k++){const g=new THREE.Group();const rad=.35+r()*.22;const ring=new THREE.Mesh(new THREE.TorusGeometry(rad,.06,12,40),toon(0xffc24a));ink(ring,.05);g.add(ring);
  g.add(new THREE.Mesh(new THREE.CircleGeometry(rad,40),toon(0xfff6e0,{side:THREE.DoubleSide})));
  const hh=new THREE.Group(),mh=new THREE.Group();const H1=new THREE.Mesh(new THREE.BoxGeometry(.05,rad*.5,.03),toon(0x3a2470));H1.position.set(0,rad*.25,.02);hh.add(H1);const H2=new THREE.Mesh(new THREE.BoxGeometry(.035,rad*.75,.03),toon(0x3a2470));H2.position.set(0,rad*.37,.03);mh.add(H2);g.add(hh,mh);
  for(let h=0;h<12;h++){const d=new THREE.Mesh(new THREE.CircleGeometry(.025,8),toon(0x3a2470));const a=h/12*6.283;d.position.set(Math.cos(a)*rad*.8,Math.sin(a)*rad*.8,.01);g.add(d)}
  g.scale.setScalar(.7);g.userData={hh,mh,b:V((r()*2-1)*1.9,2.6+(r()*2-1)*1.7,-1.5-r()*3),sp:.6+r()*1.5,ph:r()*6};dreamG.add(g);DRM.clocks.push(g)}
 ['cup','win','book','cat'].forEach((k,i)=>{const g=new THREE.Group();const fr=new THREE.Mesh(new THREE.BoxGeometry(.98,.8,.06),toon(0xffc24a));ink(fr,.03);g.add(fr);const pic=new THREE.Mesh(new THREE.PlaneGeometry(.84,.66),new THREE.MeshBasicMaterial({map:iconTex(k),transparent:true}));pic.position.z=.035;g.add(pic);
  g.scale.setScalar(.75);g.userData={b:V(-1.5+i*1.0,1.3+(i%2)*1.9,-1.2-(i%3)*.8),ph:i*1.7,pic};dreamG.add(g);DRM.frames.push(g)})}
// sky wave beads (scene 3, camera space)
const beads=new THREE.InstancedMesh(new THREE.SphereGeometry(.012,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),90);beads.frustumCulled=false;camera.add(beads);
{const c=new THREE.Color();for(let i=0;i<90;i++){c.setHex(0x7af7ff).lerp(new THREE.Color(0xc59cff),i/89);beads.setColorAt(i,c)}}
// walking path for mascot (camera space)
const walkPath=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-1,0,0),V(0,-.02,0),V(1,.01,0)]),30,.012,8),new THREE.MeshBasicMaterial({color:0x7af7ff}));camera.add(walkPath);

/* ================= MASCOT (toon) ================= */
const mGold=toon(0xffc94f),mDark=toon(0x2a1840),mWhite=toon(0xffffff),mCyan=new THREE.MeshBasicMaterial({color:0x43d9f5}),mBrow=toon(0x7a4a14);
const mascot=(()=>{const G=new THREE.Group(),B=new THREE.Group();G.add(B);
 const body=new THREE.Mesh(new THREE.SphereGeometry(.5,48,32),mGold);ink(body,.05);B.add(body);
 const F=new THREE.Group();B.add(F);const eyes=[];
 [-1,1].forEach(s=>{const e=new THREE.Group();e.position.set(s*.18,.07,.4);const w=new THREE.Mesh(new THREE.SphereGeometry(.15,24,16),mWhite);w.scale.set(1,1.2,.6);e.add(w);
  const p=new THREE.Mesh(new THREE.SphereGeometry(.085,20,14),mDark);p.scale.set(1,1.15,.5);p.position.set(0,-.01,.07);e.add(p);const ir=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),mCyan);ir.position.set(.025,.03,.115);e.add(ir);
  F.add(e);eyes.push(e)});
 const brows=[-1,1].map(s=>{const b=new THREE.Mesh(new THREE.CapsuleGeometry(.022,.1,4,8),mBrow);b.rotation.z=Math.PI/2+s*.2;b.position.set(s*.18,.3,.42);F.add(b);return b});
 const mouth=new THREE.Mesh(new THREE.TorusGeometry(.085,.022,10,24,Math.PI),mDark);mouth.rotation.z=Math.PI;mouth.position.set(0,-.13,.46);F.add(mouth);
 const mouthO=new THREE.Mesh(new THREE.SphereGeometry(.06,16,12),mDark);mouthO.scale.set(1,1.3,.4);mouthO.position.set(0,-.17,.46);F.add(mouthO);
 [-1,1].forEach(s=>{const ch=new THREE.Mesh(new THREE.CircleGeometry(.06,16),new THREE.MeshBasicMaterial({color:0xff8fb0,transparent:true,opacity:.7}));ch.position.set(s*.3,-.06,.41);ch.rotation.y=s*.6;F.add(ch)});
 const tips=[];for(let k=0;k<5;k++){const a=-1+k*.5;const base=V(Math.sin(a)*.42,Math.cos(a)*.42,-.05),mid=V(Math.sin(a)*.62,Math.cos(a)*.7,-.05),tip=V(Math.sin(a*1.15)*.78,Math.cos(a*1.15)*.95,-.05);
  const br=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([base,mid,tip]),12,.035,8),mGold);inkAbs(br,.015);B.add(br);
  const t=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),mCyan);t.position.copy(tip);B.add(t);tips.push(t)}
 const limb=(len,r)=>{const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,12),mGold);inkAbs(m,.015);m.position.y=-len/2;g.add(m);return g};
 const arm=s=>{const sh=new THREE.Group();sh.position.set(s*.44,-.05,0);sh.add(limb(.2,.05));const el=new THREE.Group();el.position.y=-.24;sh.add(el);el.add(limb(.18,.045));
  const h=new THREE.Mesh(new THREE.SphereGeometry(.075,16,12),mGold);ink(h,.08);h.position.y=-.25;el.add(h);B.add(sh);return{sh,el}};
 const leg=s=>{const hp=new THREE.Group();hp.position.set(s*.17,-.44,0);hp.add(limb(.16,.055));const kn=new THREE.Group();kn.position.y=-.2;hp.add(kn);kn.add(limb(.14,.05));
  const ft=new THREE.Mesh(new THREE.SphereGeometry(.08,16,12),mGold);ft.scale.set(1.2,.6,1.7);ft.position.set(0,-.21,.05);ink(ft,.08);kn.add(ft);B.add(hp);return{hp,kn}};
 return{G,B,F,eyes,brows,mouth,mouthO,tips,aL:arm(-1),aR:arm(1),lL:leg(-1),lR:leg(1)}})();
const mScene=new THREE.Scene();const holder=new THREE.Group();mScene.add(holder);holder.add(mascot.G);
mScene.add(new THREE.HemisphereLight(0xffe6f4,0x5a3a9a,1.4));const mk=new THREE.DirectionalLight(0xffffff,1.8);mk.position.set(-2,3,3);holder.add(mk);mk.target.position.set(0,0,-4);holder.add(mk.target);
function screenToCam(sx,sy,depth){const th=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));return V((sx/270*2-1)*depth*th*camera.aspect,(1-sy/480*2)*depth*th,-depth)}
function poseMascot(tl,o){const m=mascot;m.G.visible=true;const depth=4;m.G.position.copy(screenToCam(o.x,o.y,depth));
 m.G.scale.setScalar(.21*(o.s||1)*Math.tan(THREE.MathUtils.degToRad(17.5))/Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
 const walk=o.walk,fl=o.float;m.B.position.y=walk?Math.abs(Math.sin(tl*8))*.07:Math.sin(tl*2.2)*.04+(fl?Math.sin(tl*1.2)*.12:0);
 m.B.scale.set(1+Math.sin(tl*4.4)*.015,1-Math.sin(tl*4.4)*.015,1);
 m.G.rotation.set(fl?Math.sin(tl*.9)*.1:0,o.turn??0,fl?Math.sin(tl*.7)*.08:0);
 const lx=(o.look||[0,0])[0],ly=(o.look||[0,0])[1];m.F.rotation.set(-ly*.3,lx*.45,0);
 const sw=walk?Math.sin(tl*8)*.6:fl?Math.sin(tl*1.5)*.3:0;
 m.lL.hp.rotation.x=sw;m.lR.hp.rotation.x=-sw;m.lL.kn.rotation.x=walk?Math.max(0,-Math.sin(tl*8))*.9:fl?.35:0;m.lR.kn.rotation.x=walk?Math.max(0,Math.sin(tl*8))*.9:fl?.35:0;
 const setArm=(a,s,mode)=>{let z=s*.3,x=walk?(s>0?-sw:sw)*.5:Math.sin(tl*2)*.06,ez=s*.15;
  if(mode==='wave'){z=s*2.55;ez=s*(.35+Math.sin(tl*8)*.5);x=0}else if(mode==='point'){z=s*1.55;ez=s*.05;x=0}else if(mode==='open'){z=s*(1.1+Math.sin(tl*2.5)*.12);ez=s*.3;x=0}
  a.sh.rotation.set(x,0,z);a.el.rotation.set(0,0,ez)};
 setArm(m.aL,-1,o.armL);setArm(m.aR,1,o.armR);
 const bl=((tl+(o.bs||0))%3.4)<.12?.1:1;m.eyes.forEach(e=>e.scale.y=bl);
 const mood=o.mood||'smile';m.mouth.visible=mood!=='o';m.mouthO.visible=mood==='o';m.mouth.scale.set(mood==='big'?1.35:1,mood==='flat'?.2:mood==='big'?1.35:1,1);
 const sad=mood==='flat';m.brows.forEach((b,i)=>{b.position.y=sad?.27:mood==='o'?.33:.3;b.rotation.z=Math.PI/2+(i?1:-1)*(sad?-.3:.2)});
 m.tips.forEach((t,i)=>t.scale.setScalar(.85+.3*Math.sin(tl*4+i)))}

/* ================= CARTOON BEDROOM ================= */
const room=new THREE.Group();room.position.set(0,-80,0);scene.add(room);const RM={};
{
 room.add(new THREE.HemisphereLight(0x9fa8ff,0x2a1f55,.9));
 const moonL=new THREE.DirectionalLight(0xb8c8ff,1.0);moonL.position.set(1,4,-2);moonL.target.position.set(0,.5,0);room.add(moonL,moonL.target);
 const lamp=new THREE.PointLight(0xffb070,3,5,1.5);lamp.position.set(-1.25,1.1,-.7);room.add(lamp);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,14),toon(0x2a2260));floor.rotation.x=-Math.PI/2;room.add(floor);
 const wb=new THREE.Mesh(new THREE.PlaneGeometry(14,7),toon(0x3a3488));wb.position.set(0,3.5,-1.6);room.add(wb);
 const wl=new THREE.Mesh(new THREE.PlaneGeometry(14,7),toon(0x332d7a));wl.rotation.y=Math.PI/2;wl.position.set(-2.2,3.5,0);room.add(wl);
 // window with night sky
 const wc=document.createElement('canvas');wc.width=256;wc.height=320;{const x=wc.getContext('2d');const g=x.createLinearGradient(0,0,0,320);g.addColorStop(0,'#1b1660');g.addColorStop(1,'#5a3fa8');x.fillStyle=g;x.fillRect(0,0,256,320);x.fillStyle='#fff6d0';x.beginPath();x.arc(170,80,34,0,7);x.fill();x.fillStyle='#1b1660';x.beginPath();x.arc(186,70,30,0,7);x.fill();const r=rng(4);x.fillStyle='#fff';for(let i=0;i<40;i++){x.globalAlpha=.4+r()*.6;x.fillRect(r()*256,r()*240,2,2)}}
 const wt=new THREE.CanvasTexture(wc);wt.colorSpace=THREE.SRGBColorSpace;const win=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.6),new THREE.MeshBasicMaterial({map:wt}));win.position.set(.5,2.1,-1.58);room.add(win);
 const fm=toon(0xffd7a0);[[.5,2.92,1.42,.1],[.5,1.28,1.42,.1],[-.16,2.1,.1,1.7],[1.16,2.1,.1,1.7],[.5,2.1,.06,1.6],[.5,2.1,1.3,.06]].forEach(([x,y,w,h])=>{const f=new THREE.Mesh(new THREE.BoxGeometry(w,h,.08),fm);f.position.set(x,y,-1.55);room.add(f)});
 RM.curt=[];[-.45,1.45].forEach((x,k)=>{const g=new THREE.PlaneGeometry(.6,2.4,20,24);const c=new THREE.Mesh(g,toon(0xd59cf0,{side:THREE.DoubleSide}));c.position.set(x,1.95,-1.45);room.add(c);c.userData.base=Float32Array.from(g.attributes.position.array);RM.curt.push(c)});
 // bed
 const frame=new THREE.Mesh(new THREE.BoxGeometry(3,.45,1.9),toon(0x8a6ad8));frame.position.set(.1,.25,0);inkAbs(frame,.015);room.add(frame);
 const hb=new THREE.Mesh(new THREE.CapsuleGeometry(.12,1.6,6,12),toon(0x8a6ad8));hb.rotation.x=Math.PI/2;hb.position.set(-1.45,1.0,0);room.add(hb);
 const hbp=new THREE.Mesh(new THREE.BoxGeometry(.14,1.0,1.9),toon(0x7559c8));hbp.position.set(-1.45,.6,0);room.add(hbp);
 const pil=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),toon(0xd2c8f2));pil.scale.set(.42,.15,.62);pil.position.set(-1.05,.6,0);ink(pil,.03);room.add(pil);
 // blanket
 const bg=new THREE.PlaneGeometry(2.4,2.0,80,60);bg.rotateX(-Math.PI/2);const bm=new THREE.Mesh(bg,toon(0x6f86ff,{side:THREE.DoubleSide}));bm.position.set(.35,0,0);room.add(bm);RM.blanket=bm;RM.bbase=Float32Array.from(bg.attributes.position.array);
 // nightstand, lamp, clock
 const ns=new THREE.Mesh(new THREE.BoxGeometry(.55,.6,.5),toon(0xb48ae8));ns.position.set(-1.2,.3,-.95);inkAbs(ns,.012);room.add(ns);
 const shade=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,.25,24,1,true),new THREE.MeshBasicMaterial({color:0xffd18a,side:THREE.DoubleSide}));shade.position.set(-1.3,1.0,-1.0);room.add(shade);
 const st=new THREE.Mesh(new THREE.CylinderGeometry(.02,.05,.35,10),toon(0xffc24a));st.position.set(-1.3,.78,-1.0);room.add(st);
 const cc=document.createElement('canvas');cc.width=256;cc.height=110;RM.cc=cc;RM.ct=new THREE.CanvasTexture(cc);RM.ct.colorSpace=THREE.SRGBColorSpace;
 const ck=new THREE.Mesh(new THREE.BoxGeometry(.36,.18,.1),toon(0x3a2470));ck.position.set(-1.05,.69,-.8);ck.rotation.y=.5;room.add(ck);
 const cf=new THREE.Mesh(new THREE.PlaneGeometry(.32,.14),new THREE.MeshBasicMaterial({map:RM.ct}));cf.position.set(0,0,.051);ck.add(cf);
 // cartoon woman: head lying on pillow, facing camera (+z)
 const head=new THREE.Group();head.position.set(-.95,.86,.12);head.rotation.z=1.25;room.add(head);RM.head=head;
 const skin=toon(0xffcfae);const hd=new THREE.Mesh(new THREE.SphereGeometry(.3,40,30),skin);hd.scale.set(1,1.06,.95);ink(hd,.03);head.add(hd);
 const hairM=toon(0x5a2f2a);const hb2=new THREE.Mesh(new THREE.SphereGeometry(.33,40,30),hairM);hb2.position.set(0,.06,-.07);hb2.scale.set(1.04,1.04,.98);ink(hb2,.03);head.add(hb2);
 [[-.14,.2,.18,.15,-.5],[.0,.24,.2,.16,0],[.14,.21,.18,.14,.5]].forEach(([x,y,z,r,rz])=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),hairM);b.scale.set(1.1,.55,.7);b.position.set(x,y,z);b.rotation.z=rz;head.add(b)});
 const flow=new THREE.Mesh(new THREE.SphereGeometry(.3,24,16),hairM);flow.scale.set(.7,1.5,.5);flow.position.set(.0,.38,-.12);ink(flow,.04);head.add(flow);
 RM.eyes=[];RM.closed=[];[-1,1].forEach(s=>{const e=new THREE.Group();e.position.set(s*.11,.0,.25);const w=new THREE.Mesh(new THREE.SphereGeometry(.06,20,14),toon(0xffffff));w.scale.z=.6;e.add(w);const p=new THREE.Mesh(new THREE.SphereGeometry(.036,14,10),toon(0x3a2216));p.scale.z=.5;p.position.set(0,-.005,.03);e.add(p);
  const lash=new THREE.Mesh(new THREE.TorusGeometry(.062,.01,6,20,Math.PI),toon(0x2a1840));lash.position.z=.01;e.add(lash);head.add(e);RM.eyes.push(e);
  const cl=new THREE.Mesh(new THREE.TorusGeometry(.055,.012,6,20,Math.PI),toon(0x2a1840));cl.rotation.z=Math.PI;cl.position.set(s*.11,.01,.27);head.add(cl);RM.closed.push(cl)});
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.035,14,10),skin);nose.position.set(0,-.07,.29);head.add(nose);
 RM.mouth=new THREE.Mesh(new THREE.TorusGeometry(.04,.01,8,16,Math.PI),toon(0xb0485a));RM.mouth.rotation.z=Math.PI;RM.mouth.position.set(0,-.16,.27);head.add(RM.mouth);
 RM.yawn=new THREE.Mesh(new THREE.SphereGeometry(.045,14,10),toon(0x8a2a40));RM.yawn.scale.set(1,1.3,.4);RM.yawn.position.set(0,-.17,.275);head.add(RM.yawn);
 [-1,1].forEach(s=>{const ch=new THREE.Mesh(new THREE.CircleGeometry(.05,16),new THREE.MeshBasicMaterial({color:0xff8fb0,transparent:true,opacity:.6}));ch.position.set(s*.19,-.09,.255);ch.rotation.y=s*.5;head.add(ch)});
 const sh=new THREE.Mesh(new THREE.SphereGeometry(.28,24,16),toon(0xc9b6ff));sh.scale.set(1,.6,.8);sh.position.set(-.55,.72,.1);room.add(sh);
}
let lastCk='';
function setRoom(tl,o){room.visible=true;
 if(o.clock!==lastCk){const x=RM.cc.getContext('2d');x.fillStyle='#120b2c';x.fillRect(0,0,256,110);x.fillStyle='#7af7ff';x.font='700 76px Mont';x.textAlign='center';x.fillText(o.clock,128,82);RM.ct.needsUpdate=true;lastCk=o.clock}
 const br=Math.sin(tl*1.3)*.02,pa=RM.blanket.geometry.attributes.position,b=RM.bbase;
 for(let i=0;i<pa.count;i++){const x=b[i*3]+.35,z=b[i*3+2];const torso=Math.exp(-1*((x+.3)/.45)**2-((z-.05)/.32)**2)*(.28+br*2);const hip=Math.exp(-1*((x-.35)/.35)**2-((z-.1)/.34)**2)*.3;const legs=Math.exp(-1*((z-.05)/.25)**2)*(x>.5?.16:0);
  let y=.5+Math.max(torso,hip,legs)+Math.sin(x*7+z*3)*.012;const ez=Math.abs(z)-.9;if(ez>0)y-=ez*2.4;if(x<-.62)y-=(-.62-x)*.6;pa.setY(i,y)}pa.needsUpdate=true;RM.blanket.geometry.computeVertexNormals();
 RM.curt.forEach((c,k)=>{const p=c.geometry.attributes.position,bb=c.userData.base;for(let i=0;i<p.count;i++){const x=bb[i*3],y=bb[i*3+1];p.setZ(i,Math.sin(x*12+k)*.05+Math.sin(tl*.9+y*1.4+k)*.05*(1.2-y/2.4))}p.needsUpdate=true});
 const op=o.open;RM.eyes.forEach(e=>{e.visible=op>.1;e.scale.y=Math.max(.1,op)});RM.closed.forEach(c=>c.visible=op<=.1);
 const y=o.yawn||0;RM.yawn.visible=y>.05;RM.yawn.scale.set(1,1.3*y+.01,.4);RM.mouth.visible=y<.05;
 RM.head.position.y=.86-(o.sink||0)*.04;
}

/* ================= SCENES ================= */
const proj={};const bgC=new THREE.Color();
function hideAll(){world.visible=room.visible=dreamG.visible=beads.visible=walkPath.visible=mascot.G.visible=false;sky.visible=stars.visible=false;sparks.visible=false;PAGES.forEach(p=>p.visible=false);camera.fov=38;scene.fog=null;bloom.strength=.55}
const look=(p,t)=>{camera.position.copy(p);camera.lookAt(t)};
function worldAnim(tl,o){world.visible=true;const thr=o.thr??-99,dim=o.dim??1;
 TREES.forEach(T=>{const on=T.x>thr?1:0;T.bulbs.forEach((b,i)=>{const fl=.75+.25*Math.sin(tl*3+b.ph);b.m.material.color.copy(bulbOff).lerp(b.c,on*fl*dim);b.m.scale.setScalar(on?1+.15*Math.sin(tl*3+b.ph):.8)})});
 PATHS.forEach((P,k)=>{const on=(P.c.v0.x>thr?1:0)*dim;P.m.material.opacity=.15+.6*on;P.ps.forEach((s,j)=>{s.visible=on>0;const u=(tl*.35+j/3+k*.17)%1;s.position.copy(P.c.getPoint(u))})});
 CLOUDS.forEach((c,i)=>{c.position.x+=Math.sin(tl*.2+i)*.002;c.position.y+=Math.sin(tl*.6+i)*.003});
 LANT.forEach(l=>{const u=l.userData;l.position.copy(u.b).add(V(Math.sin(tl*.5+u.ph)*.3,Math.sin(tl*.8+u.ph)*.25+(tl*.05)%1,0));l.visible=dim>.3});
 TW.windows.forEach((w,i)=>w.material.color.setHex(0x3b2f63).lerp(new THREE.Color(0xfff0a0),(o.tw??1)*(.8+.2*Math.sin(tl*2+i))));
 TW.door.material.color.setHex(0x3b2f63).lerp(new THREE.Color(0xfff6c8),o.tw??1);
 pinkL.intensity=6*dim;tealL.intensity=6*dim;sun.intensity=1.6*(o.sun??1);hemi.intensity=1.1*(o.sun??1)+.25}
const SC=[
 {s:0,e:5,run(tl){setRoom(tl,{clock:tl<3.2?'23:47':'23:48',open:clamp(.85*(1-sm((tl-1.0)/3.0))+(tl>2.2&&tl<2.7?Math.sin((tl-2.2)/.5*Math.PI)*.35*(1-sm((tl-1)/3)):0)),yawn:Math.sin(clamp((tl-.2)/1.1)*Math.PI),sink:sm(tl/5)});
   scene.background=bgC.setHex(0x1b1450);const fly=Math.pow(clamp((tl-4.2)/.8),2.2);
   const hp=V(-.95,.95,.12).add(room.position);const cp=V(.9,1.45,2.9).lerp(V(.15,1.2,1.95),sm(tl/4.3)).add(room.position);const tg=V(-.85,.9,.0).add(room.position);
   cp.lerp(hp.clone().add(V(.15,.08,.25)),fly);look(cp,tg.lerp(hp,fly))}},
 {s:5,e:11,run(tl){setSky(...HERO,.5);worldAnim(tl,{dim:sm(tl/1.8)});scene.background=null;
   look(V(Math.sin(tl*.3)*1.2,lerp(12,5.2,sm(tl/2)),lerp(20,11,sm(tl/2))),V(0,2.4,-8));
   walkPath.visible=true;walkPath.position.copy(screenToCam(135,326,4.3));walkPath.scale.setScalar(1.1);
   const wx=lerp(300,170,sm((tl-.7)/2));poseMascot(tl,{x:wx,y:292,s:1.25,walk:tl>.7&&tl<2.7,armR:tl>2.9?'wave':null,turn:tl<2.8?-.9:0,mood:tl>2.9?'big':'smile'})}},
 {s:11,e:17,run(tl){const p=tl/6;lerpSky(HERO,NIGHT,sm(p),sm(p));const a=-.5+sm(p)*1.2;
   worldAnim(tl,{thr:lerp(-14,12,sm((tl-.5)/5)),sun:lerp(1,.35,sm(p))});look(V(Math.sin(a)*14,5.5,-7+Math.cos(a)*14),V(0,2.4,-8));
   beads.visible=true;const f=lerp(28,5,sm(p)),amp=lerp(.03,.09,sm(p));const m=new THREE.Matrix4();const pos=screenToCam(135,262,3.8);
   for(let i=0;i<90;i++){const u=i/89,x=-.62+u*1.24;const y=Math.sin(u*f-tl*lerp(9,2,p))*amp;m.makeTranslation(pos.x+x,pos.y+y,pos.z);m.scale(V(1,1,1));beads.setMatrixAt(i,m)}beads.instanceMatrix.needsUpdate=true;
   poseMascot(tl,{x:215,y:318,s:.95,look:[-.6,-.2],mood:p>.6?'o':'smile',bs:1});mascot.B.rotation.z=p>.7?Math.sin(tl*2)*.05:0}},
 {s:17,e:23,run(tl){setSky(...DREAM,.35);worldAnim(tl,{dim:.6,sun:.7});scene.fog=new THREE.Fog(0xb07ad8,8,30);
   dreamG.visible=true;dreamG.position.set(0,0,0);
   DRM.clocks.forEach(g=>{const u=g.userData;g.position.copy(u.b).add(V(Math.sin(tl*.5+u.ph)*.15,Math.sin(tl*.8+u.ph)*.2,0));g.rotation.set(Math.sin(tl*.4+u.ph)*.4,Math.sin(tl*.3+u.ph)*.6,Math.sin(tl*.2+u.ph)*.2);u.hh.rotation.z=-tl*u.sp*.4;u.mh.rotation.z=-tl*u.sp*2.2});
   DRM.frames.forEach(g=>{const u=g.userData;g.position.copy(u.b).add(V(0,Math.sin(tl*.8+u.ph)*.15,0));g.rotation.set(Math.sin(tl*.5+u.ph)*.2,Math.sin(tl*.6+u.ph)*.45,Math.sin(tl*.4+u.ph)*.12);u.pic.material.opacity=.6+.4*Math.sin(tl*1.7+u.ph)});
   look(V(Math.sin(tl*.5)*.3,2.4+Math.cos(tl*.4)*.2,4.2),V(0,2.1,-2));camera.rotateZ(Math.sin(tl*.6)*.05);
   poseMascot(tl,{x:135,y:300,s:1.15,float:true,look:[Math.sin(tl*.9),Math.cos(tl*.7)*.5-.3],mood:'o',armL:'open',armR:'open'})}},
 {s:23,e:30,run(tl){const p=tl/7;setSky(...HERO,.45);worldAnim(tl,{dim:.85});
   PAGES.forEach((pg,i)=>{const u=pg.userData;const q=(tl*.22+u.ph)%1;pg.visible=true;const dst=TW.door.getWorldPosition(V(0,0,0));const e=q*q*(3-2*q);pg.position.copy(u.src).lerp(dst,e);pg.position.y+=Math.sin(q*Math.PI)*1.2;pg.rotation.set(tl*2+i,tl*1.3+i,Math.sin(tl*3+i)*.5);pg.scale.setScalar(1-e*.6);pg.material.opacity=1});
   const cp=V(lerp(.2,2.0,sm(p)),lerp(3.6,3.6,sm(p)),lerp(5.5,2.0,sm(p)));const tg=V(6.4,3.1,-9.5);look(cp,tg);
   const hp=TW.door.getWorldPosition(V(0,0,0)).add(V(0,.9,0)).project(camera);proj.hippo=[(hp.x+1)/2*270,(1-hp.y)/2*480];
   poseMascot(tl,{x:68,y:300,s:1.2,armR:'point',look:[.9,-.4],mood:'smile',bs:2})}},
 {s:30,e:36,run(tl){const p=tl/6;lerpSky(HERO,NIGHT,sm(p)*.8,.6);worldAnim(tl,{dim:lerp(.8,.35,sm(p)),tw:1-sm((tl-1)/3.5),sun:lerp(.9,.4,p)});
   const sp=sparkG.attributes.position;sparks.visible=true;const r=rng(9);
   PAGES.forEach((pg,i)=>{const u=pg.userData;const d=sm((tl-i*.07)/2.2);pg.visible=d<.98;const base=u.src.clone().lerp(TW.door.getWorldPosition(V(0,0,0)),.35);pg.position.copy(base).add(V(0,Math.sin(tl+i)*.1,0));pg.rotation.set(i,i*.5+tl*.3,0);pg.material.opacity=1-d;pg.scale.setScalar(.8*(1-d*.6));
    for(let j=0;j<12;j++){const a=r()*6.28,b2=r()*3;sp.setXYZ(i*12+j,base.x+Math.cos(a)*d*(.4+b2*.3),base.y+Math.sin(a)*d*.5+d*.8,base.z+Math.sin(a*1.7)*d*.4)}});sp.needsUpdate=true;sparks.material.opacity=Math.min(1,tl*.6)*(1-sm((tl-4.5)/1.2));
   look(V(lerp(2.0,0.5,sm(p)),lerp(3.6,4.6,sm(p)),lerp(2.5,8.0,sm(p))),V(4.5,3.0,-8));
   poseMascot(tl,{x:205,y:305,s:1,look:[-.9,-.5],mood:'flat',bs:.5})}},
 {s:36,e:43,run(tl){const p=tl/7;lerpSky(NIGHT,HERO,sm(p*1.4),lerp(.6,.4,p));worldAnim(tl,{dim:lerp(.4,1,sm(p*1.4)),sun:lerp(.5,1,sm(p))});bloom.strength=.55+sm(p)*.25;
   look(V(lerp(-5,3,sm(p)),lerp(9,7,sm(p)),lerp(15,12.5,p)),V(.5,2.6,-9));
   const turn=sm((tl-1.6)/1.2);poseMascot(tl,{x:135,y:305,s:1.45,turn:lerp(-1.1,0,turn),look:[0,lerp(-.4,0,turn)],mood:turn>.6?'big':'smile',armL:turn>.8?'open':null,armR:turn>.8?'open':null,bs:1.3})}},
 {s:43,e:50,run(tl){setRoom(tl,{clock:'23:58',open:0,sink:1});scene.background=bgC.setHex(0x1b1450);RM.mouth.scale.set(1.2,1.2,1);
   const p=sm(tl/6.5);look(V(-.2,1.15,1.05).lerp(V(1.6,2.0,3.3),p).add(room.position),V(-.6,1.15,-.1).add(room.position));
   const hp=RM.head.getWorldPosition(V(0,0,0)).project(camera);proj.brain=[(hp.x+1)/2*270,(1-hp.y)/2*480]}}
];
function renderScene(i,t){hideAll();RM.mouth.scale.set(1,1,1);const tl=Math.max(0,t-SC[i].s);SC[i].run(tl);camera.updateProjectionMatrix();composer.render();
 if(mascot.G.visible){camera.updateMatrixWorld();holder.position.copy(camera.position);holder.quaternion.copy(camera.quaternion);renderer.autoClear=false;renderer.clearDepth();renderer.render(mScene,camera);renderer.autoClear=true}}
/* ---------- 2D compositing + overlays ---------- */
const out=document.getElementById('out'),M=out.getContext('2d');const K=4,W=270,H=480;
const C={gold:'#D9B56D',cyan:'#43D9F5'};
function glow(c,x,y,r,cl,a){if(a<=0||r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,cl);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=clamp(a);c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.globalAlpha=1}
const SUBS=[[0.3,4.7,'Сен ұйықтап кеткен сәтіңді','есіңе түсіре аласың ба?'],[5.3,10.6,'Ұйқыға кету — мидың','бір сәтте өшіп қалуы емес.'],[11.3,16.6,'Бұл — ояулықтан ұйқыға','өтетін күрделі үдеріс.'],
 [17.2,20.0,'Осы аралықта гипнагогиялық','бейнелер пайда болуы мүмкін.'],[20.1,22.8,'Кейбіреулер оларды','есте сақтайды да.'],[23.4,29.6,'Гиппокамп жаңа естеліктерді','қалыптастыруға қатысады.'],
 [30.3,34.6,'Ұйқыға өту сәтіндегі тәжірибе','әрдайым естелікке айнала бермейді.'],[36.3,38.6,'Сондықтан біз ұйқының','басталуын емес,'],[38.6,40.6,'оған дейінгі сәттерді','ғана еске аламыз.'],
 [40.7,42.8,'Кейде соңғы бірнеше','минут та ұмытылады.'],[43.3,45.4,'Ал сен мұны','бұрын білдің бе?'],[45.5,48.6,'SANALAB-пен бірге','ми құпияларын зерттейік.']];
const LABELS=[[11.6,16.6,'ОЯУЛЫҚ → ҰЙҚЫ'],[17.5,22.6,'ГИПНАГОГИЯ']];
const grains=[];for(let g=0;g<4;g++){const cg=document.createElement('canvas');cg.width=540;cg.height=960;const x=cg.getContext('2d'),id=x.createImageData(540,960);const r=rng(77+g);for(let i=0;i<id.data.length;i+=4){const v=r()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}x.putImageData(id,0,0);grains.push(cg)}
function fade(t,a,b,f=.25){return sm((t-a)/f)*(1-sm((t-(b-f))/f))}
let logoPts=null;
function getLogoPts(){if(logoPts)return logoPts;const c=document.createElement('canvas');c.width=270;c.height=120;const x=c.getContext('2d');x.font='800 40px Mont';x.textAlign='center';x.fillStyle='#fff';x.fillText('SANALAB',135,60);
 const d=x.getImageData(0,0,270,120).data,pts=[];for(let y=0;y<120;y+=2)for(let xx=0;xx<270;xx+=2)if(d[(y*270+xx)*4+3]>128)pts.push([xx,y-60+92]);const r=rng(5);logoPts=pts.sort(()=>r()-.5).slice(0,260);return logoPts}
function overlays(c,t){
 const ha=fade(t,.15,2.9,.3);if(ha>0){c.save();c.globalAlpha=ha;c.textAlign='center';c.shadowColor='rgba(0,0,0,.85)';c.shadowBlur=8;
  c.font='800 20px Mont';c.fillStyle='#fff';c.fillText('Сен мұны ешқашан',135,62+(1-ha)*6);c.fillStyle=C.gold;c.fillText('байқаған жоқсың…',135,86+(1-ha)*6);c.restore()}
 LABELS.forEach(([a,b,s])=>{const la=fade(t,a,b,.35);if(la<=0)return;c.save();c.globalAlpha=la;c.textAlign='center';c.font='800 17px Mont';c.letterSpacing='2px';c.shadowColor='rgba(0,0,0,.8)';c.shadowBlur=8;c.fillStyle=C.gold;c.fillText(s,135,68-(1-la)*5);c.fillStyle='rgba(217,181,109,.7)';c.fillRect(135-24*la,77,48*la,1.2);c.restore()});
 // hippocampus label
 if(t>23&&t<30&&proj.hippo){const tl=t-23,la=sm((tl-.8)/.5)*(1-sm((tl-6.4)/.4));if(la>0){const [hx,hy]=proj.hippo;c.save();c.globalAlpha=la;c.strokeStyle=C.gold;c.lineWidth=1;c.beginPath();c.moveTo(hx,hy);c.lineTo(hx+28,hy+40);c.lineTo(hx+60,hy+40);c.stroke();
  c.beginPath();c.arc(hx,hy,2.2,0,7);c.fillStyle=C.gold;c.fill();c.font='800 12px Mont';c.textAlign='left';c.shadowColor='rgba(0,0,0,.85)';c.shadowBlur=6;c.fillText('ГИППОКАМП',Math.min(hx+30,170),hy+36);c.restore()}}
 // logo
 if(t>=43){const tl=t-43,form=sm((tl-1.8)/2.6),pts=getLogoPts(),r=rng(31),src=proj.brain||[110,180];
  if(tl<5.2)pts.forEach((p,k)=>{const sx=src[0]+(r()-.5)*70,sy=src[1]+(r()-.5)*50;const x=lerp(sx,p[0],form)+Math.sin(tl*2+k)*(1-form)*5,y=lerp(sy,p[1],form);c.globalCompositeOperation='lighter';glow(c,x,y,2.4,C.gold,(1-form*.75)*sm((tl-1)/.8));c.globalCompositeOperation='source-over'});
  c.save();c.textAlign='center';c.globalAlpha=sm((tl-3.6)/1);c.font='800 40px Mont';c.shadowColor='rgba(217,181,109,.8)';c.shadowBlur=18;
  const lg=c.createLinearGradient(50,55,220,95);lg.addColorStop(0,'#B8913F');lg.addColorStop(.5,'#FFE6A8');lg.addColorStop(1,'#C9A458');c.fillStyle=lg;c.letterSpacing='2px';c.fillText('SANALAB',135,92);c.shadowBlur=0;
  c.font='600 9px Mont';c.letterSpacing='3px';c.fillStyle='rgba(255,255,255,.85)';c.fillText('1-БӨЛІМ',135,110);
  const sx2=lerp(20,260,clamp((tl-4.6)/.9));c.globalCompositeOperation='lighter';glow(c,sx2,80,22,'rgba(255,240,200,.6)',clamp((tl-4.6)/.2)*(1-clamp((tl-5.5)/.2)));c.restore();
  const na=sm((tl-5.65)/.3);if(na>0){c.save();c.globalAlpha=na;c.textAlign='center';c.font='600 10.5px Mont';c.fillStyle=C.cyan;c.shadowColor='rgba(0,0,0,.9)';c.shadowBlur=6;c.fillText('Келесі бөлімде:',135,352);c.font='800 12px Mont';c.fillStyle='#fff';c.fillText('Неге біз түсімізді ұмытамыз?',135,369);c.restore()}}
 SUBS.forEach(([a,b,l1,l2])=>{const sa=fade(t,a,b,.15);if(sa<=0)return;c.save();c.globalAlpha=sa;c.textAlign='center';c.font='700 14.5px PTS';
  const w=Math.max(c.measureText(l1).width,c.measureText(l2).width)+18;c.fillStyle='rgba(8,14,26,.55)';c.beginPath();c.roundRect(135-w/2,333,w,46,8);c.fill();
  c.fillStyle='#fff';c.shadowColor='rgba(0,0,0,.9)';c.shadowBlur=4;c.fillText(l1,135,352);c.fillText(l2,135,371);c.restore()});
 const v=c.createRadialGradient(135,240,150,135,240,330);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.42)');c.fillStyle=v;c.fillRect(0,0,W,H);
 c.save();c.globalAlpha=.04;c.globalCompositeOperation='overlay';c.drawImage(grains[Math.floor(t*30)%4],0,0,W,H);c.restore();
 const fi=1-sm(t/.4);if(fi>0){c.fillStyle='rgba(0,0,0,'+fi+')';c.fillRect(0,0,W,H)}
 const fo=sm((t-49.3)/.7);if(fo>0){c.fillStyle='rgba(0,0,0,'+fo*.6+')';c.fillRect(0,0,W,H)}
}
window.renderFrame=function(t){
 let i=SC.findIndex(s=>t>=s.s&&t<s.e);if(i<0)i=SC.length-1;
 M.setTransform(1,0,0,1,0,0);M.globalAlpha=1;renderScene(i,t);M.drawImage(glc,0,0);
 const X=.3;let j=-1,a=0;
 if(i<SC.length-1&&t>SC[i].e-X){j=i+1;a=sm((t-(SC[i].e-X))/(2*X))}else if(i>0&&t<SC[i].s+X){j=i-1;a=1-sm((t-(SC[i].s-X))/(2*X))}
 const keepProj={...proj};
 if(j>=0){renderScene(j,t);M.globalAlpha=a;M.drawImage(glc,0,0);M.globalAlpha=1;Object.assign(proj,keepProj)}
 M.save();M.setTransform(K,0,0,K,0,0);overlays(M,t);M.restore();
 return out.toDataURL('image/jpeg',.9)};
window.ready=Promise.all([document.fonts.load('800 20px Mont'),document.fonts.load('600 20px Mont'),document.fonts.load('700 20px PTS')]).then(()=>true);
