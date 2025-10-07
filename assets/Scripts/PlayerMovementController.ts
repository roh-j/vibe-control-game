import { GameManager } from "./GameManager";
import {
  _decorator,
  Component,
  EventTouch,
  Input,
  Vec2,
  UITransform,
  view,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerMovementController")
export class PlayerMovementController extends Component {
  @property({ type: Number })
  private deadZone: number = 50; // 입력 무시 최소 거리 (조이스틱 DeadZone)

  private screenPos: Vec2; // 노드 중심 기준 스크린 좌표

  start() {
    const worldPos = this.node.worldPosition;
    const canvas = GameManager.Instance.canvas;
    const uiTransform = canvas.getComponent(UITransform);

    // 월드 좌표 → 캔버스 로컬 좌표 (중앙 기준)
    const uiPos = uiTransform.convertToNodeSpaceAR(worldPos);
    const visibleSize = view.getVisibleSize();

    // 화면 좌표로 변환 (0,0 기준 → 좌측 하단)
    this.screenPos = new Vec2(
      uiPos.x + visibleSize.width / 2,
      uiPos.y + visibleSize.height / 2
    );

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

    // 터치 위치 기준 방향 계산
    const direction = new Vec2(
      touchPos.x - this.screenPos.x,
      touchPos.y - this.screenPos.y
    );

    // DeadZone 안이면 입력 무시
    if (direction.length() < this.deadZone) {
      GameManager.Instance.inputDirection.set(0, 0, 0);
      return;
    }

    direction.normalize();
    // 단위 벡터로 변환 후 GameManager에 저장
    GameManager.Instance.inputDirection.set(direction.x, direction.y, 0);
  }
}
