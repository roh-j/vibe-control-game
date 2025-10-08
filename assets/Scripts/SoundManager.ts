import { _decorator, AudioClip, AudioSource, Component } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SoundManager")
export class SoundManager extends Component {
  @property({ type: [AudioClip] })
  public sfxClips: AudioClip[] = [];

  @property({ type: [AudioClip] })
  public bgmClips: AudioClip[] = [];

  public static Instance: SoundManager;
  private bgmAudioSource: AudioSource;
  private sfxAudioSource: AudioSource;

  onLoad() {
    if (SoundManager.Instance) {
      this.destroy();
      return;
    }

    // 싱글톤 설정
    SoundManager.Instance = this;
    this.bgmAudioSource = this.addComponent(AudioSource);
    this.sfxAudioSource = this.addComponent(AudioSource);

    this.playBGM();
  }

  public playBGM() {
    this.bgmAudioSource.clip = this.bgmClips[0];
    this.bgmAudioSource.loop = true;
    this.bgmAudioSource.volume = 0.5;
    this.bgmAudioSource.play();
  }

  public stopBGM(fadeTime: number = 1) {
    const startVolume = this.bgmAudioSource.volume;

    let elapsed = 0;

    const fadeOut = () => {
      elapsed += 0.016;

      const t = Math.min(elapsed / fadeTime, 1);

      this.bgmAudioSource.volume = startVolume * (1 - t);

      if (t < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        this.bgmAudioSource.stop(); // 0 이 되면 정지
        this.bgmAudioSource.volume = startVolume;
      }
    };

    fadeOut();
  }

  public playSFX() {
    this.sfxAudioSource.playOneShot(this.sfxClips[0], 2);
  }
}
