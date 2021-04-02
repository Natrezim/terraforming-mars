import {LogMessageType} from './LogMessageType';
import {LogMessageData} from './LogMessageData';
import {Message} from './Message';
import {PlayerId} from './Player';

export class LogMessage implements Message {
  public timestamp = Date.now();
  constructor(
    public type: LogMessageType,
    public message: string,
    public data: Array<LogMessageData>,
    public playerId?: PlayerId) {}
}
