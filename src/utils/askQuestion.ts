import chalk from 'chalk';
import prompts from 'prompts';

/**
 * Prompts user for input.
 * @param questions - Question or array of questions
 * @returns Object of answers
 */

export async function askQuestion(
  questions: Parameters<typeof prompts>[0]
): ReturnType<typeof prompts> {
  return await prompts(questions, {
    onCancel: () => {
      console.log(chalk.yellow('Cancelled by user.'));
      process.exit(0);
    },
  });
}
