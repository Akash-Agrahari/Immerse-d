export default class MouseTrailCanvas {
    constructor(width = 512, height = 512) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

        // Exact mouse tracking
        this.mouse = { x: width/2, y: height/2 };
        
        // Visual smoothing parameters
        this.fadeAlpha = 0.01;  // Trail persistence (0.05-0.1)
        this.trailSize = 80;     // Circle size
        this.blurSteps = 3;      // Rendering passes (1-5)
        this.opacity = .5;      // Max brightness (0.5-1.0)

        // Initialize
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, width, height);
    }

    update(mouse) {
        // Update exact mouse position
        this.mouse = mouse;

        // Fade existing content
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw multi-layered circle for smoothness
        this.drawSmoothCircle();
    }

    drawSmoothCircle() {
        const { x, y } = this.mouse;
        
        // Draw multiple concentric circles with reducing opacity
        for(let i = this.blurSteps; i >= 1; i--) {
            const radius = this.trailSize * (i/this.blurSteps);
            const alpha = this.opacity * (i/this.blurSteps);
            
            const gradient = this.ctx.createRadialGradient(
                x, y, radius * 0.3, 
                x, y, radius
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
    }

    getTexture() {
        return this.canvas;
    }
}