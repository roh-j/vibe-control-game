import { _decorator, Animation, Component, Node, UITransform, Vec3 } from "cc";
import { GameManager } from "./GameManager";
import { Zombie } from "./Zombie";
const { ccclass, property } = _decorator;

enum PlayerState {
  Idle = "idle",
  Run = "run",
  Attack = "attack",
  Hurt = "hurt",
  Dead = "dead",
}

@ccclass("Player")
export class Player extends Component {
  @property({ type: Number })
  public speed: number = 300;

  private animation: Animation;

  private maxHealth: number = 100;
  private health: number = 0;

  private state: PlayerState = PlayerState.Idle;
  private currentAnim: string = "";

  start() {
    this.animation = this.getComponent(Animation);
    this.health = this.maxHealth;

    // 초기 애니메이션 설정 (대기 상태)
    this.changeState(PlayerState.Idle);
  }

  update(deltaTime: number) {
    if (
      this.state === PlayerState.Dead ||
      this.state === PlayerState.Hurt ||
      this.state === PlayerState.Attack
    ) {
      return; // 공격 중이거나 피격, 사망 상태일 때는 이동/공격 금지
    }

    // 입력 방향 가져오기
    const direction = GameManager.Instance.inputDirection;

    if (direction.lengthSqr() > 0) {
      // 이동 중 상태
      this.changeState(PlayerState.Run);
      this.move(direction, deltaTime);
    } else {
      this.changeState(PlayerState.Idle);
    }
  }

  private changeState(nextState: PlayerState) {
    if (this.state === nextState || this.state === PlayerState.Dead) {
      return; // 사망 후엔 상태 전환 불가
    }

    this.state = nextState;

    switch (nextState) {
      case PlayerState.Idle:
        this.playAnimation("player_1_idle");
        break;
      case PlayerState.Run:
        this.playAnimation("player_1_run");
        break;
      case PlayerState.Attack:
        this.playAnimation("player_1_shot");
        this.handleAttack();
        break;
      case PlayerState.Hurt:
        this.playAnimation("player_1_hurt");
        this.handleHurt();
        break;
      case PlayerState.Dead:
        this.playAnimation("player_1_dead");
        this.handleDeath();
        break;
    }
  }

  public takeDamage(amount: number = 20) {
    if (this.state === PlayerState.Dead) {
      return;
    }

    this.health -= amount;

    if (this.health <= 0) {
      this.changeState(PlayerState.Dead);
    } else {
      this.changeState(PlayerState.Hurt);
    }
  }

  private handleHurt() {
    const state = this.animation.getState("player_1_hurt");

    setTimeout(() => {
      if (this.state !== PlayerState.Dead) {
        this.changeState(PlayerState.Idle);
      }
    }, state.duration * 1000);
  }

  public attack() {
    this.changeState(PlayerState.Attack);
  }

  private handleAttack() {
    const closestZombie = this.findClosestZombie();

    if (!closestZombie) {
      this.changeState(PlayerState.Idle);
      return;
    }

    // 좀비 데미지 처리
    const zombieComp = closestZombie.getComponent(Zombie);
    zombieComp.takeDamage();

    const state = this.animation.getState("player_1_shot");

    setTimeout(() => {
      if (this.state === PlayerState.Attack) {
        this.changeState(PlayerState.Idle);
      }
    }, state.duration * 1000);
  }

  private handleDeath() {
    const state = this.animation.getState("player_1_dead");

    setTimeout(() => {
      console.log("DEAD");
    }, state.duration * 1000);
  }

  private move(direction: Vec3, deltaTime: number) {
    // deltaTime 곱해서 프레임 독립적 이동
    const move = direction.clone().multiplyScalar(this.speed * deltaTime);

    const position = this.node.worldPosition.clone().add(move);
    this.node.setWorldPosition(position);

    // 좌우 이동 시 스프라이트 반전
    this.updateScale(direction.x);
  }

  private updateScale(x: number) {
    const scale = this.node.scale;

    this.node.setScale(
      x > 0 ? Math.abs(scale.x) : -Math.abs(scale.x),
      scale.y,
      scale.z
    );
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

      // 좀비 위치를 플레이어 로컬 좌표로 변환
      const zombiePos = zombie.worldPosition;
      const toZombie = uiTransform.convertToNodeSpaceAR(zombiePos);

      // 좀비 방향
      const zombieForward = new Vec3(zombie.scale.x > 0 ? 1 : -1, 0, 0);
      const zombieForwardDir = zombieForward.normalize();

      // 플레이어 방향
      const playerForward = new Vec3(this.node.scale.x > 0 ? 1 : -1, 0, 0);
      const playerForwardDir = playerForward.normalize();

      const dist = Math.sqrt(toZombie.x ** 2 + toZombie.y ** 2);

      if (dist > 200) {
        continue;
      }

      // 플레이어와 좀비가 서로 마주보고 있는 경우만 공격
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

  private playAnimation(name: string) {
    const state = this.animation.getState(name);

    if (!state || (this.currentAnim === name && state.isPlaying)) {
      return;
    }

    this.animation.play(name);
    this.currentAnim = name;
  }
}
