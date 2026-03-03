import { Font } from '@react-pdf/renderer';

// PT Sans — full Cyrillic support, hosted locally in public/assets/fonts/
Font.register({
  family: 'PTSans',
  fonts: [
    {
      src: '/assets/fonts/PTSans-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/assets/fonts/PTSans-Bold.ttf',
      fontWeight: 'bold',
    },
    {
      src: '/assets/fonts/PTSans-Italic.ttf',
      fontStyle: 'italic',
      fontWeight: 'normal',
    },
  ],
});
