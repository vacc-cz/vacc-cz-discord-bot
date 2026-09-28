import { configs } from '@react-ui-org/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...configs.base.recommended,
  {
    name: 'vacc-cz-discord-bot/rules',
    rules: {
      // The bot reports what it does on stdout and stderr, which systemd's journal keeps
      'no-console': 'off',
    },
  },
]);
