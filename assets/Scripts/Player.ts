import { _decorator, Animation, Component } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
  @property({
    type: GameManager,
    tooltip: "게임 매니저 인스턴스",
  })
  public gameManager: GameManager = GameManager.Instance;

  public animation: Animation;

  start() {
    this.animation = this.getComponent(Animation);
    this.animation.play("idle");

    console.log("GameManager instance:", this.gameManager);
  }

  update(deltaTime: number) {}
}
