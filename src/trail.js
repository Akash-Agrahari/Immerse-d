export default class MouseFluidTrail {
    constructor(width = 512, height = 512) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");

        this.mouse = { x: width / 2, y: height / 2 };
        this.last = { x: width / 2, y: height / 2 };

        this.fadeAlpha = 0.02;
        this.baseSize = 1;     // min size when idle
        this.maxSize = 100;     // max size when moving fast
        this.currentSize = this.baseSize;

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, width, height);
    }

    update(mouse) {
        // Store previous mouse and update to new
        this.last.x = this.mouse.x;
        this.last.y = this.mouse.y;
        this.mouse.x = mouse.x;
        this.mouse.y = mouse.y;

        // Calculate speed (distance)
        const dx = this.mouse.x - this.last.x;
        const dy = this.mouse.y - this.last.y;
        const speed = Math.hypot(dx, dy);

        // Smooth interpolation of size
        const targetSize = this.baseSize + Math.min(speed * 5, this.maxSize - this.baseSize);
        this.currentSize += (targetSize - this.currentSize) * 0.2;

        // Trail fade
        this.ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Smear trail along motion path
        const dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.floor(dist / 2));

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = this.last.x + dx * t + Math.sin(t * 10 + performance.now() * 0.002) * 10;
            const y = this.last.y + dy * t + Math.cos(t * 10 + performance.now() * 0.002) * 10;

            const size = this.currentSize * (1 - t);

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(255,255,255,0.4)`);
            gradient.addColorStop(1, `rgba(255,255,255,0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
    }

    getTexture() {
        return this.canvas;
    }
}
