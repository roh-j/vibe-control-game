import { _decorator, Animation, Component, Node, UITransform, Vec3 } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
  @property({ type: Number })
  public speed: number = 300;

  private animation: Animation;
  private currentAnim: string = "";
  private isAttacking: boolean = false;

  start() {
    this.animation = this.getComponent(Animation);

    // 초기 애니메이션 설정 (대기 상태)
    this.playAnimation("player_1_idle");
  }

  update(deltaTime: number) {
    if (this.isAttacking) {
      return;
    }

    // GameManager에서 입력 방향 가져오기
    const direction = GameManager.Instance.inputDirection;

    this.updateAnimation(direction);
    this.move(direction, deltaTime);
  }

  private updateAnimation(direction: Vec3) {
    // lengthSqr() → 벡터 길이 제곱 (0 이면 정지, > 0 이면 이동)
    const nextAnim =
      direction.lengthSqr() > 0 ? "player_1_run" : "player_1_idle";

    if (this.currentAnim !== nextAnim) {
      this.playAnimation(nextAnim);
    }
  }

  private move(direction: Vec3, deltaTime: number) {
    if (direction.lengthSqr() === 0) {
      return;
    }

    // deltaTime 곱해서 프레임 독립적 이동
    const move = direction.clone().multiplyScalar(this.speed * deltaTime);

    const position = this.node.worldPosition.clone().add(move);
    this.node.setWorldPosition(position);

    // 좌우 이동 시 스프라이트 반전
    this.updateScale(direction.x);
  }

  private updateScale(x: number) {
    if (Math.abs(x) < 0.01) {
      return;
    }

    const scale = this.node.scale;
    this.node.setScale(
      x > 0 ? Math.abs(scale.x) : -Math.abs(scale.x),
      scale.y,
      scale.z
    );
  }

  public attack() {
    if (this.isAttacking) {
      return;
    }

    const target = this.findClosestZombie();

    if (!target) {
      this.resetToIdle();
      return;
    }

    this.isAttacking = true;
    this.playAnimation("player_1_shot");

    const state = this.animation.getState("player_1_shot");
    setTimeout(() => this.resetToIdle(), state.duration * 1000);
  }

  private findClosestZombie(): Node | null {
    const zombies = GameManager.Instance.zombieSpawner.zombies;

    if (!zombies || zombies.length === 0) {
      return null;
    }

    let closestZombie: Node | null = null;
    let minDist = Infinity;

    // 가장 가까운 조건 만족 좀비 찾기
    for (const zombie of zombies) {
      const uiTransform = this.node.getComponent(UITransform);

      // 좀비
      const zombiePos = zombie.worldPosition;
      const toZombie = uiTransform.convertToNodeSpaceAR(zombiePos);
      const zombieForward = new Vec3(zombie.scale.x > 0 ? 1 : -1, 0, 0);
      const zombieForwardDir = zombieForward.normalize();

      // 플레이어
      const playerForward = new Vec3(this.node.scale.x > 0 ? 1 : -1, 0, 0);
      const playerForwardDir = playerForward.normalize();

      const dist = Math.sqrt(toZombie.x ** 2 + toZombie.y ** 2);

      if (dist > 200) {
        continue;
      }

      // 플레이어와 좀비가 마주보는지 확인
      if (zombieForwardDir.x + playerForwardDir.x !== 0) {
        continue;
      }

      if (dist < minDist) {
        minDist = dist;
        closestZombie = zombie;
      }
    }

    return closestZombie;
  }

  private resetToIdle() {
    this.isAttacking = false;
    this.playAnimation("player_1_idle");
  }

  private playAnimation(name: string) {
    const state = this.animation.getState(name);

    if (!state || (this.currentAnim === name && state.isPlaying)) {
      return;
    }

    this.animation.play(name);
    this.currentAnim = name;
  }
}
