import { _decorator, AudioClip, AudioSource, Component, director } from "cc";
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
    director.addPersistRootNode(this.node);

    this.bgmAudioSource = this.addComponent(AudioSource);
    this.sfxAudioSource = this.addComponent(AudioSource);

    this.playBGM("bgm_lobby");
  }

  public playBGM(name: string) {
    const clip = this.bgmClips.find((item) => item.name === name);

    if (
      !clip ||
      (this.bgmAudioSource.clip === clip && this.bgmAudioSource.playing)
    ) {
      return;
    }

    // 기존 BGM이 재생 중이면 먼저 정지
    if (this.bgmAudioSource.playing) {
      this.bgmAudioSource.stop();
    }

    // 새 BGM 설정 및 재생
    this.bgmAudioSource.clip = clip;
    this.bgmAudioSource.loop = true;
    this.bgmAudioSource.volume = 0.5;
    this.bgmAudioSource.play();
  }

  public stopBGM(fadeTime: number = 1) {
    if (!this.bgmAudioSource.clip) {
      return;
    }

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
