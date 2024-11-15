type RetryOptions = {
  retries?: number;
  delay?: number; // in milliseconds
  exceptions?: any[]; // list of exceptions to retry on
};

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

export function withRetry<T>(
  fn: AsyncFunction<T>,
  { retries = 3, delay = 0, exceptions = [Error] }: RetryOptions = {}
): AsyncFunction<T> {
  return async function (...args: Parameters<AsyncFunction<T>>): Promise<T> {
    let attempts = 0;

    while (attempts <= retries) {
      try {
        return await fn(...args);
      } catch (error) {
        let isLLMParsingError = false;
        if (error instanceof Error && error.message.includes('GrammarStateMatcher')) {
          isLLMParsingError = true;
        }
        if (exceptions.some((ex) => error instanceof ex) || isLLMParsingError) {
          console.error(`Retrying after error: ${error}`);
          attempts++;
          if (attempts > retries) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    // Should never reach here, but to satisfy TypeScript return type
    throw new Error('Unexpected error');
  };
}
