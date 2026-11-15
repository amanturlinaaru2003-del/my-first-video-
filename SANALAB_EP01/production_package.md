# SANALAB · 1-бөлім — Өндірістік пакет

**Тақырып:** БІЗ НЕГЕ ҰЙЫҚТАП КЕТКЕН СӘТІМІЗДІ ЕСТЕ САҚТАМАЙМЫЗ?
**Формат:** 9:16 · 1080×1920 · 30 fps · 50 сек · қазақ тілі · Instagram Reels / TikTok

Бұл папкада:

| Файл | Не үшін |
|---|---|
| `SANALAB_EP01_animatic.mp4` | 50 секундтық дайын **анимациялық черновик** (аниматик). Барлық уақыт, субтитр, жазу, музыка мен дыбыс эффектілері орнында. Сурет стилі — схемалық 2D, фотореалистік CGI емес. Дикторлық дауыс жоқ. |
| `music_sfx.wav` | Түпнұсқа музыка + дыбыс эффектілері (48 kHz, стерео, −16 LUFS). Авторлық құқық мәселесі жоқ — толық осы жобаға жасалды. |
| `subtitles_kk.srt` | Қазақша субтитр файлы (CapCut-қа импорттауға болады). |
| `production_package.md` | Осы құжат: промпттар, мәтін, кесте, нұсқаулықтар. |

> Аниматик — монтаждың «қаңқасы». Генераторда жасалған фотореалистік клиптерді CapCut-та аниматиктің үстіне кадр-кадрымен ауыстырып қоясыз; уақыт, дыбыс пен субтитр дайын тұрады.

---

## 1. Шешімдер (келісілген өзгерістер)

- Кейіпкер — **ұйқыға кетіп бара жатқан әйел** (диктордың ер дауысымен контраст).
- Маскоттың аты — **Сана** (SANA-LAB). Қаласаңыз, өзгертуге болады.
- Сағат **23:47 → 23:48** (03:00 ұйқысыздық әсерін береді).
- Ғылыми түзетулер: гипнагогиялық бейнелерді кейбір адамдар есте сақтайтыны айтылады; ұйқыға дейінгі соңғы минуттардың да ұмытылатыны қосылды.
- Түс пропорциясы: 60% #101D32 · 25% #7770A8 · 10% #D9B56D · 5% #43D9F5. Біртұтас teal-gold color grade.
- **Типография түзетуі:** Manrope қаріпінде Ә Ғ Қ Ң Ұ әріптері **жоқ**. Сондықтан қосалқы мәтінге **Montserrat SemiBold** қолданылады. Субтитр — PT Sans Bold, тақырыптар — Montserrat ExtraBold.

---

## 2. Сторибордтың уақыт кестесі

| # | Уақыт | Кадр | Камера | Экрандағы жазу |
|---|---|---|---|---|
| 1 | 00:00–00:05 | HOOK — ұйқыға кетіп бара жатқан әйел | Extreme close-up, баяу dolly-in, соңында көзге «кіру» | «Сен мұны ешқашан байқаған жоқсың…» (0,2–2,9 с) |
| 2 | 00:05–00:11 | Миға кіру, Сана пайда болады | Macro tracking, баяу pan | — |
| 3 | 00:11–00:17 | Ояулықтан ұйқыға өту | 360° орбита | ОЯУЛЫҚ → ҰЙҚЫ |
| 4 | 00:17–00:23 | Гипнагогия | Қалқыған tracking | ГИПНАГОГИЯ |
| 5 | 00:23–00:30 | Гиппокамп | Macro push-in + орбита | ГИППОКАМП (стрелкамен) |
| 6 | 00:30–00:36 | Естеліктің ыдырауы | Баяу dolly-out | — |
| 7 | 00:36–00:43 | Ғылыми түйін | Баяу орбита | — |
| 8 | 00:43–00:50 | Бренд аутро, толық ұйқы | Cinematic pull-back | SANALAB · 1-БӨЛІМ · «Келесі бөлімде: Неге біз түсімізді ұмытамыз?» |

---

## 3. Кейіпкерлердің үлгі парақтары

**A. Әйел (1 және 8-кадр)**
```
Character reference sheet, photorealistic adult woman, early 30s, natural face with realistic skin pores and subtle freckles, soft dark brown shoulder-length hair with fine flyaway strands, elegant champagne silk sleepwear with natural fabric folds, drowsy expression: heavy half-closed eyelids, relaxed jaw, calm face, three states shown left to right: eyes half-open and tired, eyelids nearly closed, fully asleep; front view, side profile, three-quarter view; same identity in all views, anatomically correct, cool moonlight on one side and warm skin tones, cinematic teal-gold color grade, 8K --ar 9:16
```

**B. Сана — SANALAB Алтын Нейроны**
```
Character turnaround and pose sheet of the SANALAB golden neuron mascot named Sana: polished metallic gold body (#D9B56D) with soft reflections, round soma head, large expressive eyes with cyan glow (#43D9F5), small eyebrows, small friendly mouth, slender dendrite arms and legs, 5 glowing neuron branches on top with cyan tips; poses: walking, waving, pointing like a teacher, floating, thoughtful, turning toward viewer and smiling; identical design in every pose, dark navy background (#101D32), premium cinematic CGI, not cartoonish --ar 9:16
```

**Сәйкестік ережесі:** алдымен A мен B парақтарын жасаңыз → әр кадрда reference ретінде жүктеңіз (Midjourney `--cref <url> --cw 100`, Kling/Flux — Character reference). Бір seed пен бір стиль сөзін (`teal-gold cinematic grade`) барлық кадрда сақтаңыз.

---

## 4. Сегіз сурет промпты (image) — «жарқыраған ми» стилінде

**Стиль үлгісі:** түнгі бөлмеде ұйықтап жатқан әйел, басының үстінде мөлдір, көгілдір жарықтан жасалған ми; терең көк фондағы, ішінде алтын-қызғылт сары нейрон ұшқындары бар жарқыраған ми.
Пайдаланушы жіберген Pinterest суреттері **тек стиль үлгісі** ретінде қолданылады (Midjourney `--sref`), видеоға тікелей қойылмайды — олар басқа авторлардікі.

**Әр промптқа қосылатын стиль бөлігі (STYLE):**
```
ethereal translucent holographic brain made of glowing blue light filaments and wispy luminous smoke, tiny star-like particles, warm orange-gold neuron sparks and branching dendrites, deep dark navy background, low-key cinematic lighting, teal and orange color grade, shot on full-frame camera 35mm, shallow depth of field, photorealistic, 8K
```

**1. HOOK**
```
Cinematic side-profile shot of the same photorealistic woman (from reference) lying in bed in a dark moody bedroom at night, she is falling asleep, eyelids heavy and half-closed, soft warm bedside lamp glow on the left, cool blue moonlight on her face, rumpled grey-blue bedding, above her head a faint translucent glowing blue brain is just beginning to appear as wisps of light and smoke, digital clock "23:47" softly out of focus, + STYLE --ar 9:16
```

**2. ENTER THE BRAIN**
```
Glowing human brain in side view floating in darkness, translucent blue luminous outline with detailed cortical folds, inside it hundreds of warm orange-gold neurons fire like tiny stars connected by branching filaments, glowing brain stem with golden nerve roots spreading downward, sparks drifting, the golden neuron mascot Sana (from reference) standing on a glowing golden filament at the bottom and waving, + STYLE --ar 9:16
```

**3. SLEEP TRANSITION**
```
Translucent glowing blue brain floating in the upper half of frame, left side bright with dense fast-firing orange-gold neurons, right side calmer with slow purple light waves, a luminous EEG wave line below the brain changing from fast cyan ripples to slow purple waves, the scene gradually darkening, the mascot Sana watching from the lower right, + STYLE --ar 9:16
```

**4. HYPNAGOGIA**
```
Dreamlike space inside a glowing translucent brain, wisps of blue luminous smoke, floating translucent golden clocks and faint holographic memory fragments (a tea cup, a window, an open book), drifting star particles, purple and navy haze, the mascot Sana floating in the center with an amazed face and open arms, surreal yet photorealistic, + STYLE --ar 9:16
```

**5. HIPPOCAMPUS**
```
Glowing translucent blue brain in side view, deep inside the medial temporal lobe the anatomically accurate seahorse-shaped hippocampus shines in bright orange-gold, streams of golden sparks flow through neural filaments into it, the mascot Sana in the lower left pointing at it like a teacher, clean dark space on the right for a label, medical-grade accuracy, + STYLE --ar 9:16
```

**6. MEMORY FORMATION**
```
Holographic glowing memory fragments (translucent images of a bedroom, a phone screen, a book page) breaking apart near a translucent blue brain, dissolving into orange-gold and blue star particles that fade into deep darkness, strong vignette, the mascot Sana in the lower right watching thoughtfully, melancholic mood, + STYLE --ar 9:16
```

**7. SCIENTIFIC REVEAL**
```
Breathtaking glowing human brain in the upper center, luminous blue translucent shell, inside thousands of orange-gold neurons and branching dendrites lighting up together, golden nerve filaments spreading outward into a vast glowing neural network with sparks, the mascot Sana in the foreground facing the viewer with a warm smile and open arms, epic emotional lighting, + STYLE --ar 9:16
```

**8. BRAND OUTRO**
```
Cinematic shot of the same woman (from reference) now fully asleep in side profile in the dark moody bedroom, peaceful face, grey-blue bedding, warm lamp glow on the left, above her a large ethereal translucent glowing blue brain made of light filaments and smoke with orange-gold sparks, golden particles rising from the brain into the upper third of frame, empty space at the top for a logo, + STYLE --ar 9:16
```
> SANALAB жазуын генератордан сұрамаңыз — әріптер бұзылады. CapCut-та қосасыз (10-бөлімді қараңыз).

**Midjourney кеңесі:** `--sref <стиль суретінің url> --sw 200` (стиль) және `--cref <әйел парағы> --cw 100` (кейіпкер) бірге. Ми мен адамды бір кадрда шығару қиын болса, екі қабат жасаңыз: бөлмедегі әйел + қара фондағы ми, CapCut-та «Screen» режимімен біріктіріңіз — ми табиғи жарқырайды.

---

## 5. Сегіз анимация промпты (image-to-video)

Әр промптың соңына қосыңыз: `smooth natural motion, consistent character design, no morphing, no flicker, no text`.

| # | Ұзақтығы | Промпт |
|---|---|---|
| 1 | 5 с | Her eyelids slowly grow heavy and close over 4 seconds with one small natural flutter at 2 seconds, chest rises and falls with slow breathing, head sinks slightly into the pillow, hair strand moves with her breath, curtain sways gently, camera performs a slow smooth dolly-in toward her eye, in the last half second the camera accelerates into the closed eye. |
| 2 | 6 с | Camera emerges from a cyan glow into the brain and settles; electrical impulses travel along the golden and cyan pathways; Sana walks in from the right along the glowing axon with natural steps, stops, turns to camera and waves happily; slow lateral camera drift. |
| 3 | 6 с | Slow 360-degree orbit around the brain; the wave below gradually slows down and grows larger as cyan turns into purple; the scene slowly darkens; Sana turns his head following the wave and his mouth opens slightly in wonder. |
| 4 | 6 с | Floating camera with gentle sway; clocks drift and their hands spin at different speeds; memory fragments float and flicker softly; clouds drift sideways; Sana floats up and down, looking around in amazement with arms open. |
| 5 | 7 с | Slow push-in toward the glowing hippocampus with a slight orbit; golden particles stream along pathways into the hippocampus which pulses gently; Sana points at it and nods like a teacher. |
| 6 | 6 с | Slow dolly-out; memory fragments crack one by one and dissolve into drifting particles that fade into darkness; vignette deepens; Sana watches with a sad thoughtful face and slightly lowered shoulders. |
| 7 | 7 с | Slow orbit; the neural network brightens progressively; at 2 seconds Sana turns from looking at the brain to face the viewer, smiles warmly and opens his arms; light swells emotionally. |
| 8 | 7 с | She breathes slowly and shifts slightly into a more comfortable position; golden particles drift upward and gather in the upper third; camera slowly pulls back; calm ending. |

---

## 6. Камера бойынша нұсқаулық

- **1→2:** камера көзге қарай жылдамдай кіреді → көгілдір жарқыл → ми ішінен шығады (match cut). Бұл видеодағы жалғыз «жылдам» қимыл.
- **Қалған ауысулар:** 0,6 с жұмсақ crossfade + whoosh. Бірдей zoom-ды қатарынан қайталамаңыз: in (1) → drift (2) → orbit (3) → float (4) → push-in (5) → out (6) → orbit (7) → pull-back (8).
- Объектив эквиваленті: 1-кадр 85–100 мм macro, 2–7-кадр 35–50 мм, 8-кадр 24–28 мм.
- Тереңдік: фондағы бөлшектер мен bokeh әрқашан қозғалып тұрсын — статикалық кадр болмайды.

---

## 7. Дикторлық мәтін (уақытымен)

**Дауыс:** ер адам, терең, жылы, сабырлы, зиялы; таза қазақша айтылым; құпиялы, бірақ қызықты. Темп ≈ 2 сөз/сек.

| Уақыт | Мәтін | Ескерту |
|---|---|---|
| 00:00,3–00:04,7 | Сен ұйықтап кеткен сәтіңді есіңе түсіре аласың ба? | Баяу, сыбырға жақын, соңы сұрақ интонациясымен |
| 00:05,3–00:10,6 | Ұйқыға кету — мидың бір сәтте өшіп қалуы емес. | «өшіп» сөзінен кейін қысқа үзіліс |
| 00:11,3–00:16,6 | Бұл — ояулықтан ұйқыға өтетін күрделі үдеріс. | |
| 00:17,2–00:22,8 | Осы аралықта гипнагогиялық бейнелер пайда болуы мүмкін. Кейбіреулер оларды есте сақтайды да. | **ги-пна-го-ги-я-лық** — анық, баяу |
| 00:23,4–00:29,6 | Гиппокамп жаңа естеліктерді қалыптастыруға қатысады. | **гип-по-КАМП** — екпін соңғы буында |
| 00:30,3–00:34,6 | Ұйқыға өту сәтіндегі тәжірибе әрдайым естелікке айнала бермейді. | Кейін 34,8–35,3 с **толық тыныштық** |
| 00:36,3–00:42,8 | Сондықтан біз ұйқының басталуын емес, оған дейінгі сәттерді ғана еске аламыз. Кейде соңғы бірнеше минут та ұмытылады. | Эмоционалды көтеріліс, соңғы сөйлем — таңғалдыратын факт |
| 00:43,3–00:48,6 | Ал сен мұны бұрын білдің бе? SANALAB-пен бірге ми құпияларын зерттейік. | Жылы, жымиған дауыспен |

**Дауыс жазу нұсқалары:** (1) тірі диктор — ең жақсы сапа; (2) ElevenLabs (Multilingual v2/v3) немесе Microsoft Azure `kk-KZ-DauletNeural` (ер дауыс). AI дауыстан кейін «гипнагогиялық» және «гиппокамп» сөздерін міндетті түрде тыңдап тексеріңіз.

---

## 8. Музыка промпты (Suno / Udio / Stable Audio)

`music_sfx.wav` дайын, бірақ басқа нұсқа керек болса:
```
Original cinematic science documentary score, 50 seconds, 9 sections. 0-11s: mysterious dark ambient in A minor, deep sub-bass drone, soft heartbeat pulse. 11-23s: dreamy evolving synth pads Fmaj7 to Dm9, sparse electronic neural blips that gradually slow down, glassy shimmering textures. 23-30s: warm Am add9 pad with gentle golden bell sparkles. 30-36s: sparse atmospheric low bass, near silence. 36-43s: emotional cinematic build-up F to G, strings-like swelling pads, rising riser. 43-50s: peaceful C major add9 resolution, soft logo bell hit at 46.6s, gentle fade out. No vocals, no drums kit, no lyrics, leaves space for male narration.
```

**Микс:** музыка дауыстан 18–25 dB төмен (CapCut: дауыс 0 dB, музыка ≈ −20 dB, Auto-ducking қосулы).

---

## 9. Дыбыс эффектілерінің кестесі

| Уақыт | Эффект | Визуалмен байланысы |
|---|---|---|
| 00:00,35–00:04,8 | Жүрек соғысы (60 bpm, біртіндеп әлсірейді) | Қабақ жабылған сайын бәсеңдейді |
| 00:00–00:05 | Құпия терең бас | Hook атмосферасы |
| 00:04,85–00:05,4 | Жоғары «зың» + үлкен whoosh | Камера көзге кіреді, көгілдір жарқыл |
| 00:05,4–00:11 | Нейрон импульстері (жиі) | Импульстер жол бойымен жүреді |
| 00:11–00:17 | Импульстер баяулайды | EEG толқыны баяулайды |
| 11 · 17 · 23 · 30 · 36 · 43 с | Жұмсақ whoosh | Кадр ауысулары |
| 00:17–00:23 | Түс тәрізді қоңыраулар, жылтыр | Сағаттар мен бөлшектер қалқиды |
| 00:23–00:30 | Алтын жылтыр + жұмсақ пульс | Бөлшектер гиппокампқа ағады |
| 00:31–00:35 | Ұсақ «шашырау» дыбыстары | Естелік сынықтары ыдырайды |
| 00:34,8–00:35,3 | **Толық тыныштық** | Соңғы сынық жоғалады |
| 00:36,1 | Терең соққы | Climax басталуы |
| 00:40–00:43 | Riser | Желі жарқырайды |
| 00:44,8–00:46,5 | Көтерілген қоңыраулар | Бөлшектер жоғары көтеріледі |
| 00:46,6 | **Логотип соққысы** + қоңырау аккорды | SANALAB пайда болады |
| 00:47,6 | Жылтыр swish | Логотип бойымен жарық өтеді |

---

## 10. CapCut монтаж нұсқаулығы

1. **Жоба:** New project → 9:16, 1080×1920, 30 fps.
2. **Негіз:** `SANALAB_EP01_animatic.mp4` салыңыз (1-трек). Бұл — уақыт картасы.
3. **Клиптер:** генерацияланған 8 клипті 2-трекке, кестедегі уақытпен қойыңыз (0/5/11/17/23/30/36/43 с). Әр клипті аниматиктің үстіне дәл қойыңыз, кейін аниматикті жасырыңыз (немесе өшіріңіз).
4. **Ауысулар:** 1→2 — Zoom in (0,5 с) + Flash; қалғаны — Dissolve 0,6 с. Бірдей ауысуды қатарынан қолданбаңыз.
5. **Дыбыс:** `music_sfx.wav` салыңыз → аниматиктің дыбысын өшіріңіз. Дауысты жеке трекке. Музыка → Auto-ducking (немесе −20 dB). 34,8–35,3 с тыныштықты сақтаңыз.
6. **Субтитр:** Text → Import captions → `subtitles_kk.srt`. Қаріп **PT Sans Bold**, ақ, өлшемі ≈ 7–8 % (экран биіктігінің), жартылай мөлдір қою көк фон (#101D32, 55 %). Орны: төменнен 22–30 % аралығы (TikTok/Reels батырмаларына тимейді). Екі жолдан аспасын.
7. **Жазулар:** Montserrat ExtraBold, алтын #D9B56D, letter-spacing 2–3:
   - 0,2–2,9 с: «Сен мұны ешқашан / байқаған жоқсың…» (жоғарғы 10–20 % аймақ; 2-жол алтын).
   - 11,6–16,6 с: «ОЯУЛЫҚ → ҰЙҚЫ»; 17,5–22,6 с: «ГИПНАГОГИЯ»; 23,6–29,6 с: «ГИППОКАМП» + стрелка.
   - 46,6 с: «SANALAB» (алтын градиент, Glow), астында «1-БӨЛІМ» (Montserrat SemiBold).
   - 48,3–50 с: «Келесі бөлімде: Неге біз түсімізді ұмытамыз?»
8. **Бет үстіне мәтін қоймаңыз** (1 және 8-кадрда беттің орнын тексеріңіз).
9. **Color:** барлық клипке бір Adjustment layer: Temperature −5, Tint +3, Highlights −10, Shadows көкке (+teal), Highlights алтынға. Grain 5–8, Vignette 15.
10. **Loop:** соңғы 0,3 с-та 1-кадрдың алғашқы суретіне crossfade — ролик айналымға түседі.
11. **Экспорт:** 1080p, 30 fps, бит-рейт «Higher», H.264.

---

## 11. Жариялау

- **Мұқаба:** қабағы жартылай жабылған бет + алтын жазу «НЕГЕ ЕСТЕ ҚАЛМАЙДЫ?».
- **Жазба (caption):**
  > Сен ұйықтап кеткен сәтіңді есіңе түсіре аласың ба? 👇 Пікірде жаз!
  > Дереккөз: ұйқы мен есте сақтау туралы ғылыми зерттеулер (мысалы, Wyatt et al., 1994, *Sleep*).
- **Хэштегтер:** #SANALAB #ми #ұйқы #ғылым #қазақша #психология #факт
- **A/B hook:** екінші нұсқа — «Сенің миың әр түнде бір сәтті өшіріп тастайды…».

---

## 12. Ғылыми негіздеме (қысқаша)

- Ұйқыға кету — бірден «өшу» емес, біртіндеп өту (N1 сатысы, бірнеше минут; EEG-де альфа ырғағы баяу тета толқындарына ауысады).
- Гипнагогиялық бейнелер — ұйқының басталуында жиі кездеседі; кейбір адамдар оларды анық есте сақтайды (әсіресе бірден оянса).
- Гиппокамп жаңа эпизодтық естеліктерді қалыптастыруға қатысады.
- Ұйқы басталғанға дейінгі соңғы бірнеше минуттағы ақпарат жиі есте қалмайды (sleep-onset retrograde amnesia; Wyatt et al., 1994).
- Метафоралар (Сана, алтын бөлшектер) — бейнелеу тәсілі, биологиялық механизм ретінде ұсынылмайды.

---

## 13. Соңғы тексеру тізімі

- [ ] Ұзақтығы дәл 50 с
- [ ] 1080×1920, 9:16, 30 fps, қара жолақтар жоқ
- [ ] Барлық мәтін қазақ кириллицасымен, Ә Ғ Қ Ң Ө Ұ Ү Һ І дұрыс көрінеді (Manrope қолданылмаған)
- [ ] Субтитр 2 жолдан аспайды, қауіпсіз аймақта, бетті жаппайды
- [ ] Әйел 1 және 8-кадрда бір адам; Сана барлық кадрда бірдей
- [ ] Анатомия табиғи (көз, қабақ, қол саусақтары), morphing/flicker жоқ
- [ ] Әр кадрда қозғалыс бар, статикалық сурет жоқ, zoom қайталанбайды
- [ ] Дауыс музыкадан анық естіледі (музыка ≈ −20 dB)
- [ ] Дыбыс эффектілері визуалмен синхрон (9-бөлім кестесі)
- [ ] 34,8–35,3 с тыныштық сақталды
- [ ] «Гипнагогиялық», «гиппокамп» дұрыс айтылды
- [ ] Ғылыми мәтін 12-бөлімге сәйкес; кейбір адамдар гипнагогияны есте сақтайтыны айтылды
- [ ] Музыка түпнұсқа / лицензиялы
- [ ] Логотип пен «Келесі бөлімде» жазуы көрінеді, loop жұмыс істейді
