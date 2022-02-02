import {
    SortedQueue as Heap,
    SortedQueueItem as HeapItem,
} from 'sorted-queue';
import assert = require('assert');

interface Item {
    time: number;
    cb: () => void;
}


class Forward {
    private heap = new Heap<Item>((a, b) => a.time - b.time);
    private lock = new Lock();

    constructor(private currentTime: number) { }

    public async next() {
        await this.lock.isUnlocked;
        if (!this.heap.peek()) throw new Error('Empty');
        const item = this.heap.pop()!.value;
        this.currentTime = item.time;
        item.cb();
    }

    public now = () => this.currentTime;

    public getNextTime(): number {
        const peek = this.heap.peek();
        return peek ? peek.value.time : Number.POSITIVE_INFINITY;
    }

    public setTimeout = (cb: () => void, ms: number): HeapItem<Item> => {
        assert(ms >= 0);
        return this.heap.push({
            time: this.currentTime + ms,
            cb,
        });
    }

    public clearTimeout = (timeout: HeapItem<Item>): void => {
        timeout.pop();
    }

    public sleep = (ms: number): Promise<void> =>
        new Promise<void>(resolve => void this.setTimeout(resolve, ms));

    public escape = async <T>(v: T): Promise<T> => {
        this.lock.lock();
        const r = await v;
        this.lock.unlock();
        return r;
    }
}


export {
    Forward as default,
    Forward,
    HeapItem as Timeout,
}
