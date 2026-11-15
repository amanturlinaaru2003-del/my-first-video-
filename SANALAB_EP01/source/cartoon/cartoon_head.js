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
