"""Synthesize original collision tones and mux the final MP4."""
import json, subprocess, wave
from pathlib import Path
import numpy as np
p=Path(__file__).resolve().parents[1]/'output'
data=json.loads((p/'audio-notes.json').read_text());sr=48000
y=np.zeros((round(data['duration']*sr),2),np.float32)
for note in data['notes']:
    n=int(note['d']*sr);t=np.arange(n)/sr;f=note['f'];d=note['d']
    if note['kind']=='birth':
        phase=2*np.pi*f*(t-.175*t*t/d)
        tone=np.sin(phase)
    else:
        tone=np.sin(2*np.pi*f*t)+.20*np.sin(2*np.pi*f*2*t)+.08*np.sin(2*np.pi*f*3*t)
    env=np.minimum(t/.003,1)*np.exp(-t/(d/5))
    env*=np.minimum((d-t)/.008,1)
    sig=(tone*env*note['a']).astype(np.float32)
    start=round(note['t']*sr);n=min(n,len(y)-start)
    if n<=0:continue
    pan=.13 if note['kind']=='birth' else -.13
    y[start:start+n,0]+=sig[:n]*(1-pan)
    y[start:start+n,1]+=sig[:n]*(1+pan)
# Subtle original short echo. No music bed; sound is driven by real events.
dry=y.copy()
for delay,amount in [(0.075,.10),(0.133,.055)]:
    k=int(sr*delay);y[k:]+=dry[:-k,::-1]*amount
peak=float(np.max(np.abs(y)));y*=min(1.8,.79/max(peak,1e-8))
wav=p/'sound.wav'
with wave.open(str(wav),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((y*32767).astype('<i2').tobytes())
output=p/'can-it-eat-them-all-pilot-01.mp4'
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(p/'silent.mp4'),'-i',str(wav),'-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',str(output)],check=True)
print(json.dumps({'audio_peak':float(np.abs(y).max()),'notes':len(data['notes']),'file':str(output),'bytes':output.stat().st_size}))
