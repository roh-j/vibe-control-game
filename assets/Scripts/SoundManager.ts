import { _decorator, AudioClip, AudioSource, Component } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SoundManager")
export class SoundManager extends Component {
  @property({ type: [AudioClip] })
  public sfxClips: AudioClip[] = [];

  @property({ type: [AudioClip] })
  public bgmClips: AudioClip[] = [];

  public static Instance: SoundManager;
  private audioSource: AudioSource;

  onLoad() {
    if (SoundManager.Instance) {
      this.destroy();
      return;
    }

    // 싱글톤 설정
    SoundManager.Instance = this;
    this.audioSource = this.getComponent(AudioSource);

    this.playBGM();
  }

  public playBGM() {
    this.audioSource.clip = this.bgmClips[0];
    this.audioSource.loop = true;
    this.audioSource.volume = 0.5;
    this.audioSource.play();
  }

  public stopBGM(fadeTime: number = 1) {
    const startVolume = this.audioSource.volume;

    let elapsed = 0;

    const fadeOut = () => {
      elapsed += 0.016;

      const t = Math.min(elapsed / fadeTime, 1);

      this.audioSource.volume = startVolume * (1 - t);

      if (t < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        this.audioSource.stop(); // 0 이 되면 정지
        this.audioSource.volume = startVolume;
      }
    };

    fadeOut();
  }

  public playSFX() {
    this.audioSource.playOneShot(this.sfxClips[0], 2);
  }
}
