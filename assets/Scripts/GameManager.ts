import { BulletSpawner } from "./BulletSpawner";
import { Player } from "./Player";
import { SoundManager } from "./SoundManager";
import { StageManager } from "./StageManager";
import { Zombie } from "./Zombie";
import { ZombieSpawner } from "./ZombieSpawner";
import {
  _decorator,
  Camera,
  Canvas,
  Component,
  Node,
  tween,
  UITransform,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Canvas })
  public canvas: Canvas;

  @property({ type: Camera })
  public camera: Camera;

  @property({ type: StageManager })
  public stageManager: StageManager;

  @property({ type: Node })
  public ground: Node;

  @property({ type: Player })
  public player: Player;

  @property({ type: BulletSpawner })
  public bulletSpawner: BulletSpawner;

  @property({ type: ZombieSpawner })
  public zombieSpawner: ZombieSpawner;

  @property({ type: Node })
  public gameOverPopup: Node;

  @property({ type: Node })
  public gameEndPopup: Node;

  // 싱글톤 패턴
  public static Instance: GameManager;

  private inputDirection: Vec3 = new Vec3();
  public isGameOver: boolean = false;

  onLoad() {
    if (GameManager.Instance) {
      this.destroy();
      return;
    }

    // 싱글톤 초기화
    GameManager.Instance = this;
  }

  start() {
    this.startStage(1);
  }

  public getInputDirection(): Vec3 {
    return this.inputDirection.clone();
  }

  public setInputDirection(direction: Vec3) {
    this.inputDirection.set(direction);
  }

  public gameOver() {
    this.zombieSpawner.zombies.forEach((zombie) => {
      zombie.getComponent(Zombie).switchToIdle();
    });

    SoundManager.Instance.stopBGM();
    this.gameOverPopup.active = true;
    this.isGameOver = true;

    tween(this.gameOverPopup)
      .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .start();
  }

  public gameEnd() {
    // 팝업 활성화
    this.gameEndPopup.active = true;

    tween(this.gameEndPopup)
      .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .start();
  }

  public startStage(stage: number) {
    this.stageManager.startStage(stage);
  }

  public onZombieKilled() {
    this.stageManager.onZombieKilled();
  }
}
