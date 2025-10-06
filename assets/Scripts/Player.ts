import { _decorator, Animation, Component } from "cc";
import { GameManager } from "./GameManager";
const { ccclass } = _decorator;

@ccclass("Player")
export class Player extends Component {
  public animation: Animation;

  public speed: number = 300;
  private currentAnim: string = "";

  start() {
    this.animation = this.getComponent(Animation);
    this.playAnimation("idle");
  }

  update(deltaTime: number) {
    const direction = GameManager.Instance.inputDirection;
    const nextAnim = direction.lengthSqr() > 0 ? "run" : "idle";

    if (this.currentAnim !== nextAnim) {
      this.playAnimation(nextAnim);
    }

    // 플레이어가 움직일 때
    if (direction.lengthSqr() > 0) {
      const position = this.node.getWorldPosition();
      const move = direction.clone().multiplyScalar(this.speed * deltaTime);

      position.add(move);

      this.node.setWorldPosition(position);

      if (Math.abs(direction.x) > 0.01) {
        const scale = this.node.getScale();

        this.node.setScale(
          direction.x > 0 ? Math.abs(scale.x) : -Math.abs(scale.x),
          scale.y,
          scale.z
        );
      }
    }
  }

  private playAnimation(name: string) {
    const state = this.animation.getState(name);

    if (!state) {
      return;
    }

    if (this.currentAnim === name && state.isPlaying) {
      return;
    }

    this.animation.play(name);
    this.currentAnim = name;
  }
}
