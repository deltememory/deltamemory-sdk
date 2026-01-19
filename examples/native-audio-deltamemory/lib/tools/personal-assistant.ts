/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const personalAssistantTools: FunctionCall[] = [
  {
    name: 'create_calendar_event',
    description: 'Creates a new event in the user\'s calendar.',
    parameters: {
      type: 'OBJECT',
      properties: {
        summary: {
          type: 'STRING',
          description: 'The title or summary of the event.',
        },
        location: {
          type: 'STRING',
          description: 'The location of the event.',
        },
        startTime: {
          type: 'STRING',
          description: 'The start time of the event in ISO 8601 format.',
        },
        endTime: {
          type: 'STRING',
          description: 'The end time of the event in ISO 8601 format.',
        },
      },
      required: ['summary', 'startTime', 'endTime'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'send_email',
    description: 'Sends an email to a specified recipient.',
    parameters: {
      type: 'OBJECT',
      properties: {
        recipient: {
          type: 'STRING',
          description: 'The email address of the recipient.',
        },
        subject: {
          type: 'STRING',
          description: 'The subject line of the email.',
        },
        body: {
          type: 'STRING',
          description: 'The body content of the email.',
        },
      },
      required: ['recipient', 'subject', 'body'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'set_reminder',
    description: 'Sets a reminder for the user.',
    parameters: {
      type: 'OBJECT',
      properties: {
        task: {
          type: 'STRING',
          description: 'The task for the reminder.',
        },
        time: {
          type: 'STRING',
          description: 'The time for the reminder in ISO 8601 format.',
        },
      },
      required: ['task', 'time'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];
