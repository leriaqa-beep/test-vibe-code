import { Font } from '@react-pdf/renderer';

// Comfortaa — rounded, детский, кириллица — для заголовков
Font.register({
  family: 'Comfortaa',
  fonts: [
    { src: '/assets/fonts/Comfortaa-Regular.ttf', fontWeight: 'normal' },
    { src: '/assets/fonts/Comfortaa-Bold.ttf',    fontWeight: 'bold'   },
  ],
});

// Literata — книжная антиква, кириллица — для основного текста
// Bold не используется в PDF (удалён для уменьшения веса файла)
Font.register({
  family: 'Literata',
  fonts: [
    { src: '/assets/fonts/Literata-Regular.ttf', fontWeight: 'normal'                      },
    { src: '/assets/fonts/Literata-Italic.ttf',  fontWeight: 'normal', fontStyle: 'italic' },
  ],
});

// PT Sans — запасной вариант с полной кириллицей
// Bold не используется в PDF (удалён для уменьшения веса файла)
Font.register({
  family: 'PTSans',
  fonts: [
    { src: '/assets/fonts/PTSans-Regular.ttf', fontWeight: 'normal'                      },
    { src: '/assets/fonts/PTSans-Italic.ttf',  fontWeight: 'normal', fontStyle: 'italic' },
  ],
});
