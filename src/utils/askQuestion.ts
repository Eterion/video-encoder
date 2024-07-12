import chalk from 'chalk';
import prompts from 'prompts';

/**
 * Prompts user for input.
 * @param questions - Question or array of questions
 * @returns Object of answers
 */

export async function askQuestion<T extends string = string>(
  questions: prompts.PromptObject<T> | Array<prompts.PromptObject<T>>
): Promise<prompts.Answers<T>> {
  return await prompts(questions, {
    onCancel: () => {
      console.log(chalk.yellow('Cancelled by user.'));
      process.exit(0);
    },
  });
}
