declare const window: any;
declare const _web3neo: any;
declare const webkit: any;
import { PLATFORM, VERSION } from './constants/common';
import { EVENT } from './constants/commands';
import { onEvent, EventName } from './modules/eventListener';
import { get } from 'lodash';

const messageQueue = {};

interface Message {
  platform: string;
  version: string;
  messageId: string;
  command: string;
  eventName?: EventName;
  data: any;
  error: string;
}

window._web3neo = window._web3neo ? window._web3neo : {};
_web3neo.receiveMessage = (message: Message) => {
  try {
    if (typeof message === 'string') {
      message = JSON.parse(message);
    }
    const { platform, messageId, command, data, error, eventName } = message;

    if (platform !== PLATFORM) {
      return;
    }

    if (command === EVENT) {
      onEvent(eventName, data);
      return;
    }

    const messageResolver = messageQueue[messageId + command];
    if (messageResolver) {
      const { resolve, timeout, reject } = messageResolver;
      timeout && clearTimeout(timeout);
      error ? reject(error) : resolve(data);
    }
  } catch (err) {}
};

interface SendMessageArgs {
  command: string;
  data?: any;
  timeout?: number;
}

export function sendMessage({command, data, timeout}: SendMessageArgs): Promise<any> {
  const messageId = Date.now() + Math.random();
  const message = {
    platform: PLATFORM,
    version: VERSION,
    messageId,
    command,
    data,
  };

  return new Promise((resolve, reject) => {
    const messageHandler = get(window, 'window._web3neo.messageHandler');
    const webkitPostMessage = get(window, 'window.webkit.messageHandlers.sendMessageHandler.postMessage');
    if (messageHandler) {
      messageHandler(JSON.stringify(message));
    } else if (webkitPostMessage) {
      webkitPostMessage(message);
    } else {
      reject(`web3neo provider not found.`);
    }

    if (messageHandler || webkitPostMessage) {
      messageQueue[messageId + command] = {
        resolve,
        reject,
        timeout: timeout && setTimeout(() => {
          delete messageQueue[messageId + command];
          reject('Request timeout.');
        }, timeout),
      };
    }
  });
}
