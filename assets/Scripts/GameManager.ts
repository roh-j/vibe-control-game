import { _decorator, Component, director, Node } from "cc";
const { ccclass } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  private static _instance: GameManager;

  public static get Instance(): GameManager {
    if (!this._instance) {
      const node = new Node("GameManager");
      this._instance = node.addComponent(GameManager);
      director.getScene().addChild(node);
    }

    return this._instance;
  }
}
