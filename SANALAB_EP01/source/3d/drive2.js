const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');const http=require('http');const path=require('path');
const root=path.resolve(__dirname,'..');
const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);return s.end()}const ext=path.extname(f);s.writeHead(200,{'Content-Type':{'.js':'text/javascript','.html':'text/html','.ttf':'font/ttf'}[ext]||'application/octet-stream'});s.end(d)})}).listen(+(process.env.PORT||8765));
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text())});
await p.goto('http://localhost:'+(process.env.PORT||8765)+'/r3d/'+(process.env.PAGE||'index.html')+'');try{await p.waitForFunction(()=>window.ready&&window.renderFrame,null,{timeout:90000})}catch(e){console.log(errs.join('\n'));process.exit(1)}await p.evaluate(()=>window.ready);
const mode=process.argv[2];
if(mode==='stills'){for(const t of process.argv.slice(3).map(Number)){const t0=Date.now();const d=await p.evaluate(t=>renderFrame(t),t);fs.writeFileSync((process.env.PFX||'s_')+t+'.jpg',Buffer.from(d.split(',')[1],'base64'));console.log(t,Date.now()-t0,'ms')}}
else{const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p',process.env.OUT||'video3d.mp4'],{stdio:['pipe','inherit','inherit']});
 const t0=Date.now();for(let f=0;f<1500;f++){const d=await p.evaluate(t=>renderFrame(t),f/30);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));if(f%100===0)console.log('frame',f,((Date.now()-t0)/1000|0)+'s')}
 ff.stdin.end();await new Promise(r=>ff.on('close',r))}
console.log([...new Set(errs)].slice(0,10).join('\n')||'no errors');await b.close();srv.close()})();
