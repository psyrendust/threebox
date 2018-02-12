export default class RAF {
    constructor(renderer, scene, camera) {
        this.queue = [];
        this.afterQueue = [];
        this.isRunning = false;
        this.isStepping = false;
        this.raf = null;

        const update = (timestamp) => {
            if (this.isRunning || this.isStepping) {
            this.isStepping = false;
            this.raf = requestAnimationFrame(update);

            this.queue.forEach((queue) => {
                queue.fn.call(queue.scope, timestamp);
            });

            renderer.render(scene, camera);

            this.afterQueue.forEach((queue) => {
                queue.fn.call(queue.scope, timestamp);
            });
            }
        };

        const run = () => {
            this.raf = requestAnimationFrame(update);
        };

        this.start = () => {
            if (!this.isRunning) {
            if (this.raf) {
                cancelAnimationFrame(this.raf);
            }
            this.isRunning = true;
            }
            run();
        };

        this.step = () => {
            if (!this.isRunning) {
            this.isStepping = true;
            run();
            }
        };

        this.stop = () => {
            this.isRunning = false;
            if (this.raf) {
            cancelAnimationFrame(this.raf);
            }
            this.raf = null;
        };

        this.onUpdate = (fn, scope) => {
            this.queue.push({
            fn,
            scope,
            });
        };

        this.onAfterUpdate = (fn, scope) => {
            this.afterQueue.push({
            fn,
            scope,
            });
        };
    }
}
