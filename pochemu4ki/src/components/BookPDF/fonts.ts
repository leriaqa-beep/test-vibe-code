import { Font } from '@react-pdf/renderer';

// PT Sans — full Cyrillic support via Google Fonts CDN
Font.register({
  family: 'PTSans',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79P0WOxOGMMDQ.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/ptsans/v17/jizaBExUiTo99u79B_mh0O6tLR8a8zI.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://fonts.gstatic.com/s/ptsans/v17/jizfRExUiTo99u79D4-ExdymKzMTk.ttf',
      fontStyle: 'italic',
      fontWeight: 'normal',
    },
  ],
});
