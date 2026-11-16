# Промпты для генератора картинок и видео (по желанию)

Нужны, только если пользователь сам хочет рисовку нейросетью; по умолчанию всё рисуется кодом.

Промпты — на английском (модели картинок и видео понимают его лучше). Текст в кадре (вывески) — коротко, 1–3 слова;
кириллицу модели часто ломают — проверять глазами и перегенерировать, либо делать вывеску числом/значком.
Героев придумывать своих, чужих персонажей не копировать.

## 1. STYLE — добавлять в КАЖДЫЙ промпт картинки (в начало)

```
Vertical 9:16 frame, 2.5D cartoon short-film style: flat hand-drawn 2D stick-figure characters with thick dark
ink outlines placed inside a richly lit stylized 3D diorama world. Characters: big perfectly round white head
(warm off-white with soft lavender shading and a thin cream rim light), no nose, no ears, no neck, simple face
made of a few marker strokes (dot or dash eyes, thick short eyebrows, tiny mouth line), bean-shaped capsule torso
fully colored as their clothing in one saturated color, arms and legs are single thin black lines with small
round black hands, long thin legs. Environment: stylized 3D with hand-painted textures and ink outlines on edges,
rounded chunky shapes, glossy props, cozy nostalgic Americana details. Lighting: warm sunlight plus cool blue
skylight, soft blue-violet shadows (never black), gentle bloom on highlights, volumetric light, shallow depth of
field on close-ups. Saturated but soft colors, warm highlights, cool shadows, slightly lifted darks. Cinematic
camera angle. No subtitles, no captions, no watermark, no UI.
```

## 2. Лист персонажа — сначала для каждого постоянного героя

Генерировать 1 раз, потом прикладывать как референс ко всем кадрам с этим героем (иначе герой «плывёт»).

```
<STYLE>. Character model sheet on plain light background: the same character shown front view, three-quarter view,
side view, and four facial expressions (smug half-lidded, shocked round eyes, scared with clenched teeth and a blue
sweat drop, laughing). Character: <имя>, <головной убор/причёска — главный опознавательный знак>, <цвет туловища =
одежда>, <1–2 детали: бабочка, бейдж, пояс, усы>. Consistent proportions: head 1/3 of height, head wider than torso.
```

Примеры героев:
- `Lev — a beige flat cap and round glasses, mustard-yellow sweater torso, a red scarf`;
- `Marta — tall black bun hair with a pencil in it, teal cardigan torso with three big white buttons`;
- `Boss — tiny black top hat, burgundy suit torso with a gold watch chain, thick black mustache`.

## 3. Кадр (ключевой кадр шота)

```
<STYLE>. <Крупность и ракурс>: <кто> <что делает / какое выражение>, <главный предмет фразы крупно и читаемо>,
<окружение и 1 визуальная шутка фоном>, <время суток и свет>, <надпись в мире, если нужна: sign reading "...">.
Keep the lower 20% of the frame calm (ground/table texture), main character's head at 25–45% of frame height.
```

Крупности: `wide establishing shot from above` · `medium shot` · `medium close-up` · `extreme close-up macro of …`
· `low-angle hero shot with wide lens` · `over-the-shoulder shot` · `POV through binoculars, circular vignette`.

Свет по настроению:
- день: `bright midday, deep blue sky with huge fluffy cream cumulus clouds, long soft blue shadows`;
- интерьер: `warm amber interior, cool daylight from the window, diagonal volumetric light beams through blinds`;
- ночь: `deep indigo night, warm yellow glowing windows and street lamps, bloom, stars`;
- мечта: `magenta-purple dusk, giant pale pink moon, string lights with glow, purple-blue water`;
- тревога/кульминация: `orange glow rising behind the wall, strong rim light, sparks`.

## 4. Движение (картинка → видео, 5 с)

```
Camera: <slow push-in | slow dolly left/right | crane up revealing | slow orbit | handheld-free smooth tracking>.
Action: <одно простое действие: character blinks and smirks / raises a hand mirror / crowd bursts out laughing /
bullet flies in slow motion with a light trail / money rains from the ceiling>. Cartoon timing, smooth, no morphing
of the characters, keep the same outlines and proportions, no text changes, no new characters, no subtitles.
```

Правила: одно действие на шот; персонаж не меняет внешность; надписи в мире не должны «плыть» (если плывут —
брать первые 2–3 с или оживлять картинку движением камеры в `assemble.py`).

## 5. Негатив (если модель принимает)

```
realistic humans, anime, 3D characters with volume, noses, ears, fingers, detailed hands, thin outlines,
black shadows, grey desaturated colors, text captions, subtitles, watermark, logo, extra limbs, distorted face,
morphing, flicker
```
