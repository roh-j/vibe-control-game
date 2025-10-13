import { _decorator, Component, instantiate, Node, Prefab } from "cc";
import { Bullet } from "./Bullet";
const { ccclass, property } = _decorator;

@ccclass("BulletSpawner")
export class BulletSpawner extends Component {
  @property({ type: Prefab })
  public bulletPrefab: Prefab = null!;

  private bulletPool: Node[] = [];

  public getBullet(): Node {
    let bulletNode = this.bulletPool.find((item) => !item.active);

    if (!bulletNode) {
      bulletNode = instantiate(this.bulletPrefab);

      this.node.parent.addChild(bulletNode);
      this.bulletPool.push(bulletNode);
    }

    bulletNode.active = true;
    return bulletNode;
  }

  public returnBullet(bullet: Node) {
    bullet.active = false;
  }

  public spawnBullet(targetNode: Node) {
    const bulletNode = this.getBullet();
    const bulletComp = bulletNode.getComponent(Bullet);
    bulletComp.init(targetNode);
  }
}
