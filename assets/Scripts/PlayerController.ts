import { GameManager } from "./GameManager";
import {
  _decorator,
  Component,
  EventTouch,
  Input,
  Vec2,
  UITransform,
  Canvas,
  view,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
  @property({ type: Number })
  private deadZone: number = 50;

  private screenPosition: Vec2;

  start() {
    const worldPosition = this.node.worldPosition;
    const canvas = this.node.scene.getComponentInChildren(Canvas);
    const uiTransform = canvas.getComponent(UITransform);
    const uiPosition = uiTransform.convertToNodeSpaceAR(worldPosition);
    const visibleSize = view.getVisibleSize();

    this.screenPosition = new Vec2(
      uiPosition.x + visibleSize.width / 2,
      uiPosition.y + visibleSize.height / 2
    );

    this.node.on(Input.EventType.TOUCH_START, this.onTouch, this);
    this.node.on(Input.EventType.TOUCH_MOVE, this.onTouch, this);
    this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onDestroy() {
    this.node.off(Input.EventType.TOUCH_START, this.onTouch, this);
    this.node.off(Input.EventType.TOUCH_MOVE, this.onTouch, this);
    this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouch(event: EventTouch) {
    const touchPosition = event.getUILocation();

    const direction = new Vec2(
      touchPosition.x - this.screenPosition.x,
      touchPosition.y - this.screenPosition.y
    );

    if (direction.length() < this.deadZone) {
      GameManager.Instance.inputDirection.set(0, 0, 0);
      return;
    }

    direction.normalize();
    GameManager.Instance.inputDirection.set(direction.x, direction.y, 0);
  }

  private onTouchEnd(event: EventTouch) {}
}
