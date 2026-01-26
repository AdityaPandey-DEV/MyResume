
/**
 * Simple in-memory concurrency queue.
 * Limits the number of concurrent executions of a given async task.
 * Note: This is per-server-process. In a serverless environment (e.g. Vercel), 
 * this only limits concurrency within a single lambda instance, which is still helpful.
 */
export class ConcurrencyQueue {
    private queue: (() => Promise<void>)[] = [];
    private activeCount = 0;
    private maxConcurrent: number;

    constructor(maxConcurrent: number = 1) {
        this.maxConcurrent = maxConcurrent;
    }

    /**
     * Enqueues a task. If the number of active tasks is below maxConcurrent,
     * it runs immediately. Otherwise, it waits in the queue.
     */
    async add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const wrappedTask = async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (err) {
                    reject(err);
                } finally {
                    this.activeCount--;
                    this.processNext();
                }
            };

            this.queue.push(wrappedTask);
            this.processNext();
        });
    }

    private processNext() {
        if (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                this.activeCount++;
                task();
            }
        }
    }

    get pendingCount() {
        return this.queue.length;
    }
}

// Global singleton instance for Chat Generations
export const chatQueue = new ConcurrencyQueue(1); // Strict serial execution to avoid 429s
