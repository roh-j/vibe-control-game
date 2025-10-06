import { _decorator, Animation, Component } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
  @property({ type: Number })
  public speed: number = 300;

  private animation: Animation;
  private currentAnim: string = "";

  start() {
    this.animation = this.getComponent(Animation);

    // 초기 애니메이션 설정 (대기 상태)
    this.playAnimation("player_idle");
  }

  update(deltaTime: number) {
    // GameManager에서 입력 방향 가져오기
    const direction = GameManager.Instance.inputDirection;

    // lengthSqr() → 벡터 길이 제곱 (0 이면 정지, > 0 이면 이동)
    const nextAnim = direction.lengthSqr() > 0 ? "player_run" : "player_idle";

    if (this.currentAnim !== nextAnim) {
      this.playAnimation(nextAnim);
    }

    if (direction.lengthSqr() > 0) {
      const position = this.node.getWorldPosition();

      // deltaTime 곱해서 프레임 독립적 이동
      const move = direction.clone().multiplyScalar(this.speed * deltaTime);

      position.add(move);
      this.node.setWorldPosition(position);

      // 좌우 이동 시 스프라이트 반전
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
