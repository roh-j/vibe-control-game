import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ZombieSpawner")
export class ZombieSpawner extends Component {
  @property({ type: Prefab })
  public zombiePrefab: Prefab;

  // 초기화
  public zombies: Node[] = [];

  spawnZombie(position: Vec3) {
    // 프리팹 인스턴스 생성
    const zombieNode = instantiate(this.zombiePrefab);
    zombieNode.active = true;

    zombieNode.setWorldPosition(position);
    this.node.addChild(zombieNode);

    this.zombies.push(zombieNode);
  }

  removeZombie(zombieNode: Node) {
    const index = this.zombies.indexOf(zombieNode);

    if (index !== -1) {
      this.zombies.splice(index, 1);
    }
  }

  spawnMultipleZombies(positions: Vec3[]) {
    // 여러 위치에 좀비 생성
    positions.forEach((pos) => this.spawnZombie(pos));
  }
}
