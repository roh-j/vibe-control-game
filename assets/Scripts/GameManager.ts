import { _decorator, Canvas, Component, Node, tween, Vec3 } from "cc";
import { Player } from "./Player";
import { Zombie } from "./Zombie";
import { ZombieSpawner } from "./ZombieSpawner";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Player })
  public player: Player;

  @property({ type: ZombieSpawner })
  public zombieSpawner: ZombieSpawner;

  @property(Node)
  public gameOverPopup: Node;

  // 싱글톤 패턴으로, 어디서든 GameManager.Instance로 접근 가능
  public static Instance: GameManager;
  public canvas: Canvas;

  // 플레이어 입력 방향 (x, y, z)
  public inputDirection: Vec3 = new Vec3();

  public isGameOver: boolean = false;

  onLoad() {
    // 싱글톤 초기화
    GameManager.Instance = this;

    this.canvas = this.node.scene.getComponentInChildren(Canvas);

    // 게임 시작 시 지정 위치에 좀비 생성
    this.zombieSpawner.spawnMultipleZombies([
      new Vec3(700, 500, 0),
      new Vec3(800, 700, 0),
      new Vec3(-900, -300, 0),
    ]);
  }

  public gameOver() {
    this.zombieSpawner.zombies.forEach((zombie) => {
      zombie.getComponent(Zombie).switchToIdle();
    });

    // 팝업 활성화
    this.gameOverPopup.active = true;
    this.gameOverPopup.setScale(0, 0, 0);

    this.isGameOver = true;

    tween(this.gameOverPopup)
      .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .start();
  }
}
