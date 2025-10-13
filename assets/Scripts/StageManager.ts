import { _decorator, Component, Vec3 } from "cc";
import { GameManager } from "./GameManager";
import { SoundManager } from "./SoundManager";
const { ccclass } = _decorator;

export enum MapType {
  Desert = "DesertMap",
  Grass = "GrassMap",
}

@ccclass("StageManager")
export class StageManager extends Component {
  private currentStage: number = 1;

  public startStage(stage: number) {
    this.currentStage = stage;

    GameManager.Instance.player.node.setPosition(new Vec3(0, 0, 0));
    GameManager.Instance.setInputDirection(new Vec3(0, 0, 0));

    switch (stage) {
      case 1:
        SoundManager.Instance.playBGM("bgm_game_grass");

        GameManager.Instance.zombieSpawner.spawnMultipleZombies([
          new Vec3(700, 500, 0),
          new Vec3(800, 700, 0),
          new Vec3(-900, -300, 0),
          new Vec3(-1000, -700, 0),
          new Vec3(200, 900, 0),
        ]);

        this.switchMap(MapType.Grass);
        break;
      case 2:
        SoundManager.Instance.playBGM("bgm_game_desert");

        GameManager.Instance.zombieSpawner.spawnMultipleZombies([
          new Vec3(700, 500, 0),
          new Vec3(800, 700, 0),
          new Vec3(-900, -300, 0),
          new Vec3(-1000, -700, 0),
          new Vec3(200, 900, 0),
        ]);

        this.switchMap(MapType.Desert);
        break;
      default:
        GameManager.Instance.gameEnd();
        break;
    }
  }

  public onZombieKilled() {
    const aliveZombies = GameManager.Instance.zombieSpawner.zombies.length;

    if (aliveZombies === 0) {
      this.nextStage();
    }
  }

  nextStage() {
    this.startStage(this.currentStage + 1);
  }

  switchMap(mapType: MapType) {
    GameManager.Instance.ground.children.forEach(
      (child) => (child.active = false)
    );

    const targetMap = GameManager.Instance.ground.getChildByName(mapType);

    if (targetMap) {
      targetMap.active = true;
    }
  }
}
