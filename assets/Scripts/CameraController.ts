import { _decorator, Component, Node, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CameraController")
export class CameraController extends Component {
  @property({ type: Node })
  player: Node | null = null;

  @property({ type: Number })
  followSpeed: number = 5;

  // 카메라가 이동할 목표 위치
  private targetPosition: Vec3 = new Vec3();

  update(deltaTime: number) {
    if (!this.player) {
      return;
    }

    // 목표 위치를 플레이어 위치에 맞추되, z축은 현재 카메라 z 유지
    this.targetPosition.set(
      this.player.worldPosition.x,
      this.player.worldPosition.y,
      this.node.worldPosition.z
    );

    // 현재 위치 → 목표 위치로 lerp(선형보간)하여 부드럽게 이동
    this.node.worldPosition = this.node.worldPosition.lerp(
      this.targetPosition,
      this.followSpeed * deltaTime
    );
  }
}
