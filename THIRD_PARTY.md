# Основа персонажей

`public/models/barista-base.vrm` — VRM1_Constraint_Twist_Sample, v1.0.1, © 2022 pixiv Inc.

Источник: https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm

Лицензия: VRM Public License 1.0 — https://vrm.dev/licenses/1.0/

Параметры встроенных метаданных: avatarPermission=everyone, commercialUsage=corporation, allowRedistribution=true, modification=allowModificationRedistribution, creditNotation=unnecessary. Дополнительные ограничения использования сохранены внутри исходного VRM-файла. Полные условия лицензии применяются к модели и производным персонажам.

Приложение меняет материалы, добавляет одежду/аксессуары и анимирует модель во время выполнения; исходный файл сохранён без изменений.

Three.js — MIT. @pixiv/three-vrm — MIT. Vite — MIT. Лицензии библиотек входят в их npm-пакеты.

# Живые записи музыкальных инструментов

Файлы `public/audio/music/*.wav` содержат записи настоящих инструментов. Для них действуют указанные ниже лицензии; лицензии исходных библиотек сохранены рядом с аудио. Пофайловые ссылки, авторы, контрольные суммы, длительности и изменения перечислены в `public/audio/music/credits.json`.

| Инструмент | Автор и источник | Лицензия |
|---|---|---|
| Дарбука, большой рамочный барабан, диджириду | Versilian Studios — [VCSL](https://github.com/sgossner/VCSL) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Ударная установка | Versilian Studios / Karoryfer Samples; исполнитель Austin McMahon — [Virtuosity Drums](https://github.com/sfzinstruments/virtuosity_drums) | CC0 1.0 |
| Дудук | ethnictune — [Duduk Armenian Sample Sound](https://freesound.org/people/ethnictune/sounds/352572/) | CC0 1.0 |
| Чайна | ankealtd — [Meinl MB20 18″ Rock China](https://freesound.org/people/ankealtd/sounds/696255/) | CC0 1.0 |
| Бас-гитара | Karoryfer Samples — [Growlybass](https://github.com/sfzinstruments/karoryfer.growlybass), Squier Jazz Bass | CC0 1.0 |
| Укулеле | Iain McCurdy — [Ukulele](https://freesound.org/people/iainmccurdy/packs/38906/), записи 697060, 697064, 697067, 697069, 697072, 697076 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Ханг / хендпан | The Sample Shack — Celtic Handpan, [отдельные записи полей от ToneWright](https://tonewright.app/instruments/handpan/) | WTFPL, как указано на странице распространителя ToneWright |

Хендпан: десять отдельных записей Celtic Handpan из ToneWright, заменивших прежнюю запись гаммы. Частоты основных тонов измерены индивидуально; удалены низкочастотный шум и посторонние резонансы, сохранены атака и затухание гармоник. Изменения остальных записей: обрезка начальной и конечной тишины, удаление постоянной составляющей, нормализация пиков и короткие плавные края. У диджириду из участков удерживаемого тона сделаны петли со склейкой 100 мс. Файлы приведены к PCM WAV 44,1 кГц / 16 бит. Для Freesound использованы опубликованные авторские HQ MP3-превью, декодированные в WAV; это не повышает исходное качество записи. В интерфейсе доступны авторские ссылки, CC BY 4.0 и подробные сведения об изменениях. При воспроизведении ноты транспонируются по измеренной основной частоте, применяется эквализация, панорама, реверберация и компрессия. Авторы исходных записей не заявляются участниками или спонсорами проекта.

## Образы гостей

15 образов гостей и их портреты основаны на той же лицензированной модели `barista-base.vrm`, описанной выше. Изменены материалы, причёски, пропорции и позы; добавлены процедурные аксессуары, головы и хвосты животных. Портреты в `public/avatars/` — рендеры этих производных образов. Исходный VRM-файл не изменялся.

Дудук: выделены три устойчивых тона из записи ethnictune; удалён низкочастотный фон, измерена основная частота, подготовлены петли удержания с перекрытием 120 мс. Естественные дыхание и вибрато сохранены. Открытый хэт и ковбэл — дополнительные записи Virtuosity Drums; низкий третий том воспроизводит запись тома в пониженном строе. Для щелчка пальцев и сухого края добавлены записи малого рамочного барабана VCSL. Двойные удары, флэм и роллы собираются из отдельных записей по аудиочасам.
