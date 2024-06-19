import chalk from 'chalk';
import type prompts from 'prompts';

export function handlePromptsOptions(): prompts.Options {
  return {
    onCancel: () => {
      console.log(chalk.yellow('Cancelled by user.'));
      process.exit(0);
    },
  };
}
