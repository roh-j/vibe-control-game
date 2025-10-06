import { _decorator, Component, Vec3 } from "cc";
import { Player } from "./Player";
import { ZombieSpawner } from "./ZombieSpawner";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Player })
  public player: Player;

  @property({ type: ZombieSpawner })
  public zombieSpawner: ZombieSpawner;

  // 싱글톤 패턴으로, 어디서든 GameManager.Instance로 접근 가능
  public static Instance: GameManager;

  // 플레이어 입력 방향 (x, y, z)
  public inputDirection: Vec3 = new Vec3();

  onLoad() {
    // 싱글톤 초기화
    GameManager.Instance = this;

    // 게임 시작 시 지정 위치에 좀비 생성
    this.zombieSpawner.spawnMultipleZombies([
      new Vec3(100, 100, 0),
      new Vec3(300, 300, 0),
    ]);
  }
}
