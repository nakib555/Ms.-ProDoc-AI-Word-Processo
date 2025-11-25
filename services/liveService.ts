import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

export class LiveService {
  private client: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(
    onTranscription: (text: string) => void,
    onError: (error: Error) => void,
    onClose: () => void
  ) {
    if (this.isConnected) return;

    try {
      // Initialize Audio Context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      // Get Microphone Stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      // Initialize Session
      this.session = await this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO], // Audio response is required by API, but we will ignore it
          inputAudioTranscription: {}, // Enable transcription of user input
          systemInstruction: "You are a precise dictation assistant. Your only task is to transcribe the user's speech exactly. Do not reply, do not chat, and do not generate audio output.",
        },
        callbacks: {
          onopen: () => {
            console.log("Dictation Session Opened");
            this.isConnected = true;
            // Start streaming only after session is ready
            this.startAudioStreaming();
          },
          onmessage: (message: LiveServerMessage) => {
            // We only care about the input transcription (what the user said)
            const transcript = message.serverContent?.inputTranscription?.text;
            if (transcript) {
              onTranscription(transcript);
            }
          },
          onclose: () => {
            console.log("Dictation Session Closed");
            this.cleanup();
            onClose();
          },
          onerror: (err) => {
            console.error("Dictation Error:", err);
            this.cleanup();
            onError(new Error("Connection error"));
          }
        }
      });

    } catch (error: any) {
      console.error("Failed to start dictation:", error);
      this.cleanup();
      onError(error);
    }
  }

  private startAudioStreaming() {
    if (!this.audioContext || !this.stream || !this.session) return;

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isConnected || !this.session) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      this.session.sendRealtimeInput({ media: pcmBlob });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  disconnect() {
    if (this.session) {
      this.session.close();
    }
    this.cleanup();
  }

  private cleanup() {
    this.isConnected = false;
    this.session = null;

    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return {
      data: this.base64EncodeInt16(int16),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private base64EncodeInt16(int16: Int16Array): string {
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export const liveService = new LiveService();