import { _decorator, Component, Vec3 } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("CameraController")
export class CameraController extends Component {
  @property({ type: Number })
  followSpeed: number = 5;

  // 카메라가 이동할 목표 위치
  private followPosition: Vec3 = new Vec3();

  update(deltaTime: number) {
    const player = GameManager.Instance.player.node;

    // 목표 위치를 플레이어 위치에 맞추되, z축은 현재 카메라 z 유지
    this.followPosition.set(
      player.getWorldPosition().x,
      player.getWorldPosition().y,
      this.node.getWorldPosition().z
    );

    // 현재 위치 → 목표 위치로 lerp(선형보간)하여 부드럽게 이동
    this.node.worldPosition = this.node
      .getWorldPosition()
      .lerp(this.followPosition, this.followSpeed * deltaTime);
  }
}
