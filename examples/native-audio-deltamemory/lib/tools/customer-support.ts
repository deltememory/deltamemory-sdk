/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionResponseScheduling } from '@google/genai';
import { FunctionCall } from '../state';

export const customerSupportTools: FunctionCall[] = [
  {
    name: 'save_to_memory',
    description: 'Save important information about the customer for future reference. Use this to remember preferences, issues, feedback, or any important details the customer shares.',
    parameters: {
      type: 'OBJECT',
      properties: {
        content: {
          type: 'STRING',
          description: 'The information to save about the customer. Be descriptive and include context.',
        },
      },
      required: ['content'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.SILENT,
  },
  {
    name: 'recall_memory',
    description: 'Retrieve relevant past information about the customer. Use this at the start of conversations or when you need context about the customer.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'What to search for in the customer\'s history. Can be general like "previous issues" or specific like "shipping preferences".',
        },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.SILENT,
  },
  {
    name: 'start_return',
    description: 'Starts the return process for an item, collecting necessary details from the user.',
    parameters: {
      type: 'OBJECT',
      properties: {
        orderId: {
          type: 'STRING',
          description: 'The ID of the order containing the item to be returned.',
        },
        itemName: {
          type: 'STRING',
          description: 'The name of the item the user wants to return.',
        },
        reason: {
          type: 'STRING',
          description: 'The reason the user is returning the item.',
        },
      },
      required: ['orderId', 'itemName', 'reason'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'get_order_status',
    description: 'Provides the current status of a user\'s order, searching by order ID or customer details.',
    parameters: {
      type: 'OBJECT',
      properties: {
        orderId: {
          type: 'STRING',
          description: 'The ID of the order to check. Ask for this first.',
        },
        customerName: {
          type: 'STRING',
          description: 'The name of the customer, if order ID is not available.',
        },
        customerEmail: {
          type: 'STRING',
          description: 'The email of the customer, if order ID is not available.',
        },
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'speak_to_representative',
    description: 'Escalates the conversation to a human customer support representative.',
    parameters: {
      type: 'OBJECT',
      properties: {
        reason: {
          type: 'STRING',
          description: 'A brief summary of the user\'s issue for the representative.',
        },
      },
      required: ['reason'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];
