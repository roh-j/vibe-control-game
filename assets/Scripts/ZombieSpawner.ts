import { _decorator, Component, instantiate, Prefab, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ZombieSpawner")
export class ZombieSpawner extends Component {
  @property({ type: Prefab })
  public zombiePrefab: Prefab;

  spawnZombie(position: Vec3) {
    // 프리팹 인스턴스 생성
    const zombieNode = instantiate(this.zombiePrefab);
    zombieNode.active = true;

    zombieNode.setWorldPosition(position);
    this.node.addChild(zombieNode);
  }

  spawnMultipleZombies(positions: Vec3[]) {
    // 여러 위치에 좀비 생성
    positions.forEach((pos) => this.spawnZombie(pos));
  }
}
