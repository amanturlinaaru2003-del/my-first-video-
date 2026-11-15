const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+__dirname+'/render.html');await p.evaluate(()=>window.ready);
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-r','30','video_noaudio.mp4'],{stdio:['pipe','inherit','inherit']});
const N=1500;for(let f=0;f<N;f++){const d=await p.evaluate(t=>render(t),f/30);const buf=Buffer.from(d.split(',')[1],'base64');if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%250===0)console.log('frame',f);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done');})();
