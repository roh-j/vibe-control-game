import { _decorator, Component, director } from "cc";
import { SoundManager } from "./SoundManager";
const { ccclass } = _decorator;

@ccclass("StartButton")
export class StartButton extends Component {
  startGame() {
    SoundManager.Instance.playBGM("bgm_game");
    director.loadScene("GameScene");
  }
}
