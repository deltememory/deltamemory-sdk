/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../../lib/genai-live-client';
import { LiveConnectConfig, Modality, LiveServerToolCall } from '@google/genai';
import { AudioStreamer } from '../../lib/audio-streamer';
import { audioContext } from '../../lib/utils';
import VolMeterWorket from '../../lib/worklets/vol-meter';
import { useLogStore, useSettings, useUserStore } from '@/lib/state';
import { saveToMemory, recallMemory } from '@/lib/deltamemory';

export type UseLiveApiResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;

  connect: () => Promise<void>;
  disconnect: () => void;
  connected: boolean;

  volume: number;
};

export function useLiveApi({
  apiKey,
}: {
  apiKey: string;
}): UseLiveApiResults {
  const { model } = useSettings();
  const client = useMemo(() => new GenAILiveClient(apiKey, model), [apiKey, model]);

  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [volume, setVolume] = useState(0);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConnectConfig>({});

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          })
          .catch(err => {
            console.error('Error adding worklet:', err);
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onOpen = () => {
      setConnected(true);
    };

    const onClose = () => {
      setConnected(false);
    };

    const stopAudioStreamer = () => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
      }
    };

    const onAudio = (data: ArrayBuffer) => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.addPCM16(new Uint8Array(data));
      }
    };

    // Bind event listeners
    client.on('open', onOpen);
    client.on('close', onClose);
    client.on('interrupted', stopAudioStreamer);
    client.on('audio', onAudio);

    const onToolCall = async (toolCall: LiveServerToolCall) => {
      const functionResponses: any[] = [];
      const currentUser = useUserStore.getState().currentUser;

      for (const fc of toolCall.functionCalls) {
        // Log the function call trigger
        const triggerMessage = `Triggering function call: **${
          fc.name
        }**\n\`\`\`json\n${JSON.stringify(fc.args, null, 2)}\n\`\`\``;
        useLogStore.getState().addTurn({
          role: 'system',
          text: triggerMessage,
          isFinal: true,
        });

        let response: any = { result: 'ok' };

        // Handle memory-related tool calls
        if (fc.name === 'save_to_memory') {
          const args = fc.args as { content: string };
          const result = await saveToMemory(currentUser.id, args.content);
          response = result;
        } else if (fc.name === 'recall_memory') {
          const args = fc.args as { query: string };
          const result = await recallMemory(currentUser.id, args.query);
          response = result;
        } else if (fc.name === 'get_order_status') {
          // Mock order status response
          const args = fc.args as { orderId?: string; customerName?: string };
          response = {
            orderId: args.orderId || 'ORD-12345',
            status: 'In Transit',
            estimatedDelivery: 'January 21, 2026',
            carrier: 'FedEx',
            trackingNumber: 'FX123456789',
          };
        } else if (fc.name === 'start_return') {
          // Mock return initiation
          const args = fc.args as { orderId: string; itemName: string; reason: string };
          response = {
            returnId: `RET-${Date.now()}`,
            status: 'Return Initiated',
            instructions: 'A prepaid shipping label has been sent to your email. Please pack the item securely and drop it off at any FedEx location.',
            refundEstimate: '5-7 business days after we receive the item',
          };
          // Save return to memory
          await saveToMemory(currentUser.id, `Customer initiated return for ${args.itemName} from order ${args.orderId}. Reason: ${args.reason}`);
        } else if (fc.name === 'speak_to_representative') {
          const args = fc.args as { reason: string };
          response = {
            status: 'Escalated',
            message: 'A customer support representative will be with you shortly. Estimated wait time: 2-3 minutes.',
            ticketId: `TKT-${Date.now()}`,
          };
          // Save escalation to memory
          await saveToMemory(currentUser.id, `Customer requested to speak with a representative. Reason: ${args.reason}`);
        }

        // Prepare the response
        functionResponses.push({
          id: fc.id,
          name: fc.name,
          response,
        });
      }

      // Log the function call response
      if (functionResponses.length > 0) {
        const responseMessage = `Function call response:\n\`\`\`json\n${JSON.stringify(
          functionResponses,
          null,
          2,
        )}\n\`\`\``;
        useLogStore.getState().addTurn({
          role: 'system',
          text: responseMessage,
          isFinal: true,
        });
      }

      client.sendToolResponse({ functionResponses: functionResponses });
    };

    client.on('toolcall', onToolCall);

    return () => {
      // Clean up event listeners
      client.off('open', onOpen);
      client.off('close', onClose);
      client.off('interrupted', stopAudioStreamer);
      client.off('audio', onAudio);
      client.off('toolcall', onToolCall);
    };
  }, [client]);

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error('config has not been set');
    }
    client.disconnect();
    await client.connect(config);
  }, [client, config]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  return {
    client,
    config,
    setConfig,
    connect,
    connected,
    disconnect,
    volume,
  };
}