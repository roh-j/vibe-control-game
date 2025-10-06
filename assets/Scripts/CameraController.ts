import { _decorator, Component, Node, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CameraController")
export class CameraController extends Component {
  @property({ type: Node })
  player: Node | null = null;

  @property({ type: Number })
  followSpeed: number = 5;

  private targetPosition: Vec3 = new Vec3();

  update(deltaTime: number) {
    if (!this.player) {
      return;
    }

    this.targetPosition.set(
      this.player.worldPosition.x,
      this.player.worldPosition.y,
      this.node.worldPosition.z
    );

    this.node.worldPosition = this.node.worldPosition.lerp(
      this.targetPosition,
      this.followSpeed * deltaTime
    );
  }
}
