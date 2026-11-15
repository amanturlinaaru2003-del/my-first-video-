import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const WW=1080,HH=1920;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
const lerp=(a,b,p)=>a+(b-a)*p;
function rng(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
const V=(x,y,z)=>new THREE.Vector3(x,y,z);

/* ---------- renderer ---------- */
const glc=document.createElement('canvas');glc.width=WW;glc.height=HH;
const renderer=new THREE.WebGLRenderer({canvas:glc,antialias:true,preserveDrawingBuffer:true});
renderer.setSize(WW,HH,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(35,WW/HH,0.05,200);scene.add(camera);
const composer=new EffectComposer(renderer);composer.setSize(WW,HH);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),0.6,0.5,0.28);composer.addPass(bloom);
composer.addPass(new OutputPass());
const pmrem=new THREE.PMREMGenerator(renderer);const envTex=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
const PX=(HH/2)/Math.tan(THREE.MathUtils.degToRad(17.5));

/* ---------- noise ---------- */
const PERM=new Uint8Array(512);{const p=[...Array(256).keys()];const r=rng(3);for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1));[p[i],p[j]]=[p[j],p[i]]}for(let i=0;i<512;i++)PERM[i]=p[i&255]}
const fd=t=>t*t*t*(t*(t*6-15)+10),nl=(t,a,b)=>a+t*(b-a);
function grad(h,x,y,z){h&=15;const u=h<8?x:y,v=h<4?y:(h==12||h==14?x:z);return((h&1)?-u:u)+((h&2)?-v:v)}
function noise(x,y,z){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=fd(x),v=fd(y),w=fd(z),P=PERM;
 const A=P[X]+Y,AA=P[A]+Z,AB=P[A+1]+Z,B=P[X+1]+Y,BA=P[B]+Z,BB=P[B+1]+Z;
 return nl(w,nl(v,nl(u,grad(P[AA],x,y,z),grad(P[BA],x-1,y,z)),nl(u,grad(P[AB],x,y-1,z),grad(P[BB],x-1,y-1,z))),nl(v,nl(u,grad(P[AA+1],x,y,z-1),grad(P[BA+1],x-1,y,z-1)),nl(u,grad(P[AB+1],x,y-1,z-1),grad(P[BB+1],x-1,y-1,z-1))))}

/* ---------- shaders ---------- */
const holoMat=(colA,colB,op=1)=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
 uniforms:{uA:{value:new THREE.Color(colA)},uB:{value:new THREE.Color(colB)},uOp:{value:op},uTime:{value:0}},
 vertexShader:`attribute float ridge;varying float vR;varying vec3 vN;varying vec3 vV;varying vec3 vP;
 void main(){vR=ridge;vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;vN=normalize(normalMatrix*normal);vP=position;gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform vec3 uA,uB;uniform float uOp,uTime;varying float vR;varying vec3 vN;varying vec3 vV;varying vec3 vP;
 void main(){float f=1.-abs(dot(normalize(vN),normalize(vV)));f=pow(f,2.2);
 float flow=.55+.45*sin(vP.x*5.+vP.y*3.-uTime*1.6);
 vec3 c=uA*.3+uB*f*.9+uB*vR*(.7+.6*f)*flow;float a=(.02+f*.5+vR*.6*flow)*uOp*.8;gl_FragColor=vec4(c,a);}`});
const ptsMat=()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 uniforms:{uTime:{value:0},uOp:{value:1},uScale:{value:PX},uTw:{value:.6},uSplit:{value:1e9},uSplitCol:{value:new THREE.Color(0x9a8cf0)},uFire:{value:1}},
 vertexShader:`attribute vec3 color;attribute float size;attribute float phase;uniform float uTime,uOp,uScale,uTw,uSplit,uFire;uniform vec3 uSplitCol;varying vec3 vC;varying float vA;
 void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float tw=1.-uTw+uTw*(.5+.5*sin(uTime*(1.2+phase*2.)+phase*6.283));
 vC=color;float k=uFire;if(position.x>uSplit){vC=uSplitCol;k*=.5;}vA=uOp*tw*k;float osc=length(modelMatrix[0].xyz);gl_PointSize=max(1.,size*osc*uScale*(.7+.3*tw)/(-mv.z));gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);float a=smoothstep(.5,0.,r);a=a*a*.8+smoothstep(.14,0.,r)*.9;gl_FragColor=vec4(vC,a*vA);}`});
function makePoints(arr,opt={}){ // arr: [{p:[x,y,z],c:[r,g,b],s,ph}]
 const g=new THREE.BufferGeometry(),n=arr.length,P=new Float32Array(n*3),Cc=new Float32Array(n*3),S=new Float32Array(n),Ph=new Float32Array(n);
 arr.forEach((a,i)=>{P.set(a.p,i*3);Cc.set(a.c,i*3);S[i]=a.s;Ph[i]=a.ph??Math.random()});
 g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(Cc,3));g.setAttribute('size',new THREE.BufferAttribute(S,1));g.setAttribute('phase',new THREE.BufferAttribute(Ph,1));
 const m=ptsMat();if(opt.tw!==undefined)m.uniforms.uTw.value=opt.tw;const o=new THREE.Points(g,m);o.frustumCulled=false;return o}
const col=h=>{const c=new THREE.Color(h);return [c.r,c.g,c.b]};
const GOLD=col(0xffb45a),CYAN=col(0x43d9f5),ICE=col(0xbfe8ff),PURP=col(0x9a8cf0),BLUE=col(0x4a9cff);

/* ---------- BRAIN ---------- */
const brain=new THREE.Group();scene.add(brain);
const insideBrain=(x,y,z)=>(x/1.18)**2+((y+.05)/.82)**2+(z/.9)**2<1&&y>-.42;
{
 const g=new THREE.SphereGeometry(1,220,160);const pos=g.attributes.position;const R=new Float32Array(pos.count);
 for(let i=0;i<pos.count;i++){const vx=pos.getX(i),vy=pos.getY(i),vz=pos.getZ(i);
  let bx=vx*1.3,by=vy*.95,bz=vz*1.0;
  if(by<-.3)by=-.3+(by+.3)*.62;
  by-=.2*Math.exp(-1*((bx+.2)/.5)**2)*Math.max(0,-vy)*(Math.abs(vz)>.2?1:.4);
  if(bx>.7)by+=.06*Math.max(0,-vy);
  if(bx<0){bz*=1-.13*(-vx);by*=1-.06*(-vx)}
  if(bx>.6&&by<0)by*=.85;
  const fis=Math.exp(-1*(vz/.055)**2)*Math.max(0,vy+.1);
  const n=noise(bx*3.1+11,by*3.1,bz*3.1)*.65+noise(bx*6.4,by*6.4+5,bz*6.4)*.35;
  const s1=1-Math.min(1,Math.abs(n)*5.5);
  const sy=Math.exp(-1*((by-(-.12+.16*bx))/.045)**2)*(bx>-.95&&bx<.75?1:0)*(Math.abs(vz)>.35?1:0);
  const disp=-.055*s1**1.5-.07*sy-.13*fis;
  const k=1+disp;pos.setXYZ(i,bx*k,by*k,bz*(1+disp*.6)-Math.sign(vz)*fis*.0);
  R[i]=Math.max(Math.pow(s1,3),sy*.9,fis*.6)}
 g.setAttribute('ridge',new THREE.BufferAttribute(R,1));g.computeVertexNormals();
 brain.userData.cortex=new THREE.Mesh(g,holoMat(0x0a2a6a,0x56b8ff));brain.add(brain.userData.cortex);
 // surface sparkle
 const sp=[],r=rng(9);for(let i=0;i<pos.count;i+=7){if(R[i]>.35||r()<.15)sp.push({p:[pos.getX(i),pos.getY(i),pos.getZ(i)],c:R[i]>.35?ICE:BLUE,s:.018+r()*.02,ph:r()})}
 brain.userData.sparkle=makePoints(sp,{tw:.8});brain.userData.sparkle.material.uniforms.uOp.value=.45;brain.add(brain.userData.sparkle);
 // cerebellum
 const cg=new THREE.SphereGeometry(1,120,80);const cp=cg.attributes.position;const CR=new Float32Array(cp.count);
 for(let i=0;i<cp.count;i++){const x=cp.getX(i),y=cp.getY(i),z=cp.getZ(i);const st=Math.pow(1-Math.abs(Math.sin(y*26)),6);const d=1-.03*st;cp.setXYZ(i,x*.46*d,y*.27*d,z*.62*d);CR[i]=st}
 cg.setAttribute('ridge',new THREE.BufferAttribute(CR,1));cg.computeVertexNormals();
 const cer=new THREE.Mesh(cg,holoMat(0x3a1a05,0xffb45a,.9));cer.position.set(.82,-.42,0);cer.rotation.z=.35;brain.add(cer);brain.userData.cer=cer;
 // stem
 const stc=new THREE.CatmullRomCurve3([V(.3,-.3,0),V(.38,-.7,0),V(.4,-1.1,0),V(.36,-1.5,0)]);
 const stg=new THREE.TubeGeometry(stc,40,.13,24);stg.setAttribute('ridge',new THREE.BufferAttribute(new Float32Array(stg.attributes.position.count).fill(.15),1));
 const stem=new THREE.Mesh(stg,holoMat(0x0a2a6a,0x8fd3ff,.9));brain.add(stem);brain.userData.stem=stem;
 // neurons + connections
 const nr=[],r2=rng(21);while(nr.length<520){const x=(r2()*2-1)*1.2,y=(r2()*2-1)*.9,z=(r2()*2-1)*.95;if(insideBrain(x,y,z))nr.push([x,y,z])}
 brain.userData.nr=nr;
 brain.userData.neurons=makePoints(nr.map(p=>({p,c:GOLD,s:.05+r2()*.05,ph:r2()})),{tw:.75});brain.add(brain.userData.neurons);
 const segs=[],segCol=[],pairs=[];
 nr.forEach((a,i)=>{let c=0;for(let j=i+1;j<nr.length&&c<3;j++){const b=nr[j];const d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);if(d<.24){segs.push(...a,...b);segCol.push(...GOLD,...GOLD);pairs.push([a,b]);c++}}});
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(segs,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(segCol,3));
 const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));brain.add(lines);brain.userData.lines=lines;
 brain.userData.pairs=pairs;
 // pulses
 const pu=[];for(let k=0;k<70;k++)pu.push({p:[0,0,0],c:k%3?GOLD:CYAN,s:.07,ph:r2()});brain.userData.pulses=makePoints(pu,{tw:0});brain.add(brain.userData.pulses);
 brain.userData.pulseIdx=pu.map(()=>Math.floor(r2()*pairs.length));
 // golden roots
 const rootsPts=[],rootTips=[];for(let k=0;k<9;k++){const a=(k/9)*Math.PI*2,sp2=.25+r2()*.45;const c=new THREE.CatmullRomCurve3([V(.32,-1.5,0),V(.32+Math.cos(a)*sp2*.4,-1.75,Math.sin(a)*sp2*.4),V(.32+Math.cos(a)*sp2,-1.95-r2()*.3,Math.sin(a)*sp2)]);
  const pts=c.getPoints(16);for(let i=0;i<pts.length-1;i++)rootsPts.push(pts[i].x,pts[i].y,pts[i].z,pts[i+1].x,pts[i+1].y,pts[i+1].z);rootTips.push({p:pts[16].toArray(),c:GOLD,s:.07,ph:r2()})}
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rootsPts,3));
 brain.userData.roots=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xffb45a,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));brain.add(brain.userData.roots);
 brain.userData.tips=makePoints(rootTips,{tw:.8});brain.add(brain.userData.tips);
 // smoke + stars around
 const sm_=[];for(let k=0;k<420;k++){const a=r2()*6.283,b=Math.acos(2*r2()-1),d=1.25+r2()*1.1;sm_.push({p:[Math.sin(b)*Math.cos(a)*d*1.2,Math.cos(b)*d*.85,Math.sin(b)*Math.sin(a)*d],c:r2()<.85?[.2,.45,.9]:[.6,.35,.12],s:.35+r2()*.6,ph:r2()})}
 brain.userData.smoke=makePoints(sm_,{tw:.4});brain.userData.smoke.material.uniforms.uOp.value=.13;brain.add(brain.userData.smoke);
 const st=[];for(let k=0;k<500;k++){const a=r2()*6.283,b=Math.acos(2*r2()-1),d=1.4+r2()*2.2;st.push({p:[Math.sin(b)*Math.cos(a)*d*1.2,Math.cos(b)*d,Math.sin(b)*Math.sin(a)*d],c:r2()<.7?ICE:GOLD,s:.012+r2()*.02,ph:r2()})}
 brain.userData.stars=makePoints(st,{tw:.9});brain.add(brain.userData.stars);
 // hippocampi
 const hc=[V(.38,.04,0),V(.22,-.12,0),V(.02,-.24,0),V(-.18,-.3,0),V(-.33,-.27,0),V(-.38,-.17,0),V(-.3,-.12,0)];
 brain.userData.hippo=[];brain.userData.hippoCurves=[];
 [-.36,.36].forEach(z=>{const c=new THREE.CatmullRomCurve3(hc.map(v=>V(v.x,v.y,z)));const tg=new THREE.TubeGeometry(c,60,.055,16);
  const m=new THREE.Mesh(tg,new THREE.MeshBasicMaterial({color:0xffc46a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));brain.add(m);brain.userData.hippo.push(m);brain.userData.hippoCurves.push(c)});
 const hs=[];for(let k=0;k<160;k++)hs.push({p:[0,0,0],c:GOLD,s:.06,ph:r2()});brain.userData.stream=makePoints(hs,{tw:.2});brain.add(brain.userData.stream);
 brain.userData.streamSrc=hs.map(()=>nr[Math.floor(r2()*nr.length)]);
}
const BU=brain.userData;
const allBrainMats=()=>[BU.cortex.material,BU.cer.material,BU.stem.material];
function setBrain(tl,o){ // o: op, fire, split, pulses, hippo, stream, smoke
 brain.visible=true;const op=o.op??1,fire=o.fire??1;
 allBrainMats().forEach(m=>{m.uniforms.uOp.value=op*(m===BU.cer.material?.9:1);m.uniforms.uTime.value=tl});
 BU.cer.material.uniforms.uB.value.setHex(0xffb45a).lerp(new THREE.Color(0x56b8ff),1-fire*.8);
 BU.sparkle.material.uniforms.uOp.value=.3*op;BU.sparkle.material.uniforms.uTime.value=tl;
 const nm=BU.neurons.material.uniforms;nm.uTime.value=tl;nm.uOp.value=op;nm.uFire.value=fire;nm.uSplit.value=o.split??1e9;
 BU.lines.material.opacity=.32*op*fire;BU.roots.material.opacity=.7*op*fire;
 BU.tips.material.uniforms.uOp.value=op*fire;BU.tips.material.uniforms.uTime.value=tl;
 BU.smoke.material.uniforms.uOp.value=.035*op*(o.smoke??1);BU.smoke.material.uniforms.uTime.value=tl;BU.smoke.rotation.y=tl*.05;
 BU.stars.material.uniforms.uOp.value=op;BU.stars.material.uniforms.uTime.value=tl;BU.stars.rotation.y=-tl*.03;
 // pulses
 const pp=BU.pulses.geometry.attributes.position;const pon=(o.pulses??1)*op*fire;BU.pulses.material.uniforms.uOp.value=pon;
 for(let k=0;k<pp.count;k++){const pr=BU.pairs[(BU.pulseIdx[k]+Math.floor(tl*1.3+k*.37))%BU.pairs.length];const f=(tl*1.3+k*.37)%1;pp.setXYZ(k,lerp(pr[0][0],pr[1][0],f),lerp(pr[0][1],pr[1][1],f),lerp(pr[0][2],pr[1][2],f))}pp.needsUpdate=true;
 if(o.split!==undefined){const sp=o.split;BU.pulses.material.uniforms.uSplit.value=sp;}else BU.pulses.material.uniforms.uSplit.value=1e9;
 BU.hippo.forEach(m=>m.material.opacity=(o.hippo??0)*(.75+.25*Math.sin(tl*4)));
 const sa=BU.stream.geometry.attributes.position;BU.stream.material.uniforms.uOp.value=o.stream??0;BU.stream.material.uniforms.uTime.value=tl;
 if(o.stream){for(let k=0;k<sa.count;k++){const q=(tl*.35+k/sa.count)%1,src=BU.streamSrc[k],dst=BU.hippoCurves[k%2].getPoint((k*.137)%1);const e=q*q*(3-2*q);
   sa.setXYZ(k,lerp(src[0],dst.x,e)+Math.sin(q*9+k)*.04*(1-e),lerp(src[1],dst.y,e),lerp(src[2],dst.z,e))}sa.needsUpdate=true}
}

/* ---------- MASCOT ---------- */
const goldM=new THREE.MeshPhysicalMaterial({color:0xE8C67E,metalness:1,roughness:.27,clearcoat:.5,clearcoatRoughness:.15,emissive:0x000000,emissiveIntensity:0,envMap:envTex,envMapIntensity:1.25});
const darkM=new THREE.MeshPhysicalMaterial({color:0x0A1322,roughness:.08,metalness:.2,clearcoat:1,envMap:envTex});
const browM=new THREE.MeshStandardMaterial({color:0x5C451C,metalness:.6,roughness:.4,envMap:envTex});
const cyanM=new THREE.MeshBasicMaterial({color:0x43D9F5});const whiteM=new THREE.MeshBasicMaterial({color:0xffffff});
const mascot=(()=>{const G=new THREE.Group(),B=new THREE.Group();G.add(B);
 B.add(new THREE.Mesh(new THREE.SphereGeometry(.5,64,48),goldM));
 const F=new THREE.Group();B.add(F);const eyes=[];
 [-1,1].forEach(s=>{const e=new THREE.Group();e.position.set(s*.17,.05,.41);
  const eb=new THREE.Mesh(new THREE.SphereGeometry(.12,32,24),darkM);eb.scale.set(1,1.22,.55);e.add(eb);
  const ir=new THREE.Mesh(new THREE.SphereGeometry(.068,24,16),cyanM);ir.scale.set(1,1.15,.4);ir.position.set(.01,-.005,.055);e.add(ir);
  const hl=new THREE.Mesh(new THREE.SphereGeometry(.022,12,8),whiteM);hl.position.set(.035,.05,.075);e.add(hl);
  F.add(e);eyes.push(e)});
 const brows=[-1,1].map(s=>{const b=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.1,4,8),browM);b.rotation.z=Math.PI/2+s*.18;b.position.set(s*.17,.25,.43);F.add(b);return b});
 const mouth=new THREE.Mesh(new THREE.TorusGeometry(.075,.017,10,28,Math.PI),browM);mouth.rotation.z=Math.PI;mouth.position.set(0,-.12,.475);F.add(mouth);
 const mouthO=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),darkM);mouthO.scale.set(1,1.3,.4);mouthO.position.set(0,-.15,.475);F.add(mouthO);
 // branches
 const tips=[];for(let k=0;k<5;k++){const a=-1+k*.5;const base=V(Math.sin(a)*.42,Math.cos(a)*.42,-.05),mid=V(Math.sin(a)*.62,Math.cos(a)*.7,-.05),tip=V(Math.sin(a*1.15)*.78,Math.cos(a*1.15)*.95,-.05);
  B.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([base,mid,tip]),12,.03,8),goldM));
  [[-.5,.14],[.5,.12]].forEach(([d,l])=>{const e2=V(tip.x+Math.sin(a+d)*l,tip.y+Math.cos(a+d)*l,-.05);B.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(tip,e2),2,.018,6),goldM));const t2=new THREE.Mesh(new THREE.SphereGeometry(.035,12,8),cyanM);t2.position.copy(e2);B.add(t2);tips.push(t2)});
  const t=new THREE.Mesh(new THREE.SphereGeometry(.05,16,12),cyanM);t.position.copy(tip);B.add(t);tips.push(t)}
 const limb=(len,r)=>{const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,12),goldM);m.position.y=-len/2;g.add(m);return g};
 const arm=s=>{const sh=new THREE.Group();sh.position.set(s*.44,-.05,0);const up=limb(.2,.042);sh.add(up);const el=new THREE.Group();el.position.y=-.24;sh.add(el);el.add(limb(.18,.038));
  const h=new THREE.Mesh(new THREE.SphereGeometry(.06,16,12),goldM);h.position.y=-.24;el.add(h);B.add(sh);return{sh,el}};
 const leg=s=>{const hp=new THREE.Group();hp.position.set(s*.17,-.44,0);hp.add(limb(.16,.045));const kn=new THREE.Group();kn.position.y=-.2;hp.add(kn);kn.add(limb(.14,.042));
  const ft=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),goldM);ft.scale.set(1.2,.55,1.7);ft.position.set(0,-.2,.05);kn.add(ft);B.add(hp);return{hp,kn}};
 const aL=arm(-1),aR=arm(1),lL=leg(-1),lR=leg(1);
 const glowL=new THREE.PointLight(0xffd79a,0,2.5);glowL.position.set(0,0,1.2);G.add(glowL);
 return{G,B,F,eyes,brows,mouth,mouthO,tips,aL,aR,lL,lR}})();
const mScene=new THREE.Scene();const holder=new THREE.Group();mScene.add(holder);holder.add(mascot.G);mScene.add(new THREE.AmbientLight(0x6080c0,.35));
const key=new THREE.DirectionalLight(0xfff0d8,2.0);key.position.set(-2,3,2);holder.add(key);key.target.position.set(0,0,-4);holder.add(key.target);
const fill=new THREE.DirectionalLight(0xffe2b0,.6);fill.position.set(2,-1,2);holder.add(fill);fill.target.position.set(0,0,-4);holder.add(fill.target);
const rim=new THREE.DirectionalLight(0x43d9f5,1.6);rim.position.set(3,1,-3);holder.add(rim);rim.target.position.set(0,0,-4);holder.add(rim.target);
function screenToCam(sx,sy,depth){const th=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));return V((sx/270*2-1)*depth*th*camera.aspect,(1-sy/480*2)*depth*th,-depth)}
function poseMascot(tl,o){const m=mascot;m.G.visible=true;
 const depth=4;m.G.position.copy(screenToCam(o.x,o.y,depth));const sc=.2*(o.s||1)*Math.tan(THREE.MathUtils.degToRad(17.5))/Math.tan(THREE.MathUtils.degToRad(camera.fov/2));m.G.scale.setScalar(sc);
 const walk=o.walk,fl=o.float;
 m.B.position.y=walk?Math.abs(Math.sin(tl*8))*.06:Math.sin(tl*2.2)*.04+(fl?Math.sin(tl*1.2)*.12:0);
 m.G.rotation.set(fl?Math.sin(tl*.9)*.08:0,o.turn??0,fl?Math.sin(tl*.7)*.06:0);
 const lx=(o.look||[0,0])[0],ly=(o.look||[0,0])[1];m.F.rotation.set(-ly*.3,lx*.45,0);
 const sw=walk?Math.sin(tl*8)*.55:fl?Math.sin(tl*1.5)*.25:0;
 m.lL.hp.rotation.x=sw;m.lR.hp.rotation.x=-sw;m.lL.kn.rotation.x=walk?Math.max(0,-Math.sin(tl*8))*.8:fl?.3:0;m.lR.kn.rotation.x=walk?Math.max(0,Math.sin(tl*8))*.8:fl?.3:0;
 m.lL.hp.rotation.z=-.06;m.lR.hp.rotation.z=.06;
 const setArm=(a,s,mode)=>{let z=s*.28,x=walk?-s*sw*.0+(s>0?-sw:sw)*.5:Math.sin(tl*2)*.05,ez=s*.15,ex=0;
  if(mode==='wave'){z=s*2.55;ez=s*(.35+Math.sin(tl*7)*.45);x=0}
  else if(mode==='point'){z=s*1.55;ez=s*.05;x=0}
  else if(mode==='open'){z=s*(1.05+Math.sin(tl*2)*.08);ez=s*.25;x=0}
  a.sh.rotation.set(x,0,z);a.el.rotation.set(ex,0,ez)};
 setArm(m.aL,-1,o.armL);setArm(m.aR,1,o.armR);
 const bl=((tl+(o.bs||0))%3.7)<.12?.12:1;m.eyes.forEach(e=>e.scale.y=bl);
 const mood=o.mood||'smile';m.mouth.visible=mood!=='o';m.mouthO.visible=mood==='o';
 m.mouth.scale.set(mood==='big'?1.35:1,mood==='flat'?.25:mood==='big'?1.3:1,1);
 const bd=mood==='flat'?-.03:mood==='o'?.03:0;m.brows.forEach((b,i)=>{b.position.y=.25+bd;b.rotation.z=Math.PI/2+(i?1:-1)*(.18+(mood==='flat'?.25:0))});
 m.tips.forEach((t,i)=>t.scale.setScalar(.85+.3*Math.sin(tl*4+i)));
}

/* ---------- ROOM ---------- */
const room=new THREE.Group();room.position.set(0,-30,0);scene.add(room);
const RM={};
{
 const std=(c,r=.9,e=0x000000,ei=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:0,emissive:e,emissiveIntensity:ei});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),std(0x0b1426));floor.rotation.x=-Math.PI/2;room.add(floor);
 const wallB=new THREE.Mesh(new THREE.PlaneGeometry(12,6),std(0x13213c));wallB.position.set(0,3,-1.6);room.add(wallB);
 const wallL=new THREE.Mesh(new THREE.PlaneGeometry(12,6),std(0x101c33));wallL.rotation.y=Math.PI/2;wallL.position.set(-1.9,3,0);room.add(wallL);
 // window on back wall
 const win=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.6),new THREE.MeshBasicMaterial({color:0x2a4a86}));win.position.set(.4,1.9,-1.59);room.add(win);
 const moon=new THREE.Mesh(new THREE.CircleGeometry(.13,40),new THREE.MeshBasicMaterial({color:0xeaf2ff}));moon.position.set(.7,2.35,-1.58);room.add(moon);
 const frameM=std(0x1a2a48,.6);[[0,1.9,.04,1.6],[.4,1.9,1.3,.04]].forEach(([x,y,w,h],i)=>{const f=new THREE.Mesh(new THREE.BoxGeometry(i?1.3:.04,i?.04:1.6,.04),frameM);f.position.set(i?.4:.4,1.9,-1.57);room.add(f)});
 // curtains
 RM.curt=[];[-.45,1.25].forEach(x=>{const g=new THREE.PlaneGeometry(.55,2.3,24,30);const c=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x7770A8,roughness:.8,transparent:true,opacity:.75,side:THREE.DoubleSide,emissive:0x2a2550,emissiveIntensity:.5}));c.position.set(x,1.75,-1.5);room.add(c);c.userData.base=Float32Array.from(g.attributes.position.array);RM.curt.push(c)});
 // bed
 const bed=new THREE.Mesh(new THREE.BoxGeometry(2.8,.42,1.7),std(0x1b2846));bed.position.set(0,.22,0);room.add(bed);
 const head=new THREE.Mesh(new THREE.BoxGeometry(.12,1.1,1.8),std(0x22314f,.7));head.position.set(-1.45,.75,0);room.add(head);
 const pillow=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),std(0x8f97aa,.95));pillow.scale.set(.36,.11,.55);pillow.position.set(-1.08,.52,0);room.add(pillow);
 // head (lying on side, face toward -z) + hair
 const skin=new THREE.MeshStandardMaterial({color:0xc9a07f,roughness:.55});
 const hd=new THREE.Mesh(new THREE.SphereGeometry(.14,40,30),skin);hd.scale.set(1.05,1,.95);hd.position.set(-1.0,.69,-.05);room.add(hd);RM.head=hd;
 const hairM=new THREE.MeshStandardMaterial({color:0x2b1c14,roughness:.45,metalness:.1});
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.152,40,30),hairM);hair.position.set(-1.015,.705,-.025);room.add(hair);
 const r=rng(44);for(let k=0;k<26;k++){const a=r()*1.6-.3;const p0=V(-1.05+r()*.06,.74+r()*.06,.06+r()*.05),p1=V(-1.2-r()*.15,.62,.12+r()*.18),p2=V(-1.28-r()*.15,.57,.05+a*.3);
  room.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0,p1,p2]),10,.012+r()*.008,5),hairM))}
 // blanket (deformable)
 const bg=new THREE.PlaneGeometry(2.25,1.85,90,60);bg.rotateX(-Math.PI/2);const bm=new THREE.Mesh(bg,new THREE.MeshStandardMaterial({color:0x34507e,roughness:.85,side:THREE.DoubleSide}));bm.position.set(.28,0,0);room.add(bm);
 RM.blanket=bm;RM.bbase=Float32Array.from(bg.attributes.position.array);
 const trim=new THREE.Mesh(new THREE.TorusGeometry(1,.008,6,60,Math.PI),new THREE.MeshBasicMaterial({color:0xD9B56D}));room.add(trim);trim.visible=false;
 // nightstand + lamp + clock
 const ns=new THREE.Mesh(new THREE.BoxGeometry(.5,.55,.45),std(0x1c2a48,.6));ns.position.set(-1.1,.28,-1.25);room.add(ns);
 const shade=new THREE.Mesh(new THREE.CylinderGeometry(.1,.16,.2,24,1,true),new THREE.MeshStandardMaterial({color:0xffd7a0,emissive:0xffb060,emissiveIntensity:1.6,side:THREE.DoubleSide}));shade.position.set(-1.2,.85,-1.3);room.add(shade);
 const stand=new THREE.Mesh(new THREE.CylinderGeometry(.015,.03,.3,8),std(0xb8913f,.3));stand.position.set(-1.2,.7,-1.3);room.add(stand);
 const lamp=new THREE.PointLight(0xffa04a,2.2,4,1.6);lamp.position.set(-1.2,.85,-1.2);room.add(lamp);
 const cc=document.createElement('canvas');cc.width=256;cc.height=96;RM.clockCanvas=cc;RM.clockTex=new THREE.CanvasTexture(cc);
 const clk=new THREE.Mesh(new THREE.PlaneGeometry(.26,.1),new THREE.MeshBasicMaterial({map:RM.clockTex,transparent:true}));clk.position.set(-.95,.6,-1.02);clk.rotation.y=.35;room.add(clk);
 const clkBox=new THREE.Mesh(new THREE.BoxGeometry(.3,.13,.06),std(0x0a1120,.4));clkBox.position.set(-.95,.6,-1.055);clkBox.rotation.y=.35;room.add(clkBox);
 // lights
 const moonL=new THREE.DirectionalLight(0x8fb0ff,1.1);moonL.position.set(.5,3,-1.2);moonL.target.position.set(-.6,.4,.3);room.add(moonL);room.add(moonL.target);
 const amb=new THREE.HemisphereLight(0x3a5a9a,0x0a0f1a,.55);room.add(amb);
 RM.brainGlow=new THREE.PointLight(0x56b8ff,0,4,1.5);room.add(RM.brainGlow);
}
let lastClock='';
function setRoom(tl,o){room.visible=true;
 const ck=o.clock||'23:47';if(ck!==lastClock){const x=RM.clockCanvas.getContext('2d');x.clearRect(0,0,256,96);x.fillStyle='#43D9F5';x.font='700 70px Mont';x.textAlign='center';x.shadowColor='#43D9F5';x.shadowBlur=14;x.fillText(ck,128,72);RM.clockTex.needsUpdate=true;lastClock=ck}
 // blanket shape: body lying on side, breathing
 const br=Math.sin(tl*1.25)*.012,pa=RM.blanket.geometry.attributes.position,b=RM.bbase;
 for(let i=0;i<pa.count;i++){const x=b[i*3]+.28,z=b[i*3+2];
  const torso=Math.exp(-1*((x+.55)/.38)**2-((z+.02)/.28)**2)*(.2+br*2.2);const hip=Math.exp(-1*((x-.05)/.3)**2-((z-.05)/.3)**2)*.2;const legs=Math.exp(-1*((z-.08)/.22)**2)*(x>.2?.12*Math.exp(-1*((x-.6)/.5)**2):0);
  const shoulder=Math.exp(-1*((x+.8)/.15)**2-((z+.0)/.2)**2)*.12;
  let y=.46+Math.max(torso,hip,legs,shoulder)+Math.sin(x*9+z*4)*.008;
  const ez=Math.abs(z)-.82;if(ez>0)y-=ez*2.2;
  if(x<-.85)y-=(-.85-x)*.25;
  pa.setY(i,y)}pa.needsUpdate=true;RM.blanket.geometry.computeVertexNormals();
 RM.curt.forEach((c,k)=>{const p=c.geometry.attributes.position,bb=c.userData.base;for(let i=0;i<p.count;i++){const x=bb[i*3],y=bb[i*3+1];p.setZ(i,Math.sin(x*14+k)*.04+Math.sin(tl*.9+y*1.5+k)*.04*(1.15-y/2.3))}p.needsUpdate=true});
}

/* ---------- DREAM objects (scene 4) ---------- */
const dream=new THREE.Group();scene.add(dream);
function iconTex(kind,accent='#43D9F5'){const c=document.createElement('canvas');c.width=256;c.height=192;const x=c.getContext('2d');
 x.fillStyle='rgba(67,217,245,.10)';x.fillRect(6,6,244,180);x.strokeStyle=accent;x.lineWidth=4;x.strokeRect(6,6,244,180);x.strokeStyle='#F2E7D0';x.lineWidth=5;x.lineCap='round';
 if(kind==='cup'){x.beginPath();x.moveTo(88,70);x.lineTo(96,140);x.lineTo(152,140);x.lineTo(160,70);x.closePath();x.stroke();x.beginPath();x.arc(164,104,18,-1.4,1.4);x.stroke();x.beginPath();x.moveTo(110,58);x.quadraticCurveTo(118,44,110,32);x.moveTo(134,58);x.quadraticCurveTo(142,44,134,32);x.stroke()}
 if(kind==='win'){x.strokeRect(78,42,100,108);x.beginPath();x.moveTo(128,42);x.lineTo(128,150);x.moveTo(78,96);x.lineTo(178,96);x.stroke();x.beginPath();x.arc(152,66,9,0,7);x.stroke()}
 if(kind==='book'){x.beginPath();x.moveTo(128,60);x.quadraticCurveTo(100,48,66,58);x.lineTo(66,140);x.quadraticCurveTo(100,130,128,142);x.quadraticCurveTo(156,130,190,140);x.lineTo(190,58);x.quadraticCurveTo(156,48,128,60);x.lineTo(128,142);x.stroke()}
 if(kind==='phone'){x.strokeRect(100,30,56,130);x.beginPath();x.arc(128,148,5,0,7);x.stroke();x.fillStyle='rgba(242,231,208,.6)';x.fillRect(110,50,36,8);x.fillRect(110,66,28,8)}
 if(kind==='room'){x.strokeRect(50,100,156,50);x.beginPath();x.ellipse(84,96,22,10,0,0,7);x.stroke();x.strokeRect(150,36,50,46)}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const fragM=k=>new THREE.MeshBasicMaterial({map:iconTex(k),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const DR={clocks:[],frags:[]};
{
 const r=rng(12);
 for(let k=0;k<5;k++){const g=new THREE.Group();const rad=.32+r()*.25;
  g.add(new THREE.Mesh(new THREE.TorusGeometry(rad,.035,16,64),goldM));
  const face=new THREE.Mesh(new THREE.CircleGeometry(rad,48),new THREE.MeshBasicMaterial({color:0x2a2450,transparent:true,opacity:.55,side:THREE.DoubleSide}));g.add(face);
  for(let h=0;h<12;h++){const tk=new THREE.Mesh(new THREE.BoxGeometry(.02,.07,.02),goldM);const a=h/12*Math.PI*2;tk.position.set(Math.cos(a)*rad*.82,Math.sin(a)*rad*.82,.01);tk.rotation.z=a+Math.PI/2;g.add(tk)}
  const hh=new THREE.Group(),mh=new THREE.Group();const H1=new THREE.Mesh(new THREE.BoxGeometry(.03,rad*.5,.02),goldM);H1.position.y=rad*.25;hh.add(H1);const H2=new THREE.Mesh(new THREE.BoxGeometry(.02,rad*.75,.02),goldM);H2.position.y=rad*.37;mh.add(H2);g.add(hh,mh);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.04,12,8),goldM));
  g.userData={hh,mh,base:V((r()*2-1)*1.5,(r()*2-1)*1.6+.3,-r()*2.5),sp:.5+r()*1.5,ph:r()*6};dream.add(g);DR.clocks.push(g)}
 ['cup','win','book'].forEach((k,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.68),fragM(k));m.userData={base:V(-1.1+i*1.1,-.1+(i%2)*.5,.6-i*.3),ph:i*2};dream.add(m);DR.frags.push(m)});
 const cl=[];for(let k=0;k<260;k++)cl.push({p:[(r()*2-1)*6,(r()*2-1)*7,-2-r()*5],c:[.35,.3,.6],s:1+r()*1.6,ph:r()});DR.clouds=makePoints(cl,{tw:.3});DR.clouds.material.uniforms.uOp.value=.035;dream.add(DR.clouds);
 const gp=[];for(let k=0;k<260;k++)gp.push({p:[(r()*2-1)*3,(r()*2-1)*4.5,(r()*2-1)*2.5],c:GOLD,s:.03+r()*.04,ph:r()});DR.gold=makePoints(gp,{tw:.8});dream.add(DR.gold);
}
/* ---------- MEMORY fragments (scene 6) ---------- */
const memG=new THREE.Group();scene.add(memG);const MEM=[];
{
 const r=rng(19);const kinds=['room','phone','book','cup','win','room','phone'];
 kinds.forEach((k,i)=>{const w=.8+r()*.35,h=w*.72;const pl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),fragM(k));pl.material.map=iconTex(k,i%2?'#D9B56D':'#43D9F5');
  const pos=V((r()*2-1)*1.3,(r()*2-1)*1.3+.4,(r()*2-1)*1.2);pl.position.copy(pos);pl.rotation.set((r()-.5)*.4,(r()-.5)*.8,(r()-.5)*.3);memG.add(pl);
  const pts=[],vel=[];for(let a=0;a<22;a++)for(let b=0;b<16;b++){pts.push({p:[0,0,0],c:i%2?GOLD:CYAN,s:.028,ph:r()});vel.push([(a/21-.5)*w,(b/15-.5)*h,(r()-.5)*.5,(r()-.5),(r()-.2),(r()-.5)])}
  const P=makePoints(pts,{tw:.5});memG.add(P);MEM.push({pl,P,vel,st:i*.55})});
}
/* ---------- NETWORK (scene 7) ---------- */
const net=new THREE.Group();scene.add(net);
{
 const r=rng(23),nodes=[];for(let k=0;k<170;k++){const a=r()*6.283,b=Math.acos(2*r()-1),d=2.1+r()*1.3;nodes.push([Math.sin(b)*Math.cos(a)*d*1.1,Math.cos(b)*d*.95-.2,Math.sin(b)*Math.sin(a)*d])}
 const seg=[],cc=[];nodes.forEach((a,i)=>{let c=0;for(let j=i+1;j<nodes.length&&c<3;j++){const b=nodes[j];if(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])<1.0){seg.push(...a,...b);const C=(i+j)%3?CYAN:GOLD;cc.push(...C,...C);c++}}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(seg,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));
 net.userData.lines=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));net.add(net.userData.lines);
 net.userData.nodes=makePoints(nodes.map((p,i)=>({p,c:i%3?CYAN:GOLD,s:.07+r()*.05,ph:r()})),{tw:.7});net.add(net.userData.nodes);
}
/* ---------- EEG wave (scene 3, camera space) ---------- */
const waveN=320;const waveG=new THREE.BufferGeometry();waveG.setAttribute('position',new THREE.BufferAttribute(new Float32Array(waveN*3),3));
const wcol=new Float32Array(waveN*3);for(let i=0;i<waveN;i++){const c=new THREE.Color(0x43d9f5).lerp(new THREE.Color(0x9a8cf0),i/waveN);wcol.set([c.r,c.g,c.b],i*3)}waveG.setAttribute('color',new THREE.BufferAttribute(wcol,3));
const wave=new THREE.Line(waveG,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));wave.frustumCulled=false;camera.add(wave);
const wave2=new THREE.Line(waveG,wave.material);wave2.frustumCulled=false;camera.add(wave2);
/* axon in camera space (scene 2) */
const axon=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-1,0,0),V(0,-.03,0),V(1,.02,0)]),40,.012,8),new THREE.MeshBasicMaterial({color:0xffb45a,transparent:true,opacity:.8}));camera.add(axon);

/* ---------- scene setups ---------- */
const bgCol=new THREE.Color();
function hideAll(){brain.visible=room.visible=dream.visible=memG.visible=net.visible=wave.visible=wave2.visible=axon.visible=mascot.G.visible=false;camera.fov=35;brain.position.set(0,0,0);brain.scale.setScalar(1);brain.rotation.set(0,0,0);bgCol.setHex(0x050b18);scene.fog=null}
const look=(p,t)=>{camera.position.copy(p);camera.lookAt(t)};
const proj={};
const SC=[
 {s:0,e:5,run(tl){setRoom(tl,{clock:tl<3.2?'23:47':'23:48'});bgCol.setHex(0x050a14);
   const bp=V(-.75,1.7,-.05).add(room.position);brain.position.copy(bp);brain.scale.setScalar(.36);brain.rotation.y=-.5;
   setBrain(tl,{op:sm((tl-.3)/3.5)*.75,fire:.35+.3*sm(tl/4),pulses:.4,smoke:1.4});RM.brainGlow.position.set(-.75,1.7,-.05);RM.brainGlow.intensity=sm(tl/4)*1.2;
   const fly=Math.pow(clamp((tl-4.1)/.9),2.2);
   const p0=V(2.1,1.25,2.1),p1=V(.25,1.05,1.05);const cp=p0.clone().lerp(p1,sm(tl/4.2)).add(room.position);
   const tg=V(-.95,1.05+sm(tl/4)*.3,-.05).add(room.position);
   cp.lerp(bp.clone().add(V(.25,.05,.35)),fly);tg.lerp(bp,fly);look(cp,tg)}},
 {s:5,e:11,run(tl){setBrain(tl,{op:1,fire:.25+.75*sm(tl/1.6)});const d=lerp(2.2,8.6,sm(tl/1.4));
   look(V(Math.sin(tl*.25)*1.2,.25,d),V(0,-.45,0));
   axon.visible=true;axon.position.copy(screenToCam(135,326,4.3));axon.scale.setScalar(1.1);
   const wx=lerp(300,170,sm((tl-.7)/2));poseMascot(tl,{x:wx,y:292,s:1.25,walk:tl>.7&&tl<2.7,armR:tl>2.9?'wave':null,look:tl>2.9?[0,.2]:[-1,0],turn:tl<2.8?-.9:0,mood:tl>2.9?'big':'smile'})}},
 {s:11,e:17,run(tl){const p=tl/6;const a=-.6+sm(p)*Math.PI*1.5;setBrain(tl,{op:1,fire:lerp(1,.8,p),split:lerp(1.4,-1.4,sm(p)),pulses:1-p*.7});
   look(V(Math.sin(a)*8.8,.7,Math.cos(a)*8.8),V(0,-.75,0));bgCol.setHex(0x050b18).lerp(new THREE.Color(0x020408),p);
   wave.visible=wave2.visible=true;const wp=waveG.attributes.position;const f=lerp(.55,.07,sm(p))*270/1.3,amp=lerp(.045,.13,sm(p));
   for(let i=0;i<waveN;i++){const u=i/(waveN-1),x=-.68+u*1.36;const y=Math.sin(u*f-tl*lerp(9,2,p))*amp+Math.sin(u*f*2.3+tl*3)*amp*.25*(1-p);wp.setXYZ(i,x,y,0)}wp.needsUpdate=true;
   wave.position.copy(screenToCam(135,264,4.2));wave2.position.copy(wave.position).add(V(0,.004,0));
   poseMascot(tl,{x:215,y:318,s:.95,look:[-.8,-.3],mood:p>.6?'o':'smile',bs:1})}},
 {s:17,e:23,run(tl){bgCol.setHex(0x150f2e);scene.fog=new THREE.FogExp2(0x150f2e,.05);setBrain(tl,{op:.35,fire:.5,pulses:.3,smoke:1.5});brain.scale.setScalar(1.6);brain.position.set(0,.2,-3.5);
   dream.visible=true;DR.clocks.forEach((g,k)=>{const u=g.userData;g.position.copy(u.base).add(V(Math.sin(tl*.5+u.ph)*.15,Math.sin(tl*.8+u.ph)*.18,0));g.rotation.set(Math.sin(tl*.4+u.ph)*.5,Math.sin(tl*.3+u.ph)*.7,Math.sin(tl*.2+u.ph)*.2);u.hh.rotation.z=-tl*u.sp*.3;u.mh.rotation.z=-tl*u.sp*2});
   DR.frags.forEach(m=>{const u=m.userData;m.position.copy(u.base).add(V(0,Math.sin(tl*.8+u.ph)*.12,0));m.rotation.set(Math.sin(tl*.5+u.ph)*.25,Math.sin(tl*.6+u.ph)*.5,Math.sin(tl*.4+u.ph)*.1);m.material.opacity=.65+.35*Math.sin(tl*1.7+u.ph)});
   [DR.clouds,DR.gold].forEach(o=>o.material.uniforms.uTime.value=tl);DR.clouds.position.x=Math.sin(tl*.2)*.6;DR.gold.position.y=tl*.06;
   look(V(Math.sin(tl*.5)*.35,.15+Math.cos(tl*.4)*.2,6.2),V(0,.05,0));camera.rotateZ(Math.sin(tl*.6)*.04);
   poseMascot(tl,{x:135,y:300,s:1.15,float:true,look:[Math.sin(tl*.9),Math.cos(tl*.7)*.5-.3],mood:'o',armL:'open',armR:'open'})}},
 {s:23,e:30,run(tl){const p=tl/7;setBrain(tl,{op:.75,fire:.3,hippo:sm((tl-.3)/1),stream:sm((tl-.6)/1),pulses:.2});
   const a=lerp(.25,-.15,sm(p)),d=lerp(8.4,5.6,sm(p));look(V(Math.sin(a)*d,.35,Math.cos(a)*d),V(-.05,-.35,.2));
   const hp=V(-.05,-.2,.36).project(camera);proj.hippo=[(hp.x+1)/2*270,(1-hp.y)/2*480];
   poseMascot(tl,{x:68,y:300,s:1.2,armR:'point',look:[.9,-.4],mood:'smile',bs:2})}},
 {s:30,e:36,run(tl){const p=tl/6;setBrain(tl,{op:.3*(1-p*.6),fire:.35,pulses:.2});brain.position.set(0,0,-2);
   memG.visible=true;MEM.forEach(M=>{const d=sm((tl-M.st)/2.4);M.pl.material.opacity=1-d;M.pl.visible=d<.99;M.pl.scale.set(1-d*.4,1-d*.4,1);
    const pa=M.P.geometry.attributes.position;const q=M.pl.quaternion,o=M.pl.position;for(let i=0;i<pa.count;i++){const v=M.vel[i];const lp=V(v[0]*(1-d*.4)+v[3]*d*1.4,v[1]*(1-d*.4)+v[4]*d*1.4+d*.3,v[2]*d+v[5]*d).applyQuaternion(q).add(o);pa.setXYZ(i,lp.x,lp.y,lp.z)}pa.needsUpdate=true;
    M.P.material.uniforms.uOp.value=d*(1-d)*3.2;M.P.material.uniforms.uTime.value=tl});
   look(V(0,.35,lerp(4.4,7.2,sm(p))),V(0,.2,0));bgCol.setHex(0x050b18).lerp(new THREE.Color(0x010204),p);
   poseMascot(tl,{x:205,y:305,s:1,look:[-.9,-.5],mood:'flat',bs:.5})}},
 {s:36,e:43,run(tl){const p=tl/7;const lit=lerp(.35,1,sm(p*1.3));setBrain(tl,{op:1,fire:lit,pulses:1});
   net.visible=true;net.rotation.y=tl*.12;net.userData.lines.material.opacity=.5*lit;const nu=net.userData.nodes.material.uniforms;nu.uOp.value=lit;nu.uTime.value=tl;
   const a=lerp(-.7,.7,sm(p)),d=lerp(10.5,9.4,p);look(V(Math.sin(a)*d,.5,Math.cos(a)*d),V(0,-.75,0));bloom.strength=.6+lit*.3;
   const turn=sm((tl-1.6)/1.2);poseMascot(tl,{x:135,y:305,s:1.45,turn:lerp(-1.1,0,turn),look:[0,lerp(-.4,0,turn)],mood:turn>.6?'big':'smile',armL:turn>.8?'open':null,armR:turn>.8?'open':null,bs:1.3})}},
 {s:43,e:50,run(tl){setRoom(tl,{clock:'23:58'});bgCol.setHex(0x050a14);
   const bp=V(-.75,1.75,-.05).add(room.position);brain.position.copy(bp);brain.scale.setScalar(.34);brain.rotation.y=-.5+tl*.06;
   setBrain(tl,{op:1,fire:.9,pulses:.8});RM.brainGlow.position.set(-.75,1.75,-.05);RM.brainGlow.intensity=1.6;
   const p=sm(tl/6.5);const cp=V(.35,1.3,1.05).lerp(V(2.3,1.75,2.45),p).add(room.position);look(cp,V(-.75,1.6,-.05).add(room.position));
   const bs=bp.clone().project(camera);proj.brain=[(bs.x+1)/2*270,(1-bs.y)/2*480]}}
];
function renderScene(i,t){hideAll();bloom.strength=.6;const tl=Math.max(0,t-SC[i].s);SC[i].run(tl);camera.updateProjectionMatrix();scene.background=bgCol;composer.render();
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
