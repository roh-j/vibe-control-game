import { GameManager } from "./GameManager";
import {
  _decorator,
  Component,
  EventTouch,
  Input,
  UITransform,
  Vec3,
  CCInteger,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerMovementController")
export class PlayerMovementController extends Component {
  @property({ type: CCInteger })
  private deadZone: number = 60; // 입력 무시 최소 거리

  start() {
    // 터치 이벤트 등록
    this.node.on(Input.EventType.MOUSE_DOWN, this.onTouch, this);
    this.node.on(Input.EventType.TOUCH_START, this.onTouch, this);
  }

  onDestroy() {
    // 이벤트 해제
    this.node.off(Input.EventType.MOUSE_DOWN, this.onTouch, this);
    this.node.off(Input.EventType.TOUCH_START, this.onTouch, this);
  }

  private onTouch(event: EventTouch) {
    // 터치 위치 (스크린 좌표)
    const touchPos = event.getUILocation();

    // Canvas 기준 좌표로 변환
    const canvas = GameManager.Instance.canvas; // Canvas Node
    const uiTransform = canvas.getComponent(UITransform);
    const touchLocalPos = uiTransform.convertToNodeSpaceAR(
      new Vec3(touchPos.x, touchPos.y, 0)
    );

    // 플레이어 노드 기준으로 상대 좌표 계산
    const playerLocalPos = this.node.getPosition();
    const delta = touchLocalPos.clone().subtract(playerLocalPos);

    const dist = delta.length();

    // DeadZone 체크
    if (dist < this.deadZone) {
      GameManager.Instance.setInputDirection(new Vec3(0, 0, 0));
      return;
    }

    delta.normalize();
    GameManager.Instance.setInputDirection(new Vec3(delta.x, delta.y, 0));
  }
}
