import { _decorator, Component, director } from "cc";
const { ccclass } = _decorator;

@ccclass("StartButton")
export class StartButton extends Component {
  startGame() {
    director.loadScene("GameScene");
  }
}
