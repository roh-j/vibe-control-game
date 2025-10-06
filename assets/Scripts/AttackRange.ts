import { _decorator, Color, Component, Graphics } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AttackRange")
export class AttackRange extends Component {
  @property({ type: Graphics })
  public graphics: Graphics;

  @property
  public radius: number = 200;

  @property
  public lineWidth: number = 2;

  @property
  public color = new Color(255, 255, 255, 255);

  start() {
    this.drawCircle();
  }

  drawCircle() {
    if (!this.graphics) {
      return;
    }

    this.graphics.clear();
    (this.graphics as any).lineWidth = this.lineWidth;
    this.graphics.strokeColor = this.color;
    this.graphics.circle(0, 0, this.radius);
    this.graphics.stroke();
  }

  update(deltaTime: number) {}
}
