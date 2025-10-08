import { _decorator, Camera, Canvas, Component, Node, tween, Vec3 } from "cc";
import { Player } from "./Player";
import { SoundManager } from "./SoundManager";
import { Zombie } from "./Zombie";
import { ZombieSpawner } from "./ZombieSpawner";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Canvas })
  public canvas: Canvas;

  @property({ type: Camera })
  public camera: Camera;

  @property({ type: Node })
  public groundMap: Node;

  @property({ type: Player })
  public player: Player;

  @property({ type: ZombieSpawner })
  public zombieSpawner: ZombieSpawner;

  @property({ type: Node })
  public gameOverPopup: Node;

  // 싱글톤 패턴
  public static Instance: GameManager;

  // 플레이어 방향
  private _inputDirection: Vec3 = new Vec3();
  public isGameOver: boolean = false;

  onLoad() {
    if (GameManager.Instance) {
      this.destroy();
      return;
    }

    // 싱글톤 초기화
    GameManager.Instance = this;

    // 게임 시작 시 지정 위치에 좀비 생성
    this.zombieSpawner.spawnMultipleZombies([
      new Vec3(700, 500, 0),
      new Vec3(800, 700, 0),
      new Vec3(-900, -300, 0),
      new Vec3(-1000, -700, 0),
      new Vec3(200, 900, 0),
    ]);
  }

  public getInputDirection(): Vec3 {
    return this._inputDirection.clone();
  }

  public setInputDirection(direction: Vec3) {
    this._inputDirection.set(direction);
  }

  public gameOver() {
    this.zombieSpawner.zombies.forEach((zombie) => {
      zombie.getComponent(Zombie).switchToIdle();
    });

    SoundManager.Instance.stopBGM();

    // 팝업 활성화
    this.gameOverPopup.active = true;
    this.gameOverPopup.setScale(0, 0, 0);

    this.isGameOver = true;

    tween(this.gameOverPopup)
      .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .start();
  }
}
