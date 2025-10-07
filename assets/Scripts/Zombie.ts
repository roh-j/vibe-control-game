import { _decorator, Animation, Component, Vec3 } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

export enum ZombieState {
  Idle = "idle",
  Walk = "walk",
  Attack = "attack",
  Hurt = "hurt",
  Dead = "dead",
}

@ccclass("Zombie")
export class Zombie extends Component {
  @property({ type: Number })
  public speed: number = 150;

  @property({ type: Number })
  public attackRange: number = 80;

  private animation: Animation;

  private maxHealth: number = 100;
  private health: number = 0;

  private state: ZombieState = ZombieState.Idle;
  private currentAnim: string = "";

  start() {
    this.animation = this.getComponent(Animation);
    this.health = this.maxHealth;

    // 초기 애니메이션 설정 (대기 상태)
    this.changeState(ZombieState.Idle);
  }

  update(deltaTime: number) {
    if (
      GameManager.Instance.isGameOver ||
      this.state === ZombieState.Dead ||
      this.state === ZombieState.Hurt ||
      this.state === ZombieState.Attack
    ) {
      return; // 공격 중이거나 피격, 사망 상태일 때는 이동/공격 금지
    }

    const playerNode = GameManager.Instance.player.node;
    const playerPos = playerNode.getWorldPosition();
    const currentPos = this.node.getWorldPosition();

    // 플레이어 방향 벡터 계산
    const direction = playerPos.subtract(currentPos);

    // 플레이어와 좀비 거리
    const dist = direction.length();

    // 이동 방향 단위 벡터
    const normalizedDir = direction.clone().normalize();

    // 공격 범위 체크
    if (dist <= this.attackRange) {
      this.changeState(ZombieState.Attack);
      return;
    }

    // 이동 중 상태
    this.changeState(ZombieState.Walk);
    this.move(currentPos, dist, normalizedDir, deltaTime);
  }

  public getState() {
    return this.state;
  }

  private changeState(nextState: ZombieState) {
    if (this.state === nextState || this.state === ZombieState.Dead) {
      return; // 사망 후엔 상태 전환 불가
    }

    this.state = nextState;

    switch (nextState) {
      case ZombieState.Idle:
        this.playAnimation("zombie_1_idle");
        break;
      case ZombieState.Walk:
        this.playAnimation("zombie_1_walk");
        break;
      case ZombieState.Attack:
        this.playAnimation("zombie_1_attack");
        this.handleAttack();
        break;
      case ZombieState.Hurt:
        this.playAnimation("zombie_1_hurt");
        this.handleHurt();
        break;
      case ZombieState.Dead:
        this.playAnimation("zombie_1_dead");
        this.handleDeath();
        break;
    }
  }

  public takeDamage(amount: number = 20) {
    if (this.state === ZombieState.Dead) {
      return;
    }

    this.health -= amount;

    if (this.health <= 0) {
      this.changeState(ZombieState.Dead);
    } else {
      this.changeState(ZombieState.Hurt);
    }
  }

  private handleAttack() {
    const state = this.animation.getState("zombie_1_attack");

    // 플레이어 공격
    GameManager.Instance.player.takeDamage();

    setTimeout(() => {
      if (this.state === ZombieState.Attack) {
        this.changeState(ZombieState.Idle);
      }
    }, state.duration * 1000);
  }

  private handleHurt() {
    const state = this.animation.getState("zombie_1_hurt");

    setTimeout(() => {
      if (this.state !== ZombieState.Dead) {
        this.changeState(ZombieState.Idle);
      }
    }, state.duration * 1000);
  }

  private handleDeath() {
    const state = this.animation.getState("zombie_1_dead");

    setTimeout(() => {
      GameManager.Instance.zombieSpawner.removeZombie(this.node);
      this.node.destroy();
    }, state.duration * 1000);
  }

  private move(
    currentPos: Vec3,
    dist: number,
    normalizedDir: Vec3,
    deltaTime: number
  ) {
    if (dist < 1 || this.state !== ZombieState.Walk) {
      return;
    }

    const move = normalizedDir.multiplyScalar(this.speed * deltaTime);

    // deltaTime 곱해서 프레임 독립적 이동
    this.node.setWorldPosition(currentPos.add(move));

    // 좌우 이동 시 스프라이트 반전
    this.updateScale(normalizedDir);
  }

  private updateScale(normalizedDir: Vec3) {
    const scale = this.node.getScale();

    this.node.setScale(
      normalizedDir.x > 0 ? Math.abs(scale.x) : -Math.abs(scale.x),
      scale.y,
      scale.z
    );
  }

  private playAnimation(name: string) {
    const state = this.animation.getState(name);

    if (!state || (this.currentAnim === name && state.isPlaying)) {
      return;
    }

    this.animation.play(name);
    this.currentAnim = name;
  }

  public switchToIdle() {
    this.changeState(ZombieState.Idle);
  }
}
