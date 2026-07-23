// Speech Recognition and Synthesis utility for Open-Mic and Voice Assistant

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export class VoiceController {
  private recognition: any = null;
  private isListening = false;
  private isOpenMicMode = false;
  private wakeWord = 'trillion';
  private onWakeWordDetectedCallback: (() => void) | null = null;
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onStatusChangeCallback: ((status: 'idle' | 'listening' | 'wake_word_detected' | 'error') => void) | null = null;
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptChunk;
            } else {
              interimTranscript += transcriptChunk;
            }
          }

          const combined = (finalTranscript || interimTranscript).toLowerCase().trim();

          // Check for wake word in open mic mode
          if (this.isOpenMicMode) {
            if (combined.includes('hey ' + this.wakeWord) || combined.includes(this.wakeWord)) {
              if (this.onWakeWordDetectedCallback) {
                this.onWakeWordDetectedCallback();
              }
              // Extract text after wake word
              const wakeIndex = combined.lastIndexOf(this.wakeWord);
              const spokenAfterWake = combined.substring(wakeIndex + this.wakeWord.length).trim();
              if (spokenAfterWake && this.onTranscriptCallback && finalTranscript) {
                this.onTranscriptCallback(spokenAfterWake, true);
              }
              return;
            }
          }

          if (this.onTranscriptCallback) {
            this.onTranscriptCallback(finalTranscript || interimTranscript, !!finalTranscript);
          }
        };

        this.recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback('error');
          }
        };

        this.recognition.onend = () => {
          // Restart if open mic mode is enabled
          if (this.isOpenMicMode && this.isListening) {
            try {
              this.recognition.start();
            } catch (e) {
              console.warn('Failed to restart recognition:', e);
            }
          } else {
            this.isListening = false;
            if (this.onStatusChangeCallback) {
              this.onStatusChangeCallback('idle');
            }
          }
        };
      }
    }
  }

  public setWakeWord(word: string) {
    this.wakeWord = word.toLowerCase().trim();
  }

  public setCallbacks(options: {
    onWakeWordDetected?: () => void;
    onTranscript?: (transcript: string, isFinal: boolean) => void;
    onStatusChange?: (status: 'idle' | 'listening' | 'wake_word_detected' | 'error') => void;
  }) {
    if (options.onWakeWordDetected) this.onWakeWordDetectedCallback = options.onWakeWordDetected;
    if (options.onTranscript) this.onTranscriptCallback = options.onTranscript;
    if (options.onStatusChange) this.onStatusChangeCallback = options.onStatusChange;
  }

  public startListening(openMic = false) {
    if (!this.recognition) return false;
    this.isOpenMicMode = openMic;
    try {
      this.recognition.start();
      this.isListening = true;
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('listening');
      }
      return true;
    } catch (e) {
      console.warn('Recognition already started or error:', e);
      return false;
    }
  }

  public stopListening() {
    if (!this.recognition) return;
    this.isOpenMicMode = false;
    this.isListening = false;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn('Error stopping recognition:', e);
    }
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback('idle');
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;
    this.stopSpeaking();

    // Clean markdown symbols for speech readability
    const cleanText = text
      .replace(/[*#_`~\[\]\(\)]/g, ' ')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) return;

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 1.0;

    // Pick pleasant English voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (preferredVoice) {
      this.currentUtterance.voice = preferredVoice;
    }

    if (onEnd) {
      this.currentUtterance.onend = onEnd;
      this.currentUtterance.onerror = onEnd;
    }

    this.synth.speak(this.currentUtterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }
}

export const voiceController = new VoiceController();
