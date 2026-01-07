import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ApiConfig } from '../common/config/config';
import { ClientOptions } from 'openai/client';
import { askCutPrompt, askGifPrompt, SystemPrompts } from './llm.properties';
import { Video } from '../video/video.model';
import {
  getVideoProcessType,
  VideoProcessType,
} from '../common/constants/video';

@Injectable()
export class LlmService {
  private openai: OpenAI;
  private readonly model: string;
  constructor() {
    const clientOps: ClientOptions = {
      apiKey: ApiConfig.OPENAI_API_KEY,
    };

    if (ApiConfig.OPENAI_BASE_URL) {
      clientOps.baseURL = ApiConfig.OPENAI_BASE_URL;
    }

    this.openai = new OpenAI(clientOps);
    this.model = ApiConfig.OPENAI_AI_MODEL;
  }

  async ask(prompt: string) {
    return this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: SystemPrompts,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'video.createGif',
            description: 'Create a GIF from a video',
            parameters: {
              type: 'object',
              properties: {
                transactionId: { type: 'string' },
                videoPath: { type: 'string' },
                isUrl: { type: 'boolean' },
                start: { type: 'integer' },
                end: { type: 'integer' },
              },
              oneOf: [
                {
                  required: [
                    'videoUrl',
                    'transactionId',
                    'start',
                    'end',
                    'isUrl',
                  ],
                },
              ],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'video.cutVideo',
            description: 'Cut the video',
            parameters: {
              type: 'object',
              properties: {
                transactionId: { type: 'string' },
                videoPath: { type: 'string' },
                isUrl: { type: 'boolean' },
                start: { type: 'integer' },
                end: { type: 'integer' },
              },
              oneOf: [
                {
                  required: [
                    'videoPath',
                    'transactionId',
                    'isUrl',
                    'start',
                    'end',
                  ],
                },
              ],
            },
          },
        },
      ],
      tool_choice: 'auto',
    });
  }

  async askByVideo(video: Video) {
    const message =
      getVideoProcessType(video.processType) == VideoProcessType.GIF
        ? askGifPrompt
        : askCutPrompt;

    const prompt = message
      .replace('{videoPath}', video.path)
      .replace('{start}', String(video.startTime))
      .replace('{end}', String(video.endTime))
      .replace('{transactionId}', video.transactionId);
    return this.ask(prompt);
  }
}
