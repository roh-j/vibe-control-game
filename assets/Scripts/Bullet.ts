import { _decorator, BoxCollider2D, Component, Node, Vec3 } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
  @property({ type: Number })
  public speed: number = 800;

  private target: Node;

  public init(targetNode: Node) {
    this.target = targetNode;

    const collider = this.getComponent(BoxCollider2D);
    collider.enabled = true;

    // 플레이어 위치에서 발사
    const playerPos = GameManager.Instance.player.node.getWorldPosition();
    this.node.setWorldPosition(playerPos);
    this.node.active = true;
  }

  update(dt: number) {
    if (!this.target || !this.target.isValid) {
      return;
    }

    const currentPos = this.node.getWorldPosition();
    const targetPos = this.target.getWorldPosition();

    // 타겟 위치 방향 계산 (타겟팅)
    const direction = targetPos.clone().subtract(currentPos).normalize();

    // 이동
    const move = direction.multiplyScalar(this.speed * dt);

    const angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
    this.node.angle = angle;

    const newPos = currentPos.add(move);
    this.node.setWorldPosition(newPos);

    const dist = Vec3.distance(
      this.node.getWorldPosition(),
      this.target.getWorldPosition()
    );

    if (dist < 50) {
      this.returnBullet();
    }
  }

  returnBullet() {
    const collider = this.getComponent(BoxCollider2D);
    collider.enabled = false;

    this.node.active = false;
    this.target = null;
    GameManager.Instance.bulletSpawner.returnBullet(this.node);
  }
}
