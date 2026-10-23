// Chrome script injection may wait for a loading frame indefinitely.
// This bounds our wait; the browser operation itself cannot be cancelled.
export async function withMediaDeadline<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([operation, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Media scan timed out')), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
}
