import subprocess, json, os, wave, numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig
OUT = '/home/user/my-first-video-/synapse-film/assets'
TMP = '/tmp/claude-0/vo/syn'; os.makedirs(TMP, exist_ok=True)
PIPER = '/tmp/claude-0/venv/bin/piper'; MODEL = '/tmp/claude-0/dl/issai/kk_KZ-issai-high.onnx'
# line: (id, min_start, length_scale, [sentences]); caption groups split by '|'
LINES = [
 ('l1', 0.6, 1.02, ['Біз қазір | сенің миыңның ішіндеміз.', 'Мұнда сексен алты миллиард нейрон бар — | әрқайсысы мыңдаған көршісімен | байланысқан.']),
 ('l2', 10.0, 1.0, ['Бір ой туды... | Ол электр импульсі болып, | аксон бойымен жүгіреді.']),
 ('l3', 16.5, 1.0, ['Бірақ нейрондар | бір-біріне тимейді.', 'Арасында | кішкентай саңылау бар — | бұл синапс.']),
 ('l4', 24.5, 1.0, ['Импульс жеткенде, | көпіршіктер жарылып, | нейромедиаторлар шашырайды.']),
 ('l5', 30.5, 1.0, ['Олар келесі нейронның | рецепторларына қонады, | және сигнал | ары қарай жүреді.']),
 ('l6', 37.0, 1.0, ['Миллисекунд ішінде | мыңдаған синапс жанады.', 'Осылай естелік, | сезім | және идея туады.']),
 ('l7', 45.2, 1.04, ['Сен үйренген сайын, | бұл байланыстар | күшейе түседі.']),
]
GAP = 0.34
VOICE = PiperVoice.load(MODEL)
# Correct Kazakh pronunciation of loanwords (stress on the last syllable, plain "и")
OVERRIDE_OLD = {
  'мелатонин': list('melɑton') + ['ˈ', 'i', 'n'],
  'мелатонинді': list('melɑtonind') + ['ˈ', 'ɪ'],
  'кортизолды': ['k', 'o', 'ɾ', 't', 'i', 'z', 'o', 'ɫ', 'd', 'ˈ', 'ə'],
}
OVERRIDE = {}
def phon(word):
    return [x for sent in VOICE.phonemize(word) for x in sent]
def synth(text, path, ls):
    cfg = SynthesisConfig(speaker_id=1, length_scale=ls, noise_scale=0.667, noise_w_scale=0.8)
    audio = []
    for sent in VOICE.phonemize(text):
        seq = list(sent)
        for w, new in OVERRIDE.items():
            old = phon(w)
            for i in range(len(seq) - len(old) + 1):
                if seq[i:i + len(old)] == old and (i + len(old) == len(seq) or seq[i + len(old)] in (' ', ',', '.', '?', '!', '—')):
                    seq[i:i + len(old)] = new
                    print('  fixed stress:', w)
                    break
        a = VOICE.phoneme_ids_to_audio(VOICE.phonemes_to_ids(seq), cfg)
        audio.append(a); audio.append(np.zeros(int(0.3 * VOICE.config.sample_rate), dtype=a.dtype))
    a = np.concatenate(audio)
    a = (np.clip(a, -1, 1) * 32767).astype(np.int16) if a.dtype != np.int16 else a
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(VOICE.config.sample_rate); w.writeframes(a.tobytes())
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode())
groups, sentences, inputs, filt = [], [], [], []
gi = 0
prev_end = 0
for lid, start, ls, sents in LINES:
    t = max(start, prev_end + 0.5)
    for si, s in enumerate(sents):
        text = s.replace('|', '').replace('  ', ' ').strip()
        raw, trim = f'{TMP}/{lid}_{si}.wav', f'{TMP}/{lid}_{si}.trim.wav'
        synth(text, raw, ls)
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
    prev_end = t - GAP
    print(lid, 'start', start, 'end', round(t - GAP, 2))
# assemble 50 s narration track
args = ['ffmpeg','-nostdin','-v','error','-y']
for i, s in enumerate(sentences):
    args += ['-i', s['file']]
    filt.append(f'[{i}:a]aresample=48000,adelay={int(s["start"]*1000)}:all=1[a{i}]')
mix = ''.join(f'[a{i}]' for i in range(len(sentences)))
# warm/deep: slight pitch drop (formants kept), low-mid warmth, de-harsh, gentle compression, small room
chain = (f'{mix}amix=inputs={len(sentences)}:normalize=0,'
         'highpass=f=70,equalizer=f=160:t=q:w=1:g=1.5,equalizer=f=6500:t=q:w=1.5:g=-1.5,'
         'acompressor=threshold=-22dB:ratio=2:attack=15:release=250:makeup=1,'
         'apad=whole_dur=50,atrim=0:50,loudnorm=I=-16:TP=-1.5:LRA=9[out]')
args += ['-filter_complex', ';'.join(filt) + ';' + chain, '-map', '[out]', '-ar', '48000', '-ac', '1', f'{OUT}/audio/voice.wav']
subprocess.run(args, check=True)
json.dump({'sentences': [{k: v for k, v in s.items() if k != 'file'} for s in sentences], 'groups': groups}, open(f'{OUT}/narration.json', 'w'), ensure_ascii=False, indent=1)
print('groups', len(groups), 'voice dur', dur(f'{OUT}/audio/voice.wav'))
