import { GameManager, MapType } from "./GameManager";
import { SoundManager } from "./SoundManager";
import { Zombie } from "./Zombie";
import {
  _decorator,
  Animation,
  CCInteger,
  Component,
  Node,
  ProgressBar,
  UITransform,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

export enum PlayerState {
  Idle = "idle",
  Run = "run",
  Attack = "attack",
  Hurt = "hurt",
  Dead = "dead",
}

@ccclass("Player")
export class Player extends Component {
  @property({ type: CCInteger })
  public speed: number = 300;

  @property({ type: CCInteger })
  public attackPower: number = 50;

  @property({ type: ProgressBar })
  public hpBar: ProgressBar;

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

    this.updateHPBarPosition();

    // 입력 방향 가져오기
    const direction = GameManager.Instance.getInputDirection();

    if (direction.lengthSqr() > 0) {
      // 이동 중 상태
      this.changeState(PlayerState.Run);
      this.move(direction, deltaTime);
    } else {
      this.changeState(PlayerState.Idle);
    }
  }

  public getState() {
    return this.state;
  }

  public takeDamage(amount: number = 20) {
    if (this.state === PlayerState.Dead) {
      return;
    }

    this.health -= amount;
    this.updateHPBar();

    if (this.health <= 0) {
      this.changeState(PlayerState.Dead);
    } else {
      this.changeState(PlayerState.Hurt);
    }
  }

  public attack() {
    this.changeState(PlayerState.Attack);
  }

  changeState(nextState: PlayerState) {
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

  updateHPBarPosition(offsetY: number = 140) {
    const playerWorldPos = this.node.getWorldPosition();

    this.hpBar.node.setWorldPosition(
      playerWorldPos.x,
      playerWorldPos.y + offsetY,
      playerWorldPos.z
    );
  }

  updateHPBar() {
    if (this.hpBar) {
      this.hpBar.progress = this.health / this.maxHealth;
    }
  }

  handleHurt() {
    const state = this.animation.getState("player_1_hurt");

    setTimeout(() => {
      if (this.state !== PlayerState.Dead) {
        this.changeState(PlayerState.Idle);
      }
    }, state.duration * 1000);
  }

  handleAttack() {
    const closestZombie = this.findClosestZombie();

    if (!closestZombie) {
      this.changeState(PlayerState.Idle);
      return;
    }

    // 총알 생성
    GameManager.Instance.bulletSpawner.spawnBullet(closestZombie);

    // SFX 재생
    SoundManager.Instance.playSFX();

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

  handleDeath() {
    const state = this.animation.getState("player_1_dead");

    setTimeout(() => {
      GameManager.Instance.gameOver();
    }, state.duration * 1000);
  }

  move(direction: Vec3, deltaTime: number) {
    // deltaTime 곱해서 프레임 독립적 이동
    const move = direction.multiplyScalar(this.speed * deltaTime);

    const ground = GameManager.Instance.ground;
    const mapWorldPos = ground.getWorldPosition();
    const uiTransform = ground.getComponent(UITransform);

    const scale = ground.scale;
    const halfWidth = (uiTransform.width * scale.x) / 2;
    const halfHeight = (uiTransform.height * scale.y) / 2;

    // 맵 범위 계산
    const minX = mapWorldPos.x - halfWidth;
    const maxX = mapWorldPos.x + halfWidth;
    const minY = mapWorldPos.y - halfHeight;
    const maxY = mapWorldPos.y + halfHeight;

    const position = this.node.getWorldPosition().add(move);

    // 플레이어가 맵 밖으로 나가지 않도록 제한
    position.x = Math.min(Math.max(position.x, minX), maxX);
    position.y = Math.min(Math.max(position.y, minY), maxY);

    this.node.setWorldPosition(position);

    // 좌우 이동 시 스프라이트 반전
    this.updateScale(direction.x);
  }

  updateScale(x: number) {
    const scale = this.node.scale;

    this.node.setScale(
      x > 0 ? Math.abs(scale.x) : -Math.abs(scale.x),
      scale.y,
      scale.z
    );
  }

  findClosestZombie(): Node | null {
    const zombies = GameManager.Instance.zombieSpawner.zombies;

    if (!zombies || zombies.length === 0) {
      return null;
    }

    // 임시
    if (GameManager.Instance.zombieSpawner.zombies.length < 3) {
      GameManager.Instance.switchMap(MapType.Desert);
    }

    let closestZombie: Node | null = null;
    let minDist = Infinity;

    // 가장 가까운 조건 만족 좀비 찾기
    for (const zombie of zombies) {
      const uiTransform = this.node.getComponent(UITransform);

      // 좀비 위치를 플레이어 로컬 좌표로 변환
      const zombiePos = zombie.getWorldPosition();
      const toZombie = uiTransform.convertToNodeSpaceAR(zombiePos);

      // 좀비 방향
      const zombieForward = new Vec3(zombie.scale.x > 0 ? 1 : -1, 0, 0);
      const zombieForwardDir = zombieForward.normalize();

      // 플레이어 방향
      const playerForward = new Vec3(this.node.scale.x > 0 ? 1 : -1, 0, 0);
      const playerForwardDir = playerForward.normalize();

      // 현재 노드의 중심과 좀비 위치와의 거리
      const dist = Vec3.distance(toZombie, Vec3.ZERO);

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

  playAnimation(name: string) {
    const state = this.animation.getState(name);

    if (!state || (this.currentAnim === name && state.isPlaying)) {
      return;
    }

    this.animation.play(name);
    this.currentAnim = name;
  }
}
