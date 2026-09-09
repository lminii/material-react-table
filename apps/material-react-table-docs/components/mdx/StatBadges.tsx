import { Box } from '@mui/material';

export const StatBadges = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        m: {
          xs: 0,
          md: '1rem',
        },
        '& img': {
          imageRendering: 'pixelated',
        },
      }}
    >
      <a
        aria-label="NPM Version"
        href="https://npmjs.com/package/@lminii/material-react-table"
        target="_blank_"
      >
        <img
          alt="NPM Version"
          src="https://badgen.net/npm/v/@lminii/material-react-table?color=blue"
        />
      </a>
      <a
        aria-label="Number of Downloads"
        href="https://npmtrends.com/@lminii/material-react-table"
        target="_blank_"
      >
        <img
          alt="Downloads"
          src="https://badgen.net/npm/dt/@lminii/material-react-table?label=installs&icon=npm&color=blue"
        />
      </a>
      <a
        aria-label="Bundle Size"
        href="https://bundlephobia.com/result?p=@lminii/material-react-table"
        target="_blank_"
      >
        <img
          alt="Bundle Size"
          src="https://badgen.net/bundlephobia/minzip/@lminii/material-react-table@latest?color=blue"
        />
      </a>
      <a
        aria-label="GitHub Stars"
        href="https://star-history.com/#lminii/material-react-table&Date"
        target="_blank_"
      >
        <img
          alt="GitHub Stars"
          src="https://badgen.net/github/stars/lminii/material-react-table?color=blue"
        />
      </a>
      <a
        href="https://github.com/lminii/material-react-table/blob/v4/LICENSE"
        target="_blank"
        rel="noopener"
      >
        <img
          alt=""
          src="https://badgen.net/github/license/lminii/material-react-table?color=blue"
        />
      </a>
    </Box>
  );
};
