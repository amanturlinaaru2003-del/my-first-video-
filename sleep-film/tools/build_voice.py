import subprocess, json, os, wave
OUT = '/home/user/my-first-video-/sleep-film/assets'
TMP = '/tmp/claude-0/vo/build'; os.makedirs(TMP, exist_ok=True)
PIPER = '/tmp/claude-0/venv/bin/piper'; MODEL = '/tmp/claude-0/dl/issai/kk_KZ-issai-high.onnx'
# line: (id, start, length_scale, [sentences]); each sentence's caption groups split by '|'
LINES = [
 ('l1', 0.5, 1.12, ['Шаршадың... | бірақ неге ұйықтай | алмай жатырсың?']),
 ('l2', 5.4, 1.06, ['Түнде миың тынбайды.', 'Ертеңгі істер, | айтылмай қалған сөздер, | уайым — | бәрі ойыңа | қайта орала береді.']),
 ('l3', 15.3, 1.05, ['Қараңғыда мелатонин бөлінеді — | ұйқы гормоны.', 'Ал стресс | кортизолды көтереді — | ол сергек ұстап, | ұйқыны қуады.']),
 ('l4', 25.3, 1.10, ['Ал біз түнде | телефон ақтарамыз.', 'Көк жарық | мелатонинді тежейді.', 'Кешкі кофе | сағаттар бойы | сергек ұстайды.', 'Сағатқа қараған сайын, | уайым күшейеді.']),
 ('l5', 38.4, 1.12, ['Телефонды қой.', 'Жарықты сөндір.', 'Баяу дем ал...', 'Денең босаңсып, | ойың тынышталады.']),
 ('l6', 46.3, 1.02, ['Ұйқыңды бағала.', 'Денеңе демалыс бер.']),
]
GAP = 0.34
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode())
groups, sentences, inputs, filt = [], [], [], []
gi = 0
for lid, start, ls, sents in LINES:
    t = start
    for si, s in enumerate(sents):
        text = s.replace('|', '').replace('  ', ' ').strip()
        raw, trim = f'{TMP}/{lid}_{si}.wav', f'{TMP}/{lid}_{si}.trim.wav'
        subprocess.run([PIPER, '-m', MODEL, '-s', '1', '--length-scale', str(ls), '--noise-w-scale', '0.6', '-f', raw], input=text.encode(), check=True, capture_output=True)
        subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',raw,'-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', trim], check=True)
        d = dur(trim)
        sentences.append({'line': lid, 'text': text, 'start': round(t, 3), 'end': round(t + d, 3), 'file': trim})
        parts = [p.strip() for p in s.split('|')]
        weights = [len(p) + 3 for p in parts]; tot = sum(weights); acc = t
        for p, w in zip(parts, weights):
            gd = d * w / tot
            groups.append({'id': f'c{gi}', 'line': lid, 'text': p, 'start': round(acc, 3), 'end': round(acc + gd, 3)}); gi += 1
            acc += gd
        t += d + GAP
    print(lid, 'start', start, 'end', round(t - GAP, 2))
# assemble 50 s narration track
args = ['ffmpeg','-nostdin','-v','error','-y']
for i, s in enumerate(sentences):
    args += ['-i', s['file']]
    filt.append(f'[{i}:a]aresample=48000,adelay={int(s["start"]*1000)}:all=1[a{i}]')
mix = ''.join(f'[a{i}]' for i in range(len(sentences)))
# warm/deep: slight pitch drop (formants kept), low-mid warmth, de-harsh, gentle compression, small room
chain = (f'{mix}amix=inputs={len(sentences)}:normalize=0,'
         'rubberband=pitch=0.94:formant=preserved:transients=smooth,'
         'equalizer=f=140:t=q:w=0.9:g=3.5,equalizer=f=320:t=q:w=1.2:g=1.5,equalizer=f=3800:t=q:w=1.5:g=-2.5,highpass=f=70,'
         'acompressor=threshold=-20dB:ratio=3:attack=8:release=180:makeup=2,'
         'aecho=0.85:0.5:38|71:0.16|0.09,'
         'apad=whole_dur=50,atrim=0:50,loudnorm=I=-16:TP=-1.5:LRA=9[out]')
args += ['-filter_complex', ';'.join(filt) + ';' + chain, '-map', '[out]', '-ar', '48000', '-ac', '1', f'{OUT}/audio/voice.wav']
subprocess.run(args, check=True)
json.dump({'sentences': [{k: v for k, v in s.items() if k != 'file'} for s in sentences], 'groups': groups}, open(f'{OUT}/narration.json', 'w'), ensure_ascii=False, indent=1)
print('groups', len(groups), 'voice dur', dur(f'{OUT}/audio/voice.wav'))
