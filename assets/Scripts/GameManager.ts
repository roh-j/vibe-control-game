import { _decorator, Component, Vec3 } from "cc";
const { ccclass } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  public static Instance: GameManager;

  public inputDirection: Vec3 = new Vec3();

  onLoad() {
    GameManager.Instance = this;
  }
}
