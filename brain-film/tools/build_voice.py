# Narration: Piper TTS, Kazakh kk_KZ-issai-high, speaker 1. Writes assets/audio/voice.wav + assets/narration.json
# usage: <venv>/bin/python tools/build_voice.py <model.onnx> <tmpdir>
import subprocess, json, os, sys, wave, numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL, TMP = sys.argv[1], sys.argv[2]; os.makedirs(TMP, exist_ok=True)
TOTAL = 166.0
# chapters: (id, [sentences]); caption groups split by '|', *word* = yellow keyword
CH = [
 ('c1', ['Жүрек *тоқтады.*', 'Енді миға | не *болады?*']),
 ('c2', ['Ми — дене салмағының | небәрі *екі пайызы.*', 'Бірақ ол оттегінің | *жиырма пайызын* жұмсайды.', 'Онда *сексен алты миллиард* | нейрон бар.', 'Олар бір-біріне | *электр сигналдарын* жібереді.', 'Бірақ миде | оттегінің *қоры жоқ.*', 'Ол әр секунд сайын | *қан ағысына* тәуелді.']),
 ('c3', ['Жүрек тоқтаса, | миға *қан бармайды.*', 'Он-жиырма секундта | *сана сөнеді.*', 'Нейрондар | *энергиясыз* қалады.', 'Олар бір-бірімен | *сөйлесуді* тоқтатады.', 'Ми толқындары | *әлсірейді...*', 'Монитордағы сызық | *түзу* болады.']),
 ('c4', ['Бірақ ғалымдар | *күтпеген* нәрсені байқады.', 'Кейде ми | соңғы рет | *жарқ етеді.*', 'Бұл — | *гамма-толқындар.*', 'Олар ойлаумен | және *есте сақтаумен* байланысты.', 'Алдымен оны | *екі мың он үшінші* жылы | егеуқұйрықтардан көрді.', 'Оларда бұл жарқыл | *отыз секундқа* жуық созылды,', 'ал ми | тірі кездегіден де | *белсенді* көрінді.', '*Екі мың жиырма екінші* жылы — | сексен жеті жастағы | адамнан.', '*Екі мың жиырма үшінші* жылы — | төрт науқастың | екеуінен.']),
 ('c5', ['Бұл — *өмірдің* | көз алдыңнан | өтуі ме?', 'Сексен жеті жастағы адамда | бұл толқындар', '*естеліктерді* шақырғандағыдай | көрінді.', 'Кейбір ғалымдар | *солай болжайды.*', 'Бірақ бұл әлі | *дәлелденбеген.*']),
 ('c6', ['Содан кейін | *өлім толқыны* басталады.', 'Нейрондар | энергиясын жоғалтып, | бірінен соң бірі | *сөнеді.*', 'Бұл толқын | миды *баяу шарлап* өтеді.', 'Ғалымдар оны | *деполяризация* | толқыны деп атайды.']),
 ('c7', ['Бірақ ми | *бір сәтте* өлмейді.', 'Шамамен | *төрт-алты минуттан* кейін | ауыр зақым басталады.', 'Екі мың он тоғызыншы жылы | *Йель* ғалымдары', 'шошқа миының | кейбір жасушаларын', '*төрт сағаттан* кейін | ішінара жандандырды.', 'Бірақ *сана* | қайтып оралған жоқ.', 'Сондықтан алғашқы минуттарда | жасалған *жүрек массажы*', 'өмірді *сақтап қалады.*']),
 ('c8', ['Клиникалық өлімнен | *оралғандардың* кейбірі', 'ерекше нәрселерді айтады:', '*тоннель,* | *жарқын жарық,*', 'денеден | *бөлініп шыққандай* сезім.', 'Мұны жүрегі тоқтап, | қайта тірілгендердің', 'шамамен | *он пайызы* айтады.', 'Ғалымдар мұны | *оттегі тапшылығымен*', 'және ми белсенділігінің | *өршуімен* түсіндіреді.']),
 ('c9', ['Өлім — | *бір сәт* емес.', 'Ол — | *процесс.*', 'Ал ми | соңғы сәтке дейін | *күреседі.*', 'Ғылым бұл сұраққа | әлі *толық жауап* | берген жоқ.']),
]
VOICE = PiperVoice.load(MODEL)
def synth(text, path, ls):
    cfg = SynthesisConfig(speaker_id=1, length_scale=ls, noise_scale=0.6, noise_w_scale=0.8)
    out = []
    for ch in VOICE.synthesize(text, cfg): out.append(ch.audio_int16_array)
    a = np.concatenate(out)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(VOICE.config.sample_rate); w.writeframes(a.tobytes())
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode())
LS = 1.06
items = []
for cid, sents in CH:
    for si, s in enumerate(sents):
        text = s.replace('|', ' ').replace('*', '')
        text = ' '.join(text.split())
        raw, trim = f'{TMP}/{cid}_{si}.wav', f'{TMP}/{cid}_{si}.trim.wav'
        synth(text, raw, LS)
        subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',raw,'-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', trim], check=True)
        items.append({'ch': cid, 'raw': s, 'text': text, 'file': trim, 'd': dur(trim), 'last': si == len(sents) - 1})
speech = sum(i['d'] for i in items)
n_ch = len(CH); n_s = len(items) - n_ch
lead, tail = 0.4, 2.6
# gaps: chapter gap = 2.6 x sentence gap
avail = TOTAL - lead - tail - speech
g = avail / (n_s + 2.6 * (n_ch - 1))
print('speech', round(speech, 2), 'sentence gap', round(g, 2))
t = lead; groups = []; sentences = []; chapters = {}
for idx, it in enumerate(items):
    s, d = it['raw'], it['d']
    chapters.setdefault(it['ch'], [t, t + d]); chapters[it['ch']][1] = t + d
    sentences.append({'ch': it['ch'], 'text': it['text'], 'start': round(t, 3), 'end': round(t + d, 3), 'file': it['file']})
    parts = [p.strip() for p in s.split('|')]
    w = [len(p.replace('*', '')) + 3 for p in parts]; tot = sum(w); acc = t
    for p, wi in zip(parts, w):
        gd = d * wi / tot
        groups.append({'id': f'g{len(groups)}', 'ch': it['ch'], 'text': p, 'start': round(acc, 3), 'end': round(acc + gd, 3)}); acc += gd
    if idx < len(items) - 1: t += d + (g * 2.6 if it['last'] else g)
args = ['ffmpeg','-nostdin','-v','error','-y']; filt = []
for i, s in enumerate(sentences):
    args += ['-i', s['file']]; filt.append(f'[{i}:a]aresample=48000,adelay={int(s["start"]*1000)}:all=1[a{i}]')
mix = ''.join(f'[a{i}]' for i in range(len(sentences)))
chain = (f'{mix}amix=inputs={len(sentences)}:normalize=0,highpass=f=70,equalizer=f=150:t=q:w=1:g=2,equalizer=f=6500:t=q:w=1.5:g=-1.5,'
         'acompressor=threshold=-22dB:ratio=2.5:attack=12:release=220:makeup=1,aecho=0.8:0.6:38:0.12,'
         f'apad=whole_dur={TOTAL},atrim=0:{TOTAL},loudnorm=I=-16:TP=-1.5:LRA=9[out]')
args += ['-filter_complex', ';'.join(filt) + ';' + chain, '-map', '[out]', '-ar', '48000', '-ac', '1', f'{ROOT}/assets/audio/voice.wav']
subprocess.run(args, check=True)
json.dump({'total': TOTAL, 'chapters': {k: [round(a, 3), round(b, 3)] for k, (a, b) in chapters.items()},
           'sentences': [{k: v for k, v in s.items() if k != 'file'} for s in sentences], 'groups': groups},
          open(f'{ROOT}/assets/narration.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: [round(a, 1), round(b, 1)] for k, (a, b) in chapters.items()}))
