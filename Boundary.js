export default class Boundary {
    constructor(position, width, image, ctx) {
        this.position = position;
        this.width = width;
        this.height = width;
        this.image = image;
        this.ctx = ctx;
    }

    draw() {
        this.ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
        // c.fillStyle = 'rgba(255,0,0,.5)';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}