import { _decorator, Component, EventTouch, Input, Vec2 } from "cc";
import { GameManager } from "./GameManager";
const { ccclass } = _decorator;

@ccclass("Controller")
export class Controller extends Component {
  private stopZone: number = 50;

  start() {
    this.node.on(Input.EventType.TOUCH_START, this.onTouch, this);
    this.node.on(Input.EventType.TOUCH_MOVE, this.onTouch, this);
  }

  onDestroy() {
    this.node.off(Input.EventType.TOUCH_START, this.onTouch, this);
    this.node.off(Input.EventType.TOUCH_MOVE, this.onTouch, this);
  }

  private onTouch(event: EventTouch) {
    const touchPos = event.getUILocation();
    const worldPos = this.node.getWorldPosition();

    const direction = new Vec2(
      touchPos.x - worldPos.x,
      touchPos.y - worldPos.y
    );

    if (direction.length() < this.stopZone) {
      GameManager.Instance.inputDirection.set(0, 0, 0);
      return;
    }

    direction.normalize();
    GameManager.Instance.inputDirection.set(direction.x, direction.y, 0);
  }
}
