import numpy as np, wave
SR=48000; DUR=50.0; N=int(SR*DUR)
rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
t_all=np.arange(N)/SR

def add(sig,start,pan=0.0,gain=1.0):
    i=int(start*SR);
    if i<0: sig=sig[-i:]; i=0
    j=min(N,i+len(sig)); sig=sig[:j-i]*gain
    L[i:j]+=sig*np.sqrt((1-pan)/2); R[i:j]+=sig*np.sqrt((1+pan)/2)
def env_adsr(n,a,r):
    e=np.ones(n); na=int(a*SR); nr=int(r*SR)
    if na>0: e[:na]=np.linspace(0,1,na)**2
    if nr>0: e[-nr:]*=np.linspace(1,0,nr)**2
    return e
def hz(m): return 440*2**((m-69)/12)
def pad_note(m,dur,a=1.5,r=1.8,bright=5,amp=.08):
    n=int(dur*SR); t=np.arange(n)/SR; f=hz(m); s=np.zeros(n)
    for det in (-0.12,0.0,0.11):
        ff=f*2**(det/12)
        for h in range(1,bright+1):
            s+=np.sin(2*np.pi*ff*h*t+rng.random()*6.28)/(h**1.6)
    s*=0.5+0.5*np.sin(2*np.pi*0.13*t+rng.random()*6)*0.4+0.3
    return s*env_adsr(n,a,r)*amp/3
def chord(notes,start,dur,**k):
    for i,m in enumerate(notes): add(pad_note(m,dur,**k),start,pan=(i/(max(1,len(notes)-1))-.5)*.6)
def band_noise(n,lo,hi):
    x=rng.standard_normal(n); X=np.fft.rfft(x); f=np.fft.rfftfreq(n,1/SR)
    X[(f<lo)|(f>hi)]=0; y=np.fft.irfft(X,n); return y/ (np.abs(y).max()+1e-9)
def blip(f,dur=.18,amp=.12,decay=18):
    n=int(dur*SR); t=np.arange(n)/SR
    return (np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*2*f*t))*np.exp(-decay*t)*amp*np.minimum(1,t*800)
def bell(f,dur=2.0,amp=.08):
    n=int(dur*SR); t=np.arange(n)/SR; s=np.zeros(n)
    for h,a,d in ((1,1,2.5),(2.76,.5,4),(5.4,.25,6),(8.9,.12,9)): s+=a*np.sin(2*np.pi*f*h*t)*np.exp(-d*t)
    return s*amp*np.minimum(1,t*2000)
def thump(f0=60,dur=.35,amp=.6):
    n=int(dur*SR); t=np.arange(n)/SR; f=f0*(1+1.2*np.exp(-30*t))
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-11*t)*amp
def whoosh(center,length=1.0,lo=300,hi=5000,amp=.22):
    n=int(length*SR); x=band_noise(n,lo,hi); t=np.linspace(0,1,n)
    e=np.where(t<.65,(t/.65)**2.5,np.exp(-(t-.65)*9)); add(x*e*amp,center-length*.65,pan=0)
    # stereo sweep
    add(x[::-1]*e*amp*.4,center-length*.65,pan=.7)

# ---------- MUSIC ----------
# 0-11 mysterious: A minor, low drone
chord([45,52,60],0.0,12.0,a=2.5,r=2.0,bright=4,amp=.09)
add(pad_note(33,12,a=3,r=2,bright=3,amp=.16),0)                     # sub A1 bass
# 11-23 dreamy: Fmaj7 -> Dm9
chord([41,48,57,64],10.5,7.5,a=1.8,r=2.0,amp=.075)
chord([38,45,53,60,64],16.5,8.0,a=1.8,r=2.2,amp=.075)
# 23-30 hippocampus: Am(add9) warm
chord([45,52,59,60,64],23.0,8.0,a=1.5,r=2.0,amp=.075)
# 30-36 atmospheric bass: Dm low, thinner
chord([38,50,57],29.8,5.4,a=1.2,r=1.0,bright=3,amp=.08)
add(pad_note(26,5.4,a=1.5,r=1.0,bright=2,amp=.2),29.8)
# 36-43 emotional rise: F -> G with crescendo
for notes,st,du in (([41,48,57,60,65],35.8,4.5),([43,50,59,62,67],39.8,3.8)):
    for i,m in enumerate(notes):
        s=pad_note(m,du,a=1.0,r=1.0,bright=6,amp=.085); s*=np.linspace(.6,1.4,len(s)); add(s,st,pan=(i/4-.5)*.7)
add(pad_note(29,4.5,a=1,r=.8,bright=2,amp=.18),35.8); add(pad_note(31,3.8,a=.6,r=.5,bright=2,amp=.2),39.8)
# 43-50 resolution: C major add9
chord([36,43,52,60,62,67],43.0,7.0,a=.6,r=3.0,amp=.085)
add(pad_note(24,7,a=.8,r=3,bright=2,amp=.18),43.0)

# ---------- SFX ----------
# heartbeat 0-5 (60 bpm, lub-dub), fading as eyes close
for k,b in enumerate(np.arange(0.35,5.0,1.0)):
    g=1-k*.12; add(thump(58,amp=.55*g),b); add(thump(52,amp=.38*g),b+.27)
# mysterious bass swell 0-5
s=band_noise(int(5*SR),30,120)*np.sin(np.linspace(0,np.pi,int(5*SR)))*.08; add(s,0)
# zoom-into-eye zap + whoosh at 5.0
whoosh(5.0,1.4,200,7000,.3); add(blip(1760,.6,.05,6),4.85,pan=.3); add(blip(2637,.6,.04,6),4.95,pan=-.3)
# neural pulses 5-11 regular, 11-17 slowing (matches EEG wave slowing)
pent=[69,72,74,76,79,81,84]; tt=5.4
while tt<17:
    iv=0.42 if tt<11 else 0.42+ (tt-11)/6*0.75
    m=pent[rng.integers(len(pent))]+(12 if rng.random()<.3 else 0)
    add(blip(hz(m),.22,.07 if tt<11 else .06*(1-(tt-11)/8),16),tt,pan=rng.uniform(-.7,.7)); tt+=iv
amb=band_noise(int(12*SR),1500,6000)*.012*env_adsr(int(12*SR),1.5,2); add(amb,5,pan=-.2)
# transition whooshes
for b in (11,17,23,30,36,43): whoosh(b,1.0,300,5000,.17)
# 17-23 dream shimmer
for k in range(26):
    st=17.2+k*.22+rng.uniform(0,.1); add(bell(hz(84+[0,3,5,7,10,12][k%6]),1.8,.022),st,pan=rng.uniform(-.8,.8))
sh=band_noise(int(6*SR),4000,10000)*.02*(.5+.5*np.sin(2*np.pi*3*np.arange(int(6*SR))/SR)); add(sh*env_adsr(len(sh),1.5,1.5),17,pan=.3)
# 23-30 golden shimmer flowing into hippocampus + soft pulses
for k in range(24):
    add(bell(hz(rng.choice([88,91,93,95,96,100])),1.2,.02),23.3+k*.28,pan=rng.uniform(-.6,.6))
for b in np.arange(23.5,30,0.95): add(thump(90,.25,.12),b)
# 30-36 memory fragments dissolving: crumbling granular + silence dip
for k in range(7):
    st=30+k*.55+1.0
    n=int(1.2*SR); g=band_noise(n,2000,9000)*np.exp(-np.linspace(0,5,n))*(rng.random(n)<.02)*.5
    add(g,st,pan=rng.uniform(-.6,.6)); add(bell(hz(76+k),1.0,.02),st,pan=rng.uniform(-.5,.5))
# 36-43 riser into outro
n=int(3*SR); ris=band_noise(n,500,8000); env=np.linspace(0,1,n)**3; add(ris*env*.08,40.0)
add(thump(45,1.2,.35),36.1)
# 43-50 particles rising, logo impact, shine
for k in range(18): add(bell(hz(72+k*1.5),.9,.018),44.8+k*.1,pan=rng.uniform(-.5,.5))
add(thump(42,2.0,.7),46.6); add(band_noise(int(1.5*SR),30,200)*np.exp(-np.linspace(0,6,int(1.5*SR)))*.25,46.6)
for f in (hz(84),hz(88),hz(91)): add(bell(f,3.0,.05),46.62)
n=int(.9*SR); sw=band_noise(n,5000,12000)*np.sin(np.linspace(0,np.pi,n))*.06; add(sw,47.6,pan=-.6); add(sw[::-1],47.6,pan=.6)

# ---------- silence dip 34.8-35.3 ----------
g=np.ones(N); a,b=int(34.75*SR),int(35.35*SR); f=int(.08*SR)
g[a:a+f]=np.linspace(1,.03,f); g[a+f:b-f]=.03; g[b-f:b]=np.linspace(.03,1,f)
L*=g; R*=g

# ---------- reverb ----------
def conv(x,ir):
    n=len(x)+len(ir)-1; nf=1<<(n-1).bit_length()
    return np.fft.irfft(np.fft.rfft(x,nf)*np.fft.rfft(ir,nf),nf)[:len(x)]
irn=int(2.6*SR); tir=np.arange(irn)/SR
irL=rng.standard_normal(irn)*np.exp(-tir*2.4); irR=rng.standard_normal(irn)*np.exp(-tir*2.4)
irL/=np.sqrt((irL**2).sum()); irR/=np.sqrt((irR**2).sum())
wl,wr=conv(L,irL),conv(R,irR)
L2=L*.8+wl*.35; R2=R*.8+wr*.35
# fades
fo=int(1.2*SR); L2[-fo:]*=np.linspace(1,0,fo)**1.5; R2[-fo:]*=np.linspace(1,0,fo)**1.5
fi=int(.3*SR); L2[:fi]*=np.linspace(0,1,fi); R2[:fi]*=np.linspace(0,1,fi)
st=np.stack([L2,R2],1); st/=np.abs(st).max()/0.7
with wave.open('music_sfx_raw.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
