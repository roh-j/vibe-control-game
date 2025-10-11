import { _decorator, CCInteger, Color, Component, Graphics } from "cc";
import { GameManager } from "./GameManager";
import { PlayerState } from "./Player";
const { ccclass, property } = _decorator;

@ccclass("AttackRange")
export class AttackRange extends Component {
  @property({ type: Graphics })
  public graphics: Graphics;

  @property({ type: CCInteger })
  public radius: number = 200;

  @property({ type: CCInteger })
  public lineWidth: number = 2;

  @property({ type: Color })
  public color: Color = new Color(255, 255, 255, 255);

  private isVisible = false;

  start() {
    this.drawCircle();
    this.graphics.clear();
  }

  update(deltaTime: number) {
    const player = GameManager.Instance.player;

    const isAttacking = player.getState() === PlayerState.Attack;

    if (isAttacking && !this.isVisible) {
      this.isVisible = true;
      this.drawCircle();
    } else if (!isAttacking && this.isVisible) {
      this.isVisible = false;
      this.graphics.clear();
    }
  }

  drawCircle() {
    this.graphics.clear();
    this.graphics.lineWidth = this.lineWidth;
    this.graphics.strokeColor = this.color;
    this.graphics.circle(0, 0, this.radius);
    this.graphics.stroke();
  }
}
