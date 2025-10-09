import { _decorator, Component, EventMouse, EventTouch, Input } from "cc";
import { GameManager } from "./GameManager";
const { ccclass } = _decorator;

@ccclass("PlayerAttackController")
export class PlayerAttackController extends Component {
  start() {
    this.node.on(Input.EventType.MOUSE_DOWN, this.onTouch, this);
    this.node.on(Input.EventType.TOUCH_START, this.onTouch, this);
  }

  onDestroy() {
    this.node.off(Input.EventType.MOUSE_DOWN, this.onTouch, this);
    this.node.off(Input.EventType.TOUCH_START, this.onTouch, this);
  }

  onTouch(event: EventMouse | EventTouch) {
    const player = GameManager.Instance.player;

    if (player) {
      player.attack();
    }
  }
}
