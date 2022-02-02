import assert = require("assert");

export class Lock {
    private count = 0;
    public isUnlocked = Promise.resolve();
    private resolve?: () => void;

    public lock() {
        if (!this.count++)
            this.isUnlocked = new Promise(resolve => {
                this.resolve = resolve;
            });
    }

    public unlock() {
        assert(this.count > 0);
        if (!--this.count) this.resolve!();
    }
}
