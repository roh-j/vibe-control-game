import { Bullet } from "./Bullet";
import { GameManager } from "./GameManager";
import {
  _decorator,
  Animation,
  BoxCollider2D,
  Collider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
  Vec3,
} from "cc";
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

  @property({ type: Number })
  public attackPower: number = 20;

  private animation: Animation;

  private maxHealth: number = 100;
  private health: number = 0;
  private isHit: boolean = false;

  private state: ZombieState = ZombieState.Idle;
  private currentAnim: string = "";

  start() {
    this.animation = this.getComponent(Animation);
    this.health = this.maxHealth;

    // 초기 애니메이션 설정 (대기 상태)
    this.changeState(ZombieState.Idle);

    const collider = this.getComponent(BoxCollider2D);
    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
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

    // 플레이어와 좀비 거리 계산
    const dist = Vec3.distance(playerPos, currentPos);

    // 이동 방향 단위 벡터
    const direction = playerPos.clone().subtract(currentPos).normalize();

    // 공격 범위 체크
    if (dist <= this.attackRange) {
      this.changeState(ZombieState.Attack);
      return;
    }

    // 이동 중 상태
    this.changeState(ZombieState.Walk);
    this.move(currentPos, dist, direction, deltaTime);
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact
  ) {
    const bullet = otherCollider.node.getComponent(Bullet);

    if (bullet && this.isHit) {
      console.log("Bullet hit zombie!");
      this.handleTakeDamage();
    }
  }

  public getState() {
    return this.state;
  }

  public takeDamage() {
    this.isHit = true;
  }

  public switchToIdle() {
    this.changeState(ZombieState.Idle);
  }

  handleTakeDamage() {
    if (this.state === ZombieState.Dead) {
      return;
    }

    this.health -= GameManager.Instance.player.attackPower;

    if (this.health <= 0) {
      this.changeState(ZombieState.Dead);
    } else {
      this.changeState(ZombieState.Hurt);
    }
  }

  changeState(nextState: ZombieState) {
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

  handleAttack() {
    const state = this.animation.getState("zombie_1_attack");

    // 플레이어 공격
    GameManager.Instance.player.takeDamage(this.attackPower);

    setTimeout(() => {
      if (this.state === ZombieState.Attack) {
        this.changeState(ZombieState.Idle);
      }
    }, state.duration * 1000);
  }

  handleHurt() {
    const state = this.animation.getState("zombie_1_hurt");

    setTimeout(() => {
      if (this.state !== ZombieState.Dead) {
        this.changeState(ZombieState.Idle);
      }
    }, state.duration * 1000);
  }

  handleDeath() {
    const state = this.animation.getState("zombie_1_dead");

    setTimeout(() => {
      GameManager.Instance.zombieSpawner.removeZombie(this.node);
      this.node.destroy();
    }, state.duration * 1000);
  }

  move(currentPos: Vec3, dist: number, direction: Vec3, deltaTime: number) {
    if (dist < 1 || this.state !== ZombieState.Walk) {
      return;
    }

    const move = direction.multiplyScalar(this.speed * deltaTime);

    // deltaTime 곱해서 프레임 독립적 이동
    this.node.setWorldPosition(currentPos.add(move));

    // 좌우 이동 시 스프라이트 반전
    this.updateScale(direction);
  }

  updateScale(direction: Vec3) {
    const scale = this.node.getScale();

    this.node.setScale(
      direction.x > 0 ? Math.abs(scale.x) : -Math.abs(scale.x),
      scale.y,
      scale.z
    );
  }

  playAnimation(name: string) {
    const state = this.animation.getState(name);

    if (!state || (this.currentAnim === name && state.isPlaying)) {
      return;
    }

    this.animation.play(name);
    this.currentAnim = name;
  }
}
