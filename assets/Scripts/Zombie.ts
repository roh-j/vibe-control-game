import { _decorator, Animation, Component } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("Zombie")
export class Zombie extends Component {
  @property({ type: Number })
  public speed: number = 150;

  private animation: Animation = null!;
  private currentAnim: string = "";

  start() {
    this.animation = this.getComponent(Animation);

    // 초기 애니메이션 설정 (대기 상태)
    this.playAnimation("zombie_1_idle");
  }

  update(deltaTime: number) {
    const currentPos = this.node.getWorldPosition();
    const playerPos = GameManager.Instance.player.node.getWorldPosition();

    // 플레이어 방향 벡터 계산
    const direction = playerPos.clone().subtract(currentPos);

    // 플레이어와 좀비 거리
    const distance = direction.length();

    // 이동 방향 단위 벡터
    const normalizedDir = direction.clone().normalize();

    // 애니메이션 상태 결정: 가까우면 idle, 멀면 walk
    const nextAnim = distance > 1 ? "zombie_1_walk" : "zombie_1_idle";
    if (this.currentAnim !== nextAnim) {
      this.playAnimation(nextAnim);
    }

    // 플레이어와 거리가 1 이상이면 이동
    if (distance > 1) {
      const move = normalizedDir.multiplyScalar(this.speed * deltaTime);
      // deltaTime 곱해서 프레임 독립적 이동
      this.node.setWorldPosition(currentPos.add(move));

      // 좌우 방향에 따라 스프라이트 반전
      const scale = this.node.getScale();
      this.node.setScale(
        normalizedDir.x > 0 ? Math.abs(scale.x) : -Math.abs(scale.x),
        scale.y,
        scale.z
      );
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
