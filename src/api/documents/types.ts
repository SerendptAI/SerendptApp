export type Document = {
  document_id: string;
  user_email: string;
  document_title: string;
  original_filename: string;
  uploaded_at: string;
  last_read_position: number;
};

export type DocumentBatch = {
  document_id: string;
  batch_title: string;
  batch_content: {
    text: string;
    markdown: string;
  };
  batch_order: number;
};

export type GetDocumentsByEmailResponse = Document[];
export type GetDocumentBatchesContentResponse = DocumentBatch[];

export type UploadDocumentResponse = {
  document_id: string;
  user_email: string;
  document_title: string;
  original_filename: string;
  uploaded_at: string;
  last_read_position: number;
};

export type UploadDocumentVariables = {
  document: ReactNativeFile;
  user_email: string;
};

export type ReactNativeFile = {
  uri: string;
  type: string;
  name: string;
};

export type DeleteDocumentResponse = {
  message: string;
};

export type DeleteDocumentVariables = {
  documentId: string;
};

export type EditDocumentResponse = {
  message: string;
};

export type EditDocumentVariables = {
  documentId: string;
  documentTitle: string;
};
export type ExplainTermVariables = {
  documentId: string;
  batch_order: number;
  term: string;
};

export type ExplainTermResponse = {
  term: string;
  actual_meaning: string;
  contextual_meaning: string;
};

export type AudioStreamVariables = {
  batch_order: number;
  documentId: string;
  language: string;
  speaker: string;
};

export type AudioStreamResponse = {
  batch_order: number;
  batch_title: string;
  audio_base64: string;
};

export type GetAudioVoicesResponse = {
  voices: [];
};