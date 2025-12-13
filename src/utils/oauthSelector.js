import { select, isCancel, cancel } from '@clack/prompts';

export async function oauthSelector() {
      const provider = await select({
            message: 'Select an OAuth provider to authenticate with:',
            options: [
                  { label: 'Google', value: 'google-oauth' },
                  { label: 'GitHub', value: 'github-oauth' },
            ],
      });

      if (isCancel(provider)) {
            cancel('OAuth selection cancelled');
            process.exit(0);
      }

      return provider;
}
