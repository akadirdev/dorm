export interface BaseConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
