export type Chat = {
  document_id: string;
  batch_order: number;
  question: string;
};

export type ChatResponse = {
  user_message: string;
  intent: string;
  ai_response: string;
  conversation_id: string;
};

export type GetChatResponse = {
  id: string;
  document_id: string;
  user_email: string;
  messages: any[];
};

export type DeleteChatResponse = {
  id: string;
  document_id: string;
  user_email: string;
  message: any;
};
